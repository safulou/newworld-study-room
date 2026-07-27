const PROFILE_KEY = "newworld-study-room:profile:v3";
const ROOM_KEY_PREFIX = "newworld-study-room:room:v3:";
const LEGACY_KEYS = ["newworld-study-room:v2", "newworld-study-room:v1"];

const starterTips = [
  {
    id: "welcome-1",
    by: "Lina",
    text: "先把今天最小的一步完成，專注會慢慢跟上。",
    createdAt: 1,
    direction: "system",
    delivery: "sent",
  },
  {
    id: "welcome-2",
    by: "Kai",
    text: "讀完一段就抬頭呼吸一下，你已經在前進了。",
    createdAt: 2,
    direction: "system",
    delivery: "sent",
  },
  {
    id: "welcome-3",
    by: "Momo",
    text: "不用一次做到完美，先陪自己坐滿這一輪。",
    createdAt: 3,
    direction: "system",
    delivery: "sent",
  },
];

const profileDefaults = {
  nickname: "夥伴",
  minutes: 25,
  plantType: "rose",
  musicVolume: 28,
  dollStyle: "cozy",
  photo: "",
  modelUrl: "",
  generation: "empty",
  generationProgress: 0,
};

const roomDefaults = {
  roomName: "Midnight Study Room",
  tips: starterTips,
};

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function safeRoomId(value) {
  return (
    String(value || "local-draft")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 96) || "local-draft"
  );
}

function roomStorageKey(roomId) {
  return `${ROOM_KEY_PREFIX}${safeRoomId(roomId)}`;
}

function normalizeTip(tip, fallbackDirection = "incoming") {
  if (!tip || typeof tip.text !== "string") return null;
  const text = tip.text.trim().slice(0, 72);
  if (!text) return null;
  const direction = ["incoming", "outgoing", "system"].includes(tip.direction) ? tip.direction : fallbackDirection;
  const delivery = ["pending", "sent", "received", "failed"].includes(tip.delivery)
    ? tip.delivery
    : direction === "outgoing"
      ? "pending"
      : "received";
  return {
    id: String(tip.id || crypto.randomUUID()).slice(0, 80),
    by:
      String(tip.by || "同房夥伴")
        .trim()
        .slice(0, 18) || "同房夥伴",
    text,
    createdAt: Number.isFinite(Number(tip.createdAt)) ? Number(tip.createdAt) : Date.now(),
    direction,
    delivery,
  };
}

function sanitizeProfile(value = {}) {
  const minutes = Math.max(5, Math.min(120, Number(value.minutes) || profileDefaults.minutes));
  return {
    nickname:
      String(value.nickname || profileDefaults.nickname)
        .trim()
        .slice(0, 18) || profileDefaults.nickname,
    minutes,
    plantType: ["rose", "tulip", "cactus", "succulent", "pine"].includes(value.plantType)
      ? value.plantType
      : profileDefaults.plantType,
    musicVolume: Math.max(0, Math.min(100, Number(value.musicVolume ?? profileDefaults.musicVolume))),
    dollStyle: ["cozy", "detective"].includes(value.dollStyle) ? value.dollStyle : profileDefaults.dollStyle,
    photo: typeof value.photo === "string" ? value.photo : "",
    modelUrl: typeof value.modelUrl === "string" ? value.modelUrl : "",
    generation: ["empty", "processing", "ready", "error"].includes(value.generation)
      ? value.generation
      : value.photo
        ? "ready"
        : "empty",
    generationProgress: Math.max(0, Math.min(100, Number(value.generationProgress) || 0)),
  };
}

function sanitizeRoom(value = {}, includeStarterTips = true) {
  const fallbackTips = includeStarterTips ? starterTips : [];
  const tips = Array.isArray(value.tips)
    ? value.tips
        .map((tip) => normalizeTip(tip, "incoming"))
        .filter(Boolean)
        .slice(0, 40)
    : fallbackTips;
  return {
    roomName:
      String(value.roomName || roomDefaults.roomName)
        .trim()
        .slice(0, 24) || roomDefaults.roomName,
    tips,
  };
}

function readLegacyState() {
  for (const key of LEGACY_KEYS) {
    const value = readJson(key);
    if (value) return value;
  }
  return null;
}

