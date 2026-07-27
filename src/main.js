import "./styles.css";
import {
  Copy,
  ImagePlus,
  MessageCircleHeart,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Send,
  Shuffle,
  Sparkles,
  Trash2,
  Volume2,
  createIcons,
} from "lucide";
import { BackgroundMusic } from "./services/background-music.js";
import { FocusTimer } from "./services/focus-timer.js";
import { prepareCompanionPhoto } from "./services/image-pipeline.js";
import { createStore } from "./state/store.js";

const icons = { Copy, ImagePlus, MessageCircleHeart, Music2, Pause, Play, RotateCcw, Search, Send, Shuffle, Sparkles, Trash2, Volume2 };
createIcons({ icons });

const $ = (selector) => document.querySelector(selector);
const elements = {
  stage: $(".stage"),
  roomCode: $("#roomCode"),
  presenceDot: $("#presenceDot"),
  presenceText: $("#presenceText"),
  dollCanvas: $("#dollCanvas"),
  avatarZone: $("#avatarZone"),
  tipMeteor: $("#tipMeteor"),
  tipSignal: $("#tipSignal"),
  tipSignalCount: $("#tipSignalCount"),
  tipPanel: $("#tipPanel"),
  timer: $("#timer"),
  toggleTimer: $("#toggleTimer"),
  resetTimer: $("#resetTimer"),
  toggleMusic: $("#toggleMusic"),
  photoInput: $("#photoInput"),
  photoDrop: $("#photoDrop"),
  clearPhoto: $("#clearPhoto"),
  styleButtons: [...document.querySelectorAll("[data-doll-style]")],
  generationLabel: $("#generationLabel"),
  generationPercent: $("#generationPercent"),
  generationBar: $("#generationBar"),
  progress: $(".progress"),
  notes: $("#notes"),
  noteForm: $("#noteForm"),
  noteInput: $("#noteInput"),
  seedTip: $("#seedTip"),
  roomName: $("#roomName"),
  minutes: $("#minutes"),
  musicVolume: $("#musicVolume"),
  musicVolumeValue: $("#musicVolumeValue"),
  inviteLink: $("#inviteLink"),
  copyInvite: $("#copyInvite"),
  roleBadge: $("#roleBadge"),
  connectionStatus: $("#connectionStatus"),
  toast: $("#toast"),
};

const store = createStore();
const timer = new FocusTimer(store.get().minutes);
const music = new BackgroundMusic(store.get().musicVolume);
let viewer = null;
let p2p = null;
let toastTimeout = null;
let lastRenderedPhoto = null;
let lastRenderedGeneration = null;
let lastRenderedStyle = null;
let unreadRemoteTips = 0;
let meteorAnimation = null;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function launchTipMeteor(onArrival) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !elements.tipMeteor.animate) {
    onArrival();
    return;
  }

  const stageRect = elements.stage.getBoundingClientRect();
  const signalRect = elements.tipSignal.getBoundingClientRect();
  const targetX = signalRect.left - stageRect.left + signalRect.width / 2;
  const targetY = signalRect.top - stageRect.top + signalRect.height / 2;
  const startX = stageRect.width * (targetX > stageRect.width / 2 ? 0.12 : 0.84);
  const startY = Math.max(24, stageRect.height * 0.07);
  const offsetX = startX - targetX;
  const offsetY = startY - targetY;
  const angle = Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI);

  meteorAnimation?.cancel();
  elements.tipMeteor.hidden = false;
  elements.tipMeteor.style.left = `${targetX - 100}px`;
  elements.tipMeteor.style.top = `${targetY - 2}px`;
  meteorAnimation = elements.tipMeteor.animate([
    { opacity: 0, transform: `translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)` },
    { opacity: 1, offset: 0.12, transform: `translate(${offsetX * 0.9}px, ${offsetY * 0.9}px) rotate(${angle}deg)` },
    { opacity: 1, offset: 0.78, transform: `translate(${offsetX * 0.18}px, ${offsetY * 0.18}px) rotate(${angle}deg)` },
    { opacity: 0, transform: `translate(0, 0) rotate(${angle}deg)` },
  ], {
    duration: 900,
    easing: "cubic-bezier(.2, .72, .25, 1)",
  });
  meteorAnimation.addEventListener("finish", () => {
    elements.tipMeteor.hidden = true;
    meteorAnimation = null;
    onArrival();
  }, { once: true });
}

function showRemoteTipSignal() {
  const shouldWaitForMeteor = elements.tipSignal.hidden || elements.tipSignal.classList.contains("awaiting-meteor");
  unreadRemoteTips = Math.min(99, unreadRemoteTips + 1);
  elements.tipSignalCount.textContent = String(unreadRemoteTips);
  elements.tipSignal.setAttribute("aria-label", `查看 ${unreadRemoteTips} 張新收到的 Tip`);
  elements.tipSignal.hidden = false;
  elements.tipSignal.classList.toggle("awaiting-meteor", shouldWaitForMeteor);

  launchTipMeteor(() => {
    elements.tipSignal.classList.remove("awaiting-meteor", "arrived");
    requestAnimationFrame(() => elements.tipSignal.classList.add("arrived"));
  });
}

