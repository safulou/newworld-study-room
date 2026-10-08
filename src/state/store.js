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
  companionMode: "doll",
  dollStyle: "cozy",
  photo: "",
  standeePhoto: "",
  modelUrl: "",
  generation: "empty",
  generationProgress: 0,
  accessories: {
    glasses: false,
    crown: false,
    coffee: false,
    cat: false,
  },
  ambientMode: "auto",
  desktopNotifications: false,
  heatmapTheme: "emerald",
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  completionChime: "fanfare",
  syncWithHostTimer: false,
  focusCategory: "dev",
  focusIntention: "",
  sprintPreset: "classic",
  parkingLot: [],
  windowWeather: "auto",
  posterTheme: "midnight",
  flowAutopilot: false,
  windDownAlert: true,
  customPresets: [],
  companionAffinityExp: 0,
  companionAura: "auto",
  audioDuckingOnPause: true,
  syncWithHostSoundscape: false,
  clockworkTickSound: "off",
  clockworkTickVolume: 0.25,
  cabinAtmosphereMood: "auto",
  dailyGoalMinutes: 100,
  receivedBookmarks: [],
  celebratedBadgeIds: [],
  orbitingBreeze: false,
  autoAtmosphereSync: true,
};

export const AFFINITY_RANKS = [
  { level: 1, title: "初識書伴", minExp: 0, nextExp: 50, icon: "🌱", quote: "你好呀！今天開始我們一起讀書吧。" },
  { level: 2, title: "溫暖相伴", minExp: 50, nextExp: 120, icon: "🌿", quote: "看著你專注的樣子，身邊也暖洋洋的。" },
  { level: 3, title: "共讀默契", minExp: 120, nextExp: 220, icon: "🍵", quote: "已經很習慣身邊有你的鍵盤與翻頁聲了。" },
  { level: 4, title: "心領神會", minExp: 220, nextExp: 350, icon: "🌸", quote: "一個眼神就知道現在是該衝刺還是休息。" },
  {
    level: 5,
    title: "心流共振",
    minExp: 350,
    nextExp: 520,
    icon: "✨",
    quote: "我們的心神已經進入同頻共振的深度心流！",
  },
  { level: 6, title: "深度同頻", minExp: 520, nextExp: 720, icon: "💫", quote: "無論多繁重的挑戰，我們都能從容化解。" },
  { level: 7, title: "莫逆之交", minExp: 720, nextExp: 960, icon: "🌟", quote: "這間小木屋裡，有我們共同耕耘的時光。" },
  { level: 8, title: "靈犀相通", minExp: 960, nextExp: 1250, icon: "🪄", quote: "靜默不語也能感知對方的專注力場。" },
  { level: 9, title: "照亮前路", minExp: 1250, nextExp: 1600, icon: "🏮", quote: "你是我遇過最堅韌自律的學習旅人。" },
  {
    level: 10,
    title: "靈魂旅伴",
    minExp: 1600,
    nextExp: Infinity,
    icon: "👑",
    quote: "此生同航，願我們的求知心流永不熄滅。",
  },
];

export function getAffinityRank(exp = 0) {
  const validExp = Math.max(0, Number(exp) || 0);
  for (let i = AFFINITY_RANKS.length - 1; i >= 0; i--) {
    if (validExp >= AFFINITY_RANKS[i].minExp) {
      const current = AFFINITY_RANKS[i];
      const nextExp = current.nextExp;
      const progressInLevel =
        nextExp === Infinity
          ? 100
          : Math.min(100, Math.round(((validExp - current.minExp) / (nextExp - current.minExp)) * 100));
      return {
        ...current,
        currentExp: validExp,
        progressPercent: progressInLevel,
      };
    }
  }
  return { ...AFFINITY_RANKS[0], currentExp: validExp, progressPercent: 0 };
}

export const AFFINITY_AURAS = {
  none: { id: "none", label: "無光環", minLevel: 1, icon: "⭕" },
  warm_glow: { id: "warm_glow", label: "溫潤微光", minLevel: 3, icon: "🍵", color: 0xfbbf24 },
  starlight: { id: "starlight", label: "星光共振", minLevel: 5, icon: "✨", color: 0x38bdf8 },
  aurora: { id: "aurora", label: "極光流彩", minLevel: 7, icon: "🌟", color: 0x34d399, secondaryColor: 0x818cf8 },
  crown: { id: "crown", label: "神聖日冕", minLevel: 10, icon: "👑", color: 0xfcd34d },
};

