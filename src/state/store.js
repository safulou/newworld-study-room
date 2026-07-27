const STORAGE_KEY = "newworld-study-room:v2";
const LEGACY_KEY = "newworld-study-room:v1";

const starterTips = [
  { id: "welcome-1", by: "Lina", text: "先把今天最小的一步完成，專注會慢慢跟上。", createdAt: 1 },
  { id: "welcome-2", by: "Kai", text: "讀完一段就抬頭呼吸一下，你已經在前進了。", createdAt: 2 },
  { id: "welcome-3", by: "Momo", text: "不用一次做到完美，先陪自己坐滿這一輪。", createdAt: 3 },
];

const defaults = {
  roomName: "Midnight Study Room",
  minutes: 25,
  photo: "",
  generation: "empty",
  generationProgress: 0,
  tips: starterTips,
};

function normalizeTip(tip) {
  if (!tip || typeof tip.text !== "string") return null;
  const text = tip.text.trim().slice(0, 72);
  if (!text) return null;
  return {
    id: String(tip.id || crypto.randomUUID()),
    by: String(tip.by || "同房夥伴").slice(0, 18),
    text,
    createdAt: Number(tip.createdAt) || Date.now(),
  };
}

function readStoredState() {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (current) return current;
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (!legacy) return null;
    return { ...legacy, tips: legacy.tips?.map(normalizeTip).filter(Boolean) };
  } catch {
    return null;
  }
}

function sanitizeState(value = {}) {
  const tips = Array.isArray(value.tips)
    ? value.tips.map(normalizeTip).filter(Boolean).slice(0, 40)
    : starterTips;
  const minutes = Math.max(5, Math.min(120, Number(value.minutes) || defaults.minutes));
  return {
    roomName: String(value.roomName || defaults.roomName).trim().slice(0, 24) || defaults.roomName,
    minutes,
    photo: typeof value.photo === "string" ? value.photo : "",
    generation: ["empty", "processing", "ready", "error"].includes(value.generation)
      ? value.generation
      : value.photo ? "ready" : "empty",
    generationProgress: Math.max(0, Math.min(100, Number(value.generationProgress) || 0)),
    tips: tips.length ? tips : starterTips,
  };
}

export function createStore() {
  let state = sanitizeState(readStoredState() || defaults);
  const listeners = new Set();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      const withoutPhoto = { ...state, photo: "", generation: "error" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutPhoto));
    }
  }

  function emit() {
    persist();
    listeners.forEach((listener) => listener(state));
  }

  return {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
    update(patch) {
      state = sanitizeState({ ...state, ...patch });
      emit();
    },
    addTip(value) {
      const tip = normalizeTip(value);
      if (!tip || state.tips.some((item) => item.id === tip.id)) return false;
      state = { ...state, tips: [tip, ...state.tips].slice(0, 40) };
      emit();
      return true;
    },
    mergeTips(values) {
      if (!Array.isArray(values)) return;
      const known = new Set(state.tips.map((tip) => tip.id));
      const incoming = values.map(normalizeTip).filter((tip) => tip && !known.has(tip.id));
      if (!incoming.length) return;
      state = {
        ...state,
        tips: [...incoming, ...state.tips]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 40),
      };
      emit();
    },
    clearPhoto() {
      state = { ...state, photo: "", generation: "empty", generationProgress: 0 };
      emit();
    },
  };
}
