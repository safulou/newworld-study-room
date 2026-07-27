import { Peer } from "peerjs";

const MESSAGE_VERSION = 1;
const MAX_TIPS_IN_SNAPSHOT = 40;

function isTip(value) {
  return value
    && typeof value.id === "string"
    && typeof value.text === "string"
    && value.text.trim().length > 0
    && value.text.length <= 72;
}

function safeHostId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : "";
}

function peerOptions() {
  const options = { debug: 1 };
  if (import.meta.env.VITE_PEER_HOST) {
    options.host = import.meta.env.VITE_PEER_HOST;
    options.port = Number(import.meta.env.VITE_PEER_PORT) || 443;
    options.path = import.meta.env.VITE_PEER_PATH || "/";
    options.secure = import.meta.env.VITE_PEER_SECURE !== "false";
    options.key = import.meta.env.VITE_PEER_KEY || "peerjs";
  }
  if (import.meta.env.VITE_TURN_URL) {
    options.config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: import.meta.env.VITE_TURN_URL,
          username: import.meta.env.VITE_TURN_USERNAME || "",
          credential: import.meta.env.VITE_TURN_CREDENTIAL || "",
        },
      ],
    };
  }
  return options;
}

export class P2PRoom extends EventTarget {
  constructor({ getSnapshot }) {
    super();
    this.getSnapshot = getSnapshot;
    this.peer = null;
    this.selfId = "";
    this.hostId = safeHostId(new URL(location.href).searchParams.get("host"));
    this.role = this.hostId ? "guest" : "host";
    this.connections = new Map();
    this.seen = new Set();
  }

  start() {
    this.emitStatus("connecting", "正在連接 P2P 房間");
    this.peer = new Peer(undefined, peerOptions());
    this.peer.on("open", (id) => this.handlePeerOpen(id));
    this.peer.on("connection", (connection) => {
      if (this.role !== "host") {
        connection.close();
        return;
      }
      this.bindConnection(connection);
    });
    this.peer.on("disconnected", () => {
      this.emitStatus("connecting", "訊號中斷，正在重新連線");
      if (!this.peer.destroyed) this.peer.reconnect();
    });
    this.peer.on("error", (error) => this.handlePeerError(error));
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
    const connection = this.peer.connect(this.hostId, {
      reliable: true,
      serialization: "json",
      metadata: { app: "newworld-study-room", version: MESSAGE_VERSION },
    });
    this.bindConnection(connection);
    this.dispatchEvent(new CustomEvent("ready", { detail: this.getRoomInfo() }));
  }

  bindConnection(connection) {
    if (this.connections.has(connection.peer)) {
      this.connections.get(connection.peer).close();
    }
    this.connections.set(connection.peer, connection);
    connection.on("open", () => {
      if (this.role === "host") {
        const snapshot = this.getSnapshot();
        this.send(connection, {
          type: "snapshot",
          roomName: String(snapshot.roomName || "Study Room").slice(0, 24),
          tips: snapshot.tips.slice(0, MAX_TIPS_IN_SNAPSHOT),
        });
        this.broadcastPresence();
        this.emitStatus("online", `${this.connections.size + 1} 人正在伴讀`);
      } else {
        this.emitStatus("online", "已加入 P2P 伴讀房");
        this.emitPresence(2);
      }
    });
    connection.on("data", (message) => this.handleMessage(message, connection));
    connection.on("close", () => this.removeConnection(connection));
    connection.on("error", () => this.removeConnection(connection));
  }

  handleMessage(message, source) {
    if (!message || typeof message !== "object") return;
    if (message.type === "snapshot" && this.role === "guest") {
      const tips = Array.isArray(message.tips) ? message.tips.filter(isTip) : [];
      const roomName = String(message.roomName || "Study Room").trim().slice(0, 24);
      this.dispatchEvent(new CustomEvent("snapshot", { detail: { roomName, tips } }));
      return;
    }
    if (message.type === "room-meta" && this.role === "guest") {
      const roomName = String(message.roomName || "Study Room").trim().slice(0, 24);
      this.dispatchEvent(new CustomEvent("room-meta", { detail: { roomName } }));
      return;
    }
    if (message.type === "presence" && this.role === "guest") {
      this.emitPresence(Math.max(1, Math.min(20, Number(message.count) || 1)));
      return;
    }
    if (message.type !== "tip" || !isTip(message.tip) || this.seen.has(message.tip.id)) return;

    this.seen.add(message.tip.id);
    this.dispatchEvent(new CustomEvent("tip", { detail: message.tip }));
    if (this.role === "host") this.broadcast(message, source.peer);
  }

  sendTip(tip) {
    if (!isTip(tip)) return false;
    this.seen.add(tip.id);
    const message = { type: "tip", version: MESSAGE_VERSION, tip };
    if (this.role === "host") {
      this.broadcast(message);
      return true;
    }
    const host = this.connections.get(this.hostId);
    return this.send(host, message);
  }

  sendRoomMeta(roomName) {
    if (this.role !== "host") return;
    this.broadcast({ type: "room-meta", roomName: String(roomName).trim().slice(0, 24) });
  }

  broadcast(message, exceptPeer = "") {
    this.connections.forEach((connection, peerId) => {
      if (peerId !== exceptPeer) this.send(connection, message);
    });
  }

  broadcastPresence() {
    const count = this.connections.size + 1;
    this.emitPresence(count);
    this.broadcast({ type: "presence", count });
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
    if (this.role === "host") {
      this.broadcastPresence();
      this.emitStatus("online", this.connections.size ? `${this.connections.size + 1} 人正在伴讀` : "房間已開啟，等待夥伴加入");
    } else {
      this.emitPresence(1);
      this.emitStatus("offline", "與房主的連線已中斷");
    }
  }

  handlePeerError(error) {
    const message = error?.type === "peer-unavailable"
      ? "找不到這間房，請向房主取得新的邀請連結"
      : "P2P 暫時無法連線，Tip 會保留在本機";
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
    return {
      role: this.role,
      selfId: this.selfId,
      hostId: this.hostId,
      invite: invite.toString(),
    };
  }

  destroy() {
    this.connections.forEach((connection) => connection.close());
    this.connections.clear();
    this.peer?.destroy();
  }
}