export function createStore({ roomId = "local-draft", includeStarterTips = true, migrateLegacy = false } = {}) {
  let activeRoomId = safeRoomId(roomId);
  const legacy = migrateLegacy ? readLegacyState() : null;
  let profile = sanitizeProfile(readJson(PROFILE_KEY) || legacy || profileDefaults);
  const storedRoom = readJson(roomStorageKey(activeRoomId)) || legacy;
  let room = sanitizeRoom(storedRoom || { roomName: roomDefaults.roomName }, includeStarterTips);
  let state = { ...profile, ...room, roomId: activeRoomId };
  const listeners = new Set();

  function persistProfile() {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      profile = { ...profile, photo: "", modelUrl: "", generation: "error", generationProgress: 0 };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // Private browsing and full storage quotas can reject every write.
      }
    }
  }

  function persistRoom() {
    try {
      localStorage.setItem(roomStorageKey(activeRoomId), JSON.stringify(room));
    } catch {
      // The live room keeps working even when persistence is unavailable.
    }
  }

  function emit({ saveProfile = true, saveRoom = true } = {}) {
    if (saveProfile) persistProfile();
    if (saveRoom) persistRoom();
    state = { ...profile, ...room, roomId: activeRoomId };
    listeners.forEach((listener) => listener(state));
  }

  if (legacy) {
    persistProfile();
    persistRoom();
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  return {
    get: () => state,
    getRoomId: () => activeRoomId,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    setRoomId(nextRoomId, { migrateCurrent = false, includeStarters = false } = {}) {
      const next = safeRoomId(nextRoomId);
      if (next === activeRoomId) return;
      const previousKey = roomStorageKey(activeRoomId);
      const existing = readJson(roomStorageKey(next));
      activeRoomId = next;
      room = existing
        ? sanitizeRoom(existing, includeStarters)
        : migrateCurrent
          ? room
          : sanitizeRoom({}, includeStarters);
      if (migrateCurrent) localStorage.removeItem(previousKey);
      emit({ saveProfile: false, saveRoom: true });
    },
    update(patch) {
      const profilePatch = {};
      const roomPatch = {};
      Object.entries(patch).forEach(([key, value]) => {
        if (key === "roomName" || key === "tips") roomPatch[key] = value;
        else if (key in profileDefaults) profilePatch[key] = value;
      });
      const touchesProfile = Object.keys(profilePatch).length > 0;
      const touchesRoom = Object.keys(roomPatch).length > 0;
      if (touchesProfile) profile = sanitizeProfile({ ...profile, ...profilePatch });
      if (touchesRoom) room = sanitizeRoom({ ...room, ...roomPatch }, false);
      emit({ saveProfile: touchesProfile, saveRoom: touchesRoom });
    },
    addTip(value, fallbackDirection = "incoming") {
      const tip = normalizeTip(value, fallbackDirection);
      if (!tip || room.tips.some((item) => item.id === tip.id)) return false;
      room = { ...room, tips: [tip, ...room.tips].slice(0, 40) };
      emit({ saveProfile: false, saveRoom: true });
      return true;
    },
    mergeTips(values) {
      if (!Array.isArray(values)) return;
      const known = new Set(room.tips.map((tip) => tip.id));
      const incoming = values
        .map((tip) => normalizeTip({ ...tip, direction: "incoming", delivery: "received" }, "incoming"))
        .filter((tip) => tip && !known.has(tip.id));
      if (!incoming.length) return;
      room = {
        ...room,
        tips: [...incoming, ...room.tips].sort((a, b) => b.createdAt - a.createdAt).slice(0, 40),
      };
      emit({ saveProfile: false, saveRoom: true });
    },
    markTipDelivery(id, delivery) {
      if (!["pending", "sent", "failed"].includes(delivery)) return;
      let changed = false;
      const tips = room.tips.map((tip) => {
        if (tip.id !== id || tip.direction !== "outgoing" || tip.delivery === delivery) return tip;
        changed = true;
        return { ...tip, delivery };
      });
      if (!changed) return;
      room = { ...room, tips };
      emit({ saveProfile: false, saveRoom: true });
    },
    getPendingTips() {
      return room.tips.filter((tip) => tip.direction === "outgoing" && tip.delivery === "pending");
    },
    clearPhoto() {
      profile = { ...profile, photo: "", modelUrl: "", generation: "empty", generationProgress: 0 };
      emit({ saveProfile: true, saveRoom: false });
    },
  };
}

export const storeInternals = { normalizeTip, safeRoomId, roomStorageKey };