function bindTipSignal() {
  elements.tipSignal.addEventListener("click", () => {
    unreadRemoteTips = 0;
    elements.tipSignal.hidden = true;
    elements.tipSignal.classList.remove("arrived");
    elements.tipPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function replaceButtonIcon(button, iconName, label) {
  button.innerHTML = `<i data-lucide="${iconName}"></i>`;
  button.setAttribute("aria-label", label);
  button.title = label;
  createIcons({ icons });
}

function renderGeneration(state) {
  const progress = state.generationProgress;
  const labels = {
    empty: "等待上傳照片",
    processing: "正在建立 3D 娃娃",
    ready: "3D 娃娃已放進小木屋",
    error: "照片處理失敗",
  };
  elements.generationLabel.textContent = labels[state.generation] || labels.empty;
  elements.generationPercent.textContent = `${progress}%`;
  elements.generationBar.style.width = `${progress}%`;
  elements.progress.setAttribute("aria-valuenow", String(progress));
}

function renderTips(tips) {
  elements.notes.replaceChildren();
  if (!tips.length) {
    const empty = document.createElement("div");
    empty.className = "empty-notes";
    empty.textContent = "紙條牆還是空的";
    elements.notes.append(empty);
    return;
  }
  tips.slice(0, 12).forEach((tip) => {
    const note = document.createElement("article");
    note.className = "note";
    const by = document.createElement("b");
    by.textContent = tip.by;
    const text = document.createElement("span");
    text.textContent = tip.text;
    note.append(by, text);
    elements.notes.append(note);
  });
}

function renderState(state) {
  if (document.activeElement !== elements.roomName) elements.roomName.value = state.roomName;
  if (document.activeElement !== elements.minutes) elements.minutes.value = state.minutes;
  if (document.activeElement !== elements.musicVolume) elements.musicVolume.value = state.musicVolume;
  elements.musicVolumeValue.value = `${state.musicVolume}%`;
  music.setVolume(state.musicVolume);
  elements.styleButtons.forEach((button) => {
    const active = button.dataset.dollStyle === state.dollStyle;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderGeneration(state);
  renderTips(state.tips);
  if (viewer && state.photo !== lastRenderedPhoto) {
    viewer.setPhoto(state.photo);
    lastRenderedPhoto = state.photo;
  }
  if (viewer && state.generation !== lastRenderedGeneration) {
    viewer.setGeneration(state.generation);
    lastRenderedGeneration = state.generation;
  }
  if (viewer && state.dollStyle !== lastRenderedStyle) {
    viewer.setStyle(state.dollStyle);
    lastRenderedStyle = state.dollStyle;
  }
}

function makeTip(text, by = "You") {
  return {
    id: crypto.randomUUID(),
    by,
    text: text.trim().slice(0, 72),
    createdAt: Date.now(),
  };
}

function addAndSendTip(text, by = p2p?.role === "host" ? "房主" : "夥伴") {
  const tip = makeTip(text, by);
  if (!tip.text) return;
  store.addTip(tip);
  p2p?.sendTip(tip);
}

async function processPhoto(file) {
  try {
    store.update({ generation: "processing", generationProgress: 4 });
    const photo = await prepareCompanionPhoto(file, (generationProgress, label) => {
      store.update({ generation: "processing", generationProgress });
      elements.generationLabel.textContent = label;
    });
    store.update({ photo, generation: "ready", generationProgress: 100 });
    showToast("3D 娃娃已放進小木屋。 ");
  } catch (error) {
    store.update({ generation: "error", generationProgress: 0 });
    showToast(error.message || "照片處理失敗。 ");
  } finally {
    elements.photoInput.value = "";
  }
}

function bindImageUpload() {
  elements.photoInput.addEventListener("change", (event) => processPhoto(event.target.files?.[0]));
  ["dragenter", "dragover"].forEach((type) => {
    elements.photoDrop.addEventListener(type, (event) => {
      event.preventDefault();
      elements.photoDrop.classList.add("dragging");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    elements.photoDrop.addEventListener(type, (event) => {
      event.preventDefault();
      elements.photoDrop.classList.remove("dragging");
    });
  });
  elements.photoDrop.addEventListener("drop", (event) => processPhoto(event.dataTransfer?.files?.[0]));
  elements.clearPhoto.addEventListener("click", () => {
    store.clearPhoto();
    showToast("已換回預設伴讀娃娃。 ");
  });
}

function bindDollStyle() {
  elements.styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dollStyle = button.dataset.dollStyle;
      store.update({ dollStyle });
      showToast(dollStyle === "detective" ? "已換成原創推理 Q 版公仔。 " : "已換回暖心公仔。 ");
    });
  });
}

function bindTimer() {
  timer.addEventListener("tick", (event) => {
    const minutes = Math.floor(event.detail / 60).toString().padStart(2, "0");
    const seconds = Math.floor(event.detail % 60).toString().padStart(2, "0");
    elements.timer.textContent = `${minutes}:${seconds}`;
  });
  timer.addEventListener("running", (event) => {
    replaceButtonIcon(elements.toggleTimer, event.detail ? "pause" : "play", event.detail ? "暫停專注" : "開始專注");
  });
  timer.addEventListener("complete", () => showToast("這輪完成了，留一張 Tip 給同房夥伴吧。 "));
  elements.toggleTimer.addEventListener("click", () => timer.toggle());
  elements.resetTimer.addEventListener("click", () => timer.reset());
}

function bindMusic() {
  music.addEventListener("running", (event) => {
    replaceButtonIcon(elements.toggleMusic, event.detail ? "volume-2" : "music-2", event.detail ? "暫停背景音樂" : "播放背景音樂");
    elements.toggleMusic.classList.toggle("primary", event.detail);
  });
  elements.toggleMusic.addEventListener("click", async () => {
    try {
      await music.toggle();
      showToast(music.running ? "正在播放《給愛麗絲》鋼琴伴讀版。 " : "背景音樂已暫停。 ");
    } catch (error) {
      showToast(error.message || "背景音樂無法播放。 ");
    }
  });
  elements.musicVolume.addEventListener("input", () => {
    const value = Number(elements.musicVolume.value);
    elements.musicVolumeValue.value = `${value}%`;
    music.setVolume(value);
  });
  elements.musicVolume.addEventListener("change", () => {
    store.update({ musicVolume: Number(elements.musicVolume.value) });
  });
}

function bindTips() {
  elements.noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = elements.noteInput.value.trim();
    if (!text) return;
    addAndSendTip(text);
    elements.noteInput.value = "";
    showToast(p2p?.connections.size ? "Tip 已傳給同房夥伴。 " : "Tip 已先保存在這間小木屋。 ");
  });
  elements.seedTip.addEventListener("click", () => {
    const samples = [
      "先讀五分鐘就好，開始之後通常會比想像中容易。",
      "肩膀放鬆，喝口水，再把眼前這一小段完成。",
      "今天不用追上所有進度，只要比剛才前進一點。",
    ];
    addAndSendTip(samples[Math.floor(Math.random() * samples.length)], "P2P");
  });
}

function bindSettings() {
  elements.roomName.addEventListener("change", () => {
    store.update({ roomName: elements.roomName.value });
    p2p?.sendRoomMeta(store.get().roomName);
  });
  elements.minutes.addEventListener("change", () => {
    const minutes = Math.max(5, Math.min(120, Number(elements.minutes.value) || 25));
    store.update({ minutes });
    timer.setMinutes(minutes);
  });
  elements.copyInvite.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.inviteLink.value);
      showToast("邀請連結已複製。 ");
    } catch {
      elements.inviteLink.select();
      showToast("已選取邀請連結。 ");
    }
  });
}