export function getUnlockedAura(level = 1) {
  if (level >= 10) return "crown";
  if (level >= 7) return "aurora";
  if (level >= 5) return "starlight";
  if (level >= 3) return "warm_glow";
  return "none";
}

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
  const accessories = {
    glasses: Boolean(value.accessories?.glasses),
    crown: Boolean(value.accessories?.crown),
    coffee: Boolean(value.accessories?.coffee),
    cat: Boolean(value.accessories?.cat),
  };
  const ambientMode = ["auto", "day", "dusk", "night"].includes(value.ambientMode) ? value.ambientMode : "auto";
  const heatmapTheme = ["emerald", "amber", "cyber", "ocean"].includes(value.heatmapTheme)
    ? value.heatmapTheme
    : profileDefaults.heatmapTheme;
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
    companionMode: ["doll", "standee"].includes(value.companionMode)
      ? value.companionMode
      : profileDefaults.companionMode,
    dollStyle: ["cozy", "detective", "wizard"].includes(value.dollStyle) ? value.dollStyle : profileDefaults.dollStyle,
    photo: typeof value.photo === "string" ? value.photo : "",
    standeePhoto: typeof value.standeePhoto === "string" ? value.standeePhoto : "",
    modelUrl: typeof value.modelUrl === "string" ? value.modelUrl : "",
    generation: ["empty", "processing", "ready", "error"].includes(value.generation)
      ? value.generation
      : value.photo
        ? "ready"
        : "empty",
    generationProgress: Math.max(0, Math.min(100, Number(value.generationProgress) || 0)),
    accessories,
    ambientMode,
    desktopNotifications: Boolean(value.desktopNotifications),
    heatmapTheme,
    shortBreakMinutes: Math.max(1, Math.min(30, Number(value.shortBreakMinutes) || profileDefaults.shortBreakMinutes)),
    longBreakMinutes: Math.max(5, Math.min(60, Number(value.longBreakMinutes) || profileDefaults.longBreakMinutes)),
    completionChime: ["fanfare", "bowl", "wooden_fish", "wind_chime"].includes(value.completionChime)
      ? value.completionChime
      : profileDefaults.completionChime,
    syncWithHostTimer: Boolean(value.syncWithHostTimer),
    focusCategory: ["dev", "read", "write", "design", "review"].includes(value.focusCategory)
      ? value.focusCategory
      : profileDefaults.focusCategory,
    focusIntention: typeof value.focusIntention === "string" ? value.focusIntention.trim().slice(0, 48) : "",
    sprintPreset: ["classic", "deep", "sprint", "ultradian", "custom"].includes(value.sprintPreset)
      ? value.sprintPreset
      : profileDefaults.sprintPreset,
    windowWeather: ["auto", "rain", "snow", "leaves", "clear"].includes(value.windowWeather)
      ? value.windowWeather
      : profileDefaults.windowWeather,
    posterTheme: ["midnight", "aurora", "sunset", "forest", "cyber"].includes(value.posterTheme)
      ? value.posterTheme
      : profileDefaults.posterTheme,
    flowAutopilot: Boolean(value.flowAutopilot),
    windDownAlert: value.windDownAlert !== undefined ? Boolean(value.windDownAlert) : profileDefaults.windDownAlert,
    parkingLot: Array.isArray(value.parkingLot)
      ? value.parkingLot
          .filter((item) => item && typeof item.text === "string" && item.text.trim())
          .slice(0, 50)
          .map((item) => ({
            id: String(item.id || crypto.randomUUID()).slice(0, 64),
            text: String(item.text).trim().slice(0, 80),
            createdAt: Number.isFinite(Number(item.createdAt)) ? Number(item.createdAt) : Date.now(),
            completed: Boolean(item.completed),
          }))
      : [],
    customPresets: Array.isArray(value.customPresets)
      ? value.customPresets
          .filter((p) => p && typeof p.name === "string" && typeof p.tracks === "object" && p.tracks !== null)
          .slice(0, 12)
          .map((p) => ({
            id: String(p.id || crypto.randomUUID()).slice(0, 64),
            name: String(p.name).trim().slice(0, 16) || "自訂音景",
            tracks: Object.fromEntries(
              Object.entries(p.tracks)
                .filter(([k, v]) => typeof k === "string" && Number.isFinite(Number(v)))
                .map(([k, v]) => [k, Math.max(0, Math.min(1, Number(v)))]),
            ),
            pans:
              p.pans && typeof p.pans === "object"
                ? Object.fromEntries(
                    Object.entries(p.pans)
                      .filter(([k, v]) => typeof k === "string" && Number.isFinite(Number(v)))
                      .map(([k, v]) => [k, Math.max(-1, Math.min(1, Number(v)))]),
                  )
                : {},
            eq:
              p.eq && typeof p.eq === "object"
                ? {
                    bass: Math.max(-12, Math.min(12, Number(p.eq.bass) || 0)),
                    mid: Math.max(-12, Math.min(12, Number(p.eq.mid) || 0)),
                    treble: Math.max(-12, Math.min(12, Number(p.eq.treble) || 0)),
                  }
                : null,
            reverb:
              p.reverb && typeof p.reverb === "object"
                ? {
                    preset: String(p.reverb.preset || "bypass").slice(0, 20),
                    wet: Math.max(0, Math.min(1, Number(p.reverb.wet) || 0)),
                  }
                : null,
          }))
      : [],
    companionAffinityExp: Math.max(0, Math.min(100000, Number(value.companionAffinityExp) || 0)),
    companionAura: ["auto", "none", "warm_glow", "starlight", "aurora", "crown"].includes(value.companionAura)
      ? value.companionAura
      : profileDefaults.companionAura,
    audioDuckingOnPause:
      value.audioDuckingOnPause !== undefined
        ? Boolean(value.audioDuckingOnPause)
        : profileDefaults.audioDuckingOnPause,
    syncWithHostSoundscape: Boolean(value.syncWithHostSoundscape),
    clockworkTickSound: ["off", "wood", "crisp"].includes(value.clockworkTickSound)
      ? value.clockworkTickSound
      : profileDefaults.clockworkTickSound,
    clockworkTickVolume:
      value.clockworkTickVolume !== undefined
        ? Math.max(0, Math.min(1, Number(value.clockworkTickVolume) || 0))
        : profileDefaults.clockworkTickVolume,
    cabinAtmosphereMood: ["auto", "amber", "emerald", "violet", "rose", "noir"].includes(value.cabinAtmosphereMood)
      ? value.cabinAtmosphereMood
      : profileDefaults.cabinAtmosphereMood,
    dailyGoalMinutes: Math.max(10, Math.min(720, Number(value.dailyGoalMinutes) || profileDefaults.dailyGoalMinutes)),
    receivedBookmarks: Array.isArray(value.receivedBookmarks)
      ? value.receivedBookmarks
          .filter((b) => b && typeof b.plantKey === "string")
          .slice(0, 40)
          .map((b) => ({
            id: String(b.id || crypto.randomUUID()).slice(0, 64),
            plantKey: String(b.plantKey).trim().slice(0, 24),
            senderNickname: String(b.senderNickname || "書伴")
              .trim()
              .slice(0, 24),
            personalInscription: String(b.personalInscription || "")
              .trim()
              .slice(0, 80),
            receivedAt: Number.isFinite(Number(b.receivedAt))
              ? Number(b.receivedAt)
              : typeof b.receivedAt === "string"
                ? b.receivedAt
                : Date.now(),
            theme: ["midnight", "aurora", "sunset", "forest", "cyber"].includes(b.theme) ? b.theme : "forest",
            gratitudeSent: Boolean(b.gratitudeSent),
            gratitudeSentAt: typeof b.gratitudeSentAt === "string" ? b.gratitudeSentAt.slice(0, 36) : null,
          }))
      : [],
    celebratedBadgeIds: Array.isArray(value.celebratedBadgeIds)
      ? value.celebratedBadgeIds
          .filter((id) => typeof id === "string")
          .slice(0, 30)
          .map((id) => String(id).slice(0, 32))
      : [],
    orbitingBreeze: Boolean(value.orbitingBreeze),
    autoAtmosphereSync:
      value.autoAtmosphereSync !== undefined ? Boolean(value.autoAtmosphereSync) : profileDefaults.autoAtmosphereSync,
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
      profile = { ...profile, photo: "", standeePhoto: "", modelUrl: "", generation: "error", generationProgress: 0 };
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
      profile = {
        ...profile,
        photo: "",
        standeePhoto: "",
        modelUrl: "",
        generation: "empty",
        generationProgress: 0,
      };
      emit({ saveProfile: true, saveRoom: false });
    },
    renameCustomPreset(id, newName) {
      const trimmed = String(newName || "")
        .trim()
        .slice(0, 16);
      if (!trimmed) return false;
      const current = profile.customPresets || [];
      const updated = current.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
      profile = sanitizeProfile({ ...profile, customPresets: updated });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
    reorderCustomPreset(id, direction) {
      const current = [...(profile.customPresets || [])];
      const idx = current.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      if (direction === "top") {
        if (idx === 0) return false;
        const [target] = current.splice(idx, 1);
        current.unshift(target);
      } else if (direction === "up") {
        if (idx === 0) return false;
        const temp = current[idx - 1];
        current[idx - 1] = current[idx];
        current[idx] = temp;
      } else if (direction === "down") {
        if (idx >= current.length - 1) return false;
        const temp = current[idx + 1];
        current[idx + 1] = current[idx];
        current[idx] = temp;
      } else {
        return false;
      }
      profile = sanitizeProfile({ ...profile, customPresets: current });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
    duplicateCustomPreset(id) {
      const current = [...(profile.customPresets || [])];
      if (current.length >= 12) return false;
      const target = current.find((p) => p.id === id);
      if (!target) return false;
      const copy = {
        ...target,
        id: crypto.randomUUID(),
        name: `${target.name} 副本`.slice(0, 16),
      };
      const idx = current.indexOf(target);
      current.splice(idx + 1, 0, copy);
      profile = sanitizeProfile({ ...profile, customPresets: current });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
    addReceivedBookmark(gift) {
      if (!gift || !gift.plantKey) return false;
      const currentList = profile.receivedBookmarks || [];
      const newBookmark = {
        id: String(gift.id || crypto.randomUUID()).slice(0, 64),
        plantKey: String(gift.plantKey).trim().slice(0, 24),
        senderNickname: String(gift.senderNickname || "書伴")
          .trim()
          .slice(0, 24),
        personalInscription: String(gift.personalInscription || "")
          .trim()
          .slice(0, 80),
        receivedAt: Number.isFinite(Number(gift.receivedAt || gift.timestamp))
          ? Number(gift.receivedAt || gift.timestamp)
          : Date.now(),
        theme: ["midnight", "aurora", "sunset", "forest", "cyber"].includes(gift.theme) ? gift.theme : "forest",
      };
      profile = sanitizeProfile({ ...profile, receivedBookmarks: [newBookmark, ...currentList].slice(0, 40) });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
    markBadgeCelebrated(badgeId) {
      if (!badgeId || typeof badgeId !== "string") return false;
      const celebrated = new Set(profile.celebratedBadgeIds || []);
      if (celebrated.has(badgeId)) return false;
      celebrated.add(badgeId);
      profile = sanitizeProfile({ ...profile, celebratedBadgeIds: Array.from(celebrated).slice(0, 30) });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
    markBookmarkGratitudeSent(giftId) {
      if (!giftId || typeof giftId !== "string") return false;
      const list = [...(profile.receivedBookmarks || [])];
      const target = list.find((b) => b.id === giftId);
      if (!target) return false;
      target.gratitudeSent = true;
      target.gratitudeSentAt = new Date().toISOString();
      profile = sanitizeProfile({ ...profile, receivedBookmarks: list });
      emit({ saveProfile: true, saveRoom: false });
      return true;
    },
  };
}

export const storeInternals = { normalizeTip, safeRoomId, roomStorageKey };
