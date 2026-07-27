import { Peer } from "peerjs";

const MESSAGE_VERSION = 2;
const MAX_TIPS_IN_SNAPSHOT = 40;
const MAX_ROOM_MEMBERS = 8;
const TIP_RATE_WINDOW_MS = 10_000;
const TIP_RATE_LIMIT = 6;
const OUTBOX_RETRY_MS = 5_000;

function isTip(value) {
  return Boolean(
    value &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 80 &&
    typeof value.by === "string" &&
    value.by.length > 0 &&
    value.by.length <= 18 &&
    typeof value.text === "string" &&
    value.text.trim().length > 0 &&
    value.text.length <= 72 &&
    Number.isFinite(Number(value.createdAt)),
  );
}

function publicTip(tip) {
  return {
    id: tip.id,
    by: tip.by,
    text: tip.text,
    createdAt: Number(tip.createdAt),
  };
}

function safeHostId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : "";
}

function safeRoomToken(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{32,128}$/.test(value) ? value : "";
}

function createRoomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function roomParams(url = new URL(location.href)) {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  return {
    hostId: safeHostId(url.searchParams.get("host")),
    token: safeRoomToken(hash.get("token")),
  };
}

function validIceServers(value) {
  return (
    Array.isArray(value) &&
    value.every((server) => server && (typeof server.urls === "string" || Array.isArray(server.urls)))
  );
}