async function startP2P() {
  const { P2PRoom } = await import("./services/p2p-room.js");
  p2p = new P2PRoom({ getSnapshot: () => store.get() });
  p2p.addEventListener("ready", (event) => {
    const info = event.detail;
    elements.roomCode.textContent = `room://${info.hostId.slice(0, 16)}`;
    elements.inviteLink.value = info.invite;
    elements.copyInvite.disabled = false;
    elements.roleBadge.textContent = info.role === "host" ? "房主" : "夥伴";
    elements.roomName.readOnly = info.role === "guest";
  });
  p2p.addEventListener("status", (event) => {
    elements.connectionStatus.textContent = event.detail.message;
    elements.presenceDot.className = `dot ${event.detail.state}`;
  });
  p2p.addEventListener("presence", (event) => {
    elements.presenceText.textContent = `${event.detail} 人正在伴讀`;
  });
  p2p.addEventListener("snapshot", (event) => {
    store.update({ roomName: event.detail.roomName });
    store.mergeTips(event.detail.tips);
  });
  p2p.addEventListener("room-meta", (event) => store.update({ roomName: event.detail.roomName }));
  p2p.addEventListener("tip", (event) => {
    if (store.addTip(event.detail)) {
      showRemoteTipSignal();
      showToast(`${event.detail.by} 傳來一張 Tip。 `);
    }
  });
  p2p.addEventListener("network-error", (event) => showToast(event.detail));
  p2p.start();
}

async function startViewer() {
  try {
    const { DollViewer } = await import("./services/doll-viewer.js");
    viewer = new DollViewer(elements.dollCanvas, elements.avatarZone);
    renderState(store.get());
  } catch {
    elements.dollCanvas.hidden = true;
    showToast("目前瀏覽器無法顯示 3D，已切換為簡易娃娃。 ");
  }
}

function init() {
  store.subscribe(renderState);
  bindImageUpload();
  bindDollStyle();
  bindTimer();
  bindMusic();
  bindTips();
  bindTipSignal();
  bindSettings();
  timer.emitTick();
  startViewer();
  startP2P().catch(() => showToast("P2P 初始化失敗，Tip 會保存在本機。 "));
  window.addEventListener("beforeunload", () => {
    p2p?.destroy();
    viewer?.dispose();
    music.destroy();
  });
}

init();