async function loadIceServers(fetchImpl = fetch) {
  const fallback = [{ urls: "stun:stun.cloudflare.com:3478" }];
  const endpoint = import.meta.env.VITE_TURN_CREDENTIALS_URL;
  if (!endpoint) return fallback;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetchImpl(endpoint, { credentials: "same-origin", signal: controller.signal });
    if (!response.ok) return fallback;
    const payload = await response.json();
    return validIceServers(payload.iceServers) ? payload.iceServers : fallback;
  } catch {
    return fallback;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function peerOptions(fetchImpl) {
  const options = {
    debug: import.meta.env.DEV ? 1 : 0,
    config: { iceServers: await loadIceServers(fetchImpl) },
  };
  if (import.meta.env.VITE_PEER_HOST) {
    options.host = import.meta.env.VITE_PEER_HOST;
    options.port = Number(import.meta.env.VITE_PEER_PORT) || 443;
    options.path = import.meta.env.VITE_PEER_PATH || "/";
    options.secure = import.meta.env.VITE_PEER_SECURE !== "false";
    options.key = import.meta.env.VITE_PEER_KEY || "peerjs";
  }
  return options;
}

export class P2PRoom extends EventTarget {
  constructor({ getSnapshot, fetchImpl = fetch }) {
    super();
    const params = roomParams();
    this.getSnapshot = getSnapshot;
    this.fetchImpl = fetchImpl;
    this.peer = null;
    this.selfId = "";
    this.hostId = params.hostId;
    this.roomToken = this.hostId ? params.token : createRoomToken();
    this.role = this.hostId ? "guest" : "host";
    this.connections = new Map();
    this.seen = new Set();
    this.pendingTips = new Map();
    this.rateWindows = new Map();
    this.retryTimer = null;
    this.reconnectTimer = null;
    this.destroyed = false;
  }

  async start() {
    if (this.role === "guest" && !this.roomToken) {
      throw new Error("邀請連結缺少房間安全 token");
    }
    this.emitStatus("connecting", "正在連接 P2P 房間");
    this.peer = new Peer(undefined, await peerOptions(this.fetchImpl));
    this.peer.on("open", (id) => this.handlePeerOpen(id));
    this.peer.on("connection", (connection) => this.handleIncomingConnection(connection));
    this.peer.on("disconnected", () => {
      this.emitStatus("connecting", "訊號中斷，正在重新連線");
      if (!this.peer.destroyed) this.peer.reconnect();
    });
    this.peer.on("error", (error) => this.handlePeerError(error));
    this.retryTimer = window.setInterval(() => this.flushOutbox(), OUTBOX_RETRY_MS);
  }

  handleIncomingConnection(connection) {
    const metadata = connection.metadata || {};
    const authorized =
      this.role === "host" &&
      metadata.app === "newworld-study-room" &&
      metadata.version === MESSAGE_VERSION &&
      metadata.token === this.roomToken;
    if (!authorized || this.connections.size >= MAX_ROOM_MEMBERS - 1) {
      connection.close();
      this.dispatchEvent(
        new CustomEvent("security-event", { detail: authorized ? "房間人數已滿" : "已拒絕未授權連線" }),
      );
      return;
    }
    this.bindConnection(connection);
  }

  handlePeerOpen(id) {
    this.selfId = id;
    if (this.role === "host") {
      this.hostId = id;
      this.emitStatus("online", "房間已開啟，等待夥伴加入");
      this.emitPresence(1);
      this.dispatchEvent(new CustomEvent("ready", { detail: this.getRoomInfo() }));
      return;
    }

    this.emitStatus("connecting", "正在加入夥伴的小木屋");
    this.connectToHost();
    this.dispatchEvent(new CustomEvent("ready", { detail: this.getRoomInfo() }));
  }

  connectToHost() {
    if (this.destroyed || !this.peer?.open || this.connections.get(this.hostId)?.open) return;
    const connection = this.peer.connect(this.hostId, {
      reliable: true,
      serialization: "json",
      metadata: {
        app: "newworld-study-room",
        version: MESSAGE_VERSION,
        token: this.roomToken,
      },
    });
    this.bindConnection(connection);
  }

  bindConnection(connection) {
    if (this.connections.has(connection.peer)) this.connections.get(connection.peer).close();
    this.connections.set(connection.peer, connection);
    connection.on("open", () => {
      if (this.role === "host") {
        const snapshot = this.getSnapshot();
        this.send(connection, {
          type: "snapshot",
          version: MESSAGE_VERSION,
          roomName: String(snapshot.roomName || "Study Room").slice(0, 24),
          tips: snapshot.tips.slice(0, MAX_TIPS_IN_SNAPSHOT).map(publicTip),
        });
        this.broadcastPresence();
        this.emitStatus("online", `${this.connections.size + 1} 人正在伴讀`);
      } else {
        this.emitStatus("online", "已加入 P2P 伴讀房");
        this.emitPresence(2);
        this.flushOutbox();
      }
    });
    connection.on("data", (message) => this.handleMessage(message, connection));
    connection.on("close", () => this.removeConnection(connection));
    connection.on("error", () => this.removeConnection(connection));
  }

  handleMessage(message, source) {
    if (!message || typeof message !== "object" || message.version !== MESSAGE_VERSION) return;
    if (message.type === "snapshot" && this.role === "guest") {
      const tips = Array.isArray(message.tips) ? message.tips.filter(isTip).map(publicTip) : [];
      const roomName = String(message.roomName || "Study Room")
        .trim()
        .slice(0, 24);
      this.dispatchEvent(new CustomEvent("snapshot", { detail: { roomName, tips } }));
      return;
    }
    if (message.type === "room-meta" && this.role === "guest") {
      const roomName = String(message.roomName || "Study Room")
        .trim()
        .slice(0, 24);
      this.dispatchEvent(new CustomEvent("room-meta", { detail: { roomName } }));
      return;
    }
    if (message.type === "presence" && this.role === "guest") {
      this.emitPresence(Math.max(1, Math.min(MAX_ROOM_MEMBERS, Number(message.count) || 1)));
      return;
    }
    if (message.type === "tip-ack" && this.role === "guest" && typeof message.id === "string") {
      if (this.pendingTips.delete(message.id)) {
        this.dispatchEvent(new CustomEvent("tip-delivery", { detail: { id: message.id, delivery: "sent" } }));
      }
      return;
    }
    if (message.type !== "tip" || !isTip(message.tip)) return;

    const tip = publicTip(message.tip);
    if (this.role === "host") {
      if (!this.allowTipFrom(source.peer)) {
        this.dispatchEvent(new CustomEvent("security-event", { detail: "已限制過於頻繁的 Tip" }));
        return;
      }
      this.send(source, { type: "tip-ack", version: MESSAGE_VERSION, id: tip.id });
      if (this.seen.has(tip.id)) return;
      this.seen.add(tip.id);
      this.dispatchEvent(new CustomEvent("tip", { detail: tip }));
      this.broadcast({ type: "tip", version: MESSAGE_VERSION, tip }, source.peer);
      return;
    }

    if (this.seen.has(tip.id)) return;
    this.seen.add(tip.id);
    this.dispatchEvent(new CustomEvent("tip", { detail: tip }));
  }

  allowTipFrom(peerId) {
    const now = Date.now();
    const windowStart = now - TIP_RATE_WINDOW_MS;
    const recent = (this.rateWindows.get(peerId) || []).filter((time) => time > windowStart);
    if (recent.length >= TIP_RATE_LIMIT) return false;
    recent.push(now);
    this.rateWindows.set(peerId, recent);
    return true;
  }

  sendTip(tip) {
    if (!isTip(tip)) return false;
    const cleanTip = publicTip(tip);
    this.seen.add(cleanTip.id);
    const message = { type: "tip", version: MESSAGE_VERSION, tip: cleanTip };
    if (this.role === "host") {
      this.broadcast(message);
      return true;
    }
    this.pendingTips.set(cleanTip.id, cleanTip);
    const host = this.connections.get(this.hostId);
    return this.send(host, message);
  }

  restoreOutbox(tips) {
    tips.filter(isTip).forEach((tip) => this.pendingTips.set(tip.id, publicTip(tip)));
    this.flushOutbox();
  }

  flushOutbox() {
    if (this.role !== "guest" || !this.pendingTips.size) return;
    const host = this.connections.get(this.hostId);
    if (!host?.open) return;
    this.pendingTips.forEach((tip) => this.send(host, { type: "tip", version: MESSAGE_VERSION, tip }));
  }

  sendRoomMeta(roomName) {
    if (this.role !== "host") return;
    this.broadcast({ type: "room-meta", version: MESSAGE_VERSION, roomName: String(roomName).trim().slice(0, 24) });
  }

  broadcast(message, exceptPeer = "") {
    this.connections.forEach((connection, peerId) => {
      if (peerId !== exceptPeer) this.send(connection, message);
    });
  }

  broadcastPresence() {
    const count = this.connections.size + 1;
    this.emitPresence(count);
    this.broadcast({ type: "presence", version: MESSAGE_VERSION, count });
  }

  send(connection, message) {
    if (!connection?.open) return false;
    try {
      connection.send(message);
      return true;
    } catch {
      return false;
    }
  }

  removeConnection(connection) {
    if (this.connections.get(connection.peer) !== connection) return;
    this.connections.delete(connection.peer);
    this.rateWindows.delete(connection.peer);
    if (this.role === "host") {
      this.broadcastPresence();
      this.emitStatus(
        "online",
        this.connections.size ? `${this.connections.size + 1} 人正在伴讀` : "房間已開啟，等待夥伴加入",
      );
    } else {
      this.emitPresence(1);
      this.emitStatus("offline", "與房主的連線已中斷，Tip 將在重連後送出");
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = window.setTimeout(() => this.connectToHost(), 1_500);
    }
  }

  handlePeerError(error) {
    const message =
      error?.type === "peer-unavailable"
        ? "找不到這間房，請向房主取得新的邀請連結"
        : "P2P 暫時無法連線，待送 Tip 會在重連後補送";
    this.emitStatus("offline", message);
    this.dispatchEvent(new CustomEvent("network-error", { detail: message }));
  }

  emitStatus(state, message) {
    this.dispatchEvent(new CustomEvent("status", { detail: { state, message } }));
  }

  emitPresence(count) {
    this.dispatchEvent(new CustomEvent("presence", { detail: count }));
  }

  getRoomInfo() {
    const invite = new URL(location.href);
    invite.search = "";
    invite.hash = "";
    invite.searchParams.set("host", this.hostId);
    invite.hash = new URLSearchParams({ token: this.roomToken }).toString();
    return {
      role: this.role,
      selfId: this.selfId,
      hostId: this.hostId,
      roomToken: this.roomToken,
      invite: invite.toString(),
    };
  }

  destroy() {
    this.destroyed = true;
    window.clearInterval(this.retryTimer);
    window.clearTimeout(this.reconnectTimer);
    this.connections.forEach((connection) => connection.close());
    this.connections.clear();
    this.peer?.destroy();
  }
}

export const p2pInternals = {
  isTip,
  publicTip,
  safeHostId,
  safeRoomToken,
  roomParams,
  validIceServers,
};
