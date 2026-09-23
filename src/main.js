import "./styles.css";
import {
  BarChart2,
  Cat,
  CheckSquare,
  ClipboardCopy,
  CloudRain,
  Coffee,
  Copy,
  Crown,
  Cuboid,
  Download,
  Flame,
  Glasses,
  HandMetal,
  House,
  ImagePlus,
  MessageCircleHeart,
  Music2,
  Pause,
  PanelTop,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shuffle,
  Sparkles,
  SunMoon,
  Trash2,
  Volume2,
  Wand2,
  Waves,
  Wind,
  Zap,
  createIcons,
} from "lucide";
import { AmbientSoundscapeManager, SOUNDSCAPE_PRESETS } from "./services/ambient-sound.js";
import { BackgroundMusic } from "./services/background-music.js";
import { CompanionSoundManager } from "./services/companion-sound.js";
import { createCompanionAsset } from "./services/doll-generation.js";
import { FocusTimer } from "./services/focus-timer.js";
import { StudyStatsManager } from "./services/study-stats.js";
import { TaskTracker } from "./services/task-tracker.js";
import { createStore } from "./state/store.js";

const icons = {
  BarChart2,
  Cat,
  CheckSquare,
  ClipboardCopy,
  CloudRain,
  Coffee,
  Copy,
  Crown,
  Cuboid,
  Download,
  Flame,
  Glasses,
  HandMetal,
  House,
  ImagePlus,
  MessageCircleHeart,
  Music2,
  Pause,
  PanelTop,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shuffle,
  Sparkles,
  SunMoon,
  Trash2,
  Volume2,
  Wand2,
  Waves,
  Wind,
  Zap,
};
createIcons({ icons });

const $ = (selector) => document.querySelector(selector);
const initialUrl = new URL(location.href);
const initialHostId = /^[a-zA-Z0-9_-]{1,80}$/.test(initialUrl.searchParams.get("host") || "")
  ? initialUrl.searchParams.get("host")
  : "";
const elements = {
  stage: $(".stage"),
  roomCode: $("#roomCode"),
  presenceDot: $("#presenceDot"),
  presenceText: $("#presenceText"),
  shareRoom: $("#shareRoom"),
  mobileShareRoom: $("#mobileShareRoom"),
  dollCanvas: $("#dollCanvas"),
  avatarZone: $("#avatarZone"),
  companionBubble: $("#companionBubble"),
  bubbleText: $("#bubbleText"),
  avatarFallback: $("#avatarFallback"),
  tipMeteor: $("#tipMeteor"),
  tipSignal: $("#tipSignal"),
  tipSignalCount: $("#tipSignalCount"),
  tipPanel: $("#tipPanel"),
  focusGarden: $("#focusGarden"),
  gardenStatus: $("#gardenStatus"),
  timer: $("#timer"),
  toggleTimer: $("#toggleTimer"),
  resetTimer: $("#resetTimer"),
  toggleMusic: $("#toggleMusic"),
  toggleAmbient: $("#toggleAmbient"),
  toggleAtmosphere: $("#toggleAtmosphere"),
  cabinWindow: $("#cabinWindow"),
  windowRain: $("#windowRain"),
  windowCelestial: $("#windowCelestial"),
  peerStatusBar: $("#peerStatusBar"),
  peerStatusText: $("#peerStatusText"),
  celebrateBanner: $("#celebrateBanner"),
  celebrateText: $("#celebrateText"),
  sendCheer: $("#sendCheer"),
  ambientBar: $("#ambientBar"),
  ambientVolume: $("#ambientVolume"),
  ambientVolumeValue: $("#ambientVolumeValue"),
  ambientChips: [...document.querySelectorAll(".ambient-chip")],
  presetButtons: [...document.querySelectorAll(".preset-btn")],
  taskPanel: $("#taskPanel"),
  taskForm: $("#taskForm"),
  taskInput: $("#taskInput"),
  taskList: $("#taskList"),
  taskSummaryBadge: $("#taskSummaryBadge"),
  statsPanel: $("#statsPanel"),
  streakBadge: $("#streakBadge"),
  statTodayMinutes: $("#statTodayMinutes"),
  statTotalHours: $("#statTotalHours"),
  statCompletedSessions: $("#statCompletedSessions"),
  statTotalHarvest: $("#statTotalHarvest"),
  heatmapGrid: $("#heatmapGrid"),
  copyMarkdownLog: $("#copyMarkdownLog"),
  exportBackupJson: $("#exportBackupJson"),
  photoInput: $("#photoInput"),
  photoDrop: $("#photoDrop"),
  clearPhoto: $("#clearPhoto"),
  companionModeButtons: [...document.querySelectorAll("[data-companion-mode]")],
  companionPanelTitle: $("#companionPanelTitle"),
  dollStyleSwitch: $("#dollStyleSwitch"),
  styleButtons: [...document.querySelectorAll("[data-doll-style]")],
  accessoryButtons: [...document.querySelectorAll(".accessory-chip")],
  generationLabel: $("#generationLabel"),
  generationPercent: $("#generationPercent"),
  generationBar: $("#generationBar"),
  progress: $(".progress"),
  notes: $("#notes"),
  noteForm: $("#noteForm"),
  noteInput: $("#noteInput"),
  seedTip: $("#seedTip"),
  roomName: $("#roomName"),
  nickname: $("#nickname"),
  minutes: $("#minutes"),
  plantType: $("#plantType"),
  musicVolume: $("#musicVolume"),
  musicVolumeValue: $("#musicVolumeValue"),
  inviteLink: $("#inviteLink"),
  copyInvite: $("#copyInvite"),
  roleBadge: $("#roleBadge"),
  connectionStatus: $("#connectionStatus"),
  retryConnection: $("#retryConnection"),
  toast: $("#toast"),
};

const store = createStore({
  roomId: initialHostId || `local-${crypto.randomUUID()}`,
  includeStarterTips: !initialHostId,
  migrateLegacy: !initialHostId,
});
const timer = new FocusTimer(store.get().minutes);
const music = new BackgroundMusic(store.get().musicVolume);
const ambientSound = new AmbientSoundscapeManager();
const taskTracker = new TaskTracker();
const studyStats = new StudyStatsManager();
const companionSound = new CompanionSoundManager(0.4);
let viewer = null;
let p2p = null;
let toastTimeout = null;
let bubbleTimeout = null;
let lastRenderedPhoto = null;
let lastRenderedStandeePhoto = null;
let lastRenderedModelUrl = null;
let lastRenderedGeneration = null;
let lastRenderedCompanionMode = null;
let lastRenderedStyle = null;
let unreadRemoteTips = 0;
let meteorAnimation = null;
let photoProcessId = 0;
let p2pStartPromise = null;
let lastGardenStage = "";

const plantLabels = {
  rose: "玫瑰",
  tulip: "鬱金香",
  cactus: "仙人掌",
  succulent: "多肉植物",
  pine: "松樹",
};

const tipPaperColors = [
  "#f2e0b2",
  "#edc8b9",
  "#c9dfc4",
  "#c7dce8",
  "#e1d0e8",
  "#f0d2a9",
  "#c3e0da",
  "#e8d7a5",
  "#d2d7ed",
  "#e7c5ce",
  "#d5dfb1",
  "#c8d5cf",
];

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

const companionQuotes = [
  "每一分鐘的專注，都是給未來的禮物 ✨",
  "深呼吸～坐姿端正，我們一起加油！",
  "你已經做得很棒了，繼續保持步調 🌿",
  "累了隨時喝口水，休息一下喔 🍵",
  "今日的努力，花園裡的植物都看在眼裡 🌸",
  "有我在這裡陪你，放心沉浸在學習中吧 💫",
];

const focusQuotes = [
  "噓～正在專注沈浸中，維持這個節奏 🤫✨",
  "專注是前進的超能力，加油！🎯",
  "雜念退散～眼前這一段馬上就能完成 💫",
  "心無旁騖，你認真的樣子特別耀眼 🌟",
];

function showCompanionBubble(text, duration = 3600) {
  if (!elements.companionBubble || !elements.bubbleText) return;
  elements.bubbleText.textContent = text;
  elements.companionBubble.classList.add("visible");
  window.clearTimeout(bubbleTimeout);
  bubbleTimeout = window.setTimeout(() => {
    elements.companionBubble?.classList.remove("visible");
  }, duration);
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
  meteorAnimation = elements.tipMeteor.animate(
    [
      { opacity: 0, transform: `translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)` },
      { opacity: 1, offset: 0.12, transform: `translate(${offsetX * 0.9}px, ${offsetY * 0.9}px) rotate(${angle}deg)` },
      {
        opacity: 1,
        offset: 0.78,
        transform: `translate(${offsetX * 0.18}px, ${offsetY * 0.18}px) rotate(${angle}deg)`,
      },
      { opacity: 0, transform: `translate(0, 0) rotate(${angle}deg)` },
    ],
    {
      duration: 900,
      easing: "cubic-bezier(.2, .72, .25, 1)",
    },
  );
  meteorAnimation.addEventListener(
    "finish",
    () => {
      elements.tipMeteor.hidden = true;
      meteorAnimation = null;
      onArrival();
    },
    { once: true },
  );
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
  const standee = state.companionMode === "standee";
  const labels = {
    empty: "等待上傳照片",
    processing: standee ? "正在製作照片立牌" : "正在建立照片材質",
    ready: standee ? "照片立牌已放進小木屋" : "照片娃娃已放進小木屋",
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
  tips.slice(0, 12).forEach((tip, index) => {
    const note = document.createElement("article");
    note.className = `note ${tip.direction === "outgoing" ? "outgoing" : ""}`.trim();
    note.dataset.paper = String(index + 1);
    note.style.setProperty("--note-paper", tipPaperColors[index]);
    const by = document.createElement("b");
    by.textContent = tip.by;
    const text = document.createElement("span");
    text.textContent = tip.text;
    note.append(by, text);
    if (tip.direction === "outgoing") {
      const delivery = document.createElement("small");
      delivery.className = `tip-delivery ${tip.delivery}`;
      delivery.textContent = tip.delivery === "sent" ? "已送達" : tip.delivery === "failed" ? "傳送失敗" : "等待傳送";
      note.append(delivery);
    }
    elements.notes.append(note);
  });
}

function renderTasks() {
  elements.taskList.replaceChildren();
  const summary = taskTracker.getSummary();
  elements.taskSummaryBadge.textContent = `${summary.completed}/${summary.total}`;

  if (!taskTracker.tasks.length) {
    const empty = document.createElement("div");
    empty.className = "task-empty";
    empty.textContent = "尚未新增任務，輸入上方文字開始！";
    elements.taskList.append(empty);
    return;
  }

  taskTracker.tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = `task-item ${task.completed ? "completed" : ""}`.trim();
    item.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `標記任務「${task.title}」完成狀態`);

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    title.title = task.title;

    item.append(checkbox, title);

    if (task.pomodoros > 0) {
      const pomo = document.createElement("span");
      pomo.className = "task-pomo-badge";
      pomo.textContent = `🍅 ${task.pomodoros}`;
      pomo.title = `累計 ${task.pomodoros} 個番茄鐘`;
      item.append(pomo);
    }

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "task-del-btn";
    delBtn.setAttribute("aria-label", `刪除任務「${task.title}」`);
    delBtn.title = "刪除任務";
    const trashIcon = document.createElement("i");
    trashIcon.setAttribute("data-lucide", "trash-2");
    delBtn.append(trashIcon);
    item.append(delBtn);

    elements.taskList.append(item);
  });

  createIcons({ icons, root: elements.taskList });
}

function renderStats() {
  const summary = studyStats.getExecutiveSummary();
  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = studyStats.history
    .filter((h) => h.date === today)
    .reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
  const totalHarvest = Object.values(summary.harvestCounts).reduce((a, b) => a + b, 0);

  elements.streakBadge.textContent = `🔥 ${summary.streakDays} 天連續`;
  elements.statTodayMinutes.textContent = String(todayMinutes);
  elements.statTotalHours.textContent = String(summary.totalHours);
  elements.statCompletedSessions.textContent = String(summary.totalSessions);
  elements.statTotalHarvest.textContent = String(totalHarvest);
  renderHeatmap();
}

function renderHeatmap() {
  if (!elements.heatmapGrid) return;
  elements.heatmapGrid.replaceChildren();
  const data = studyStats.getHeatmapData(28);
  data.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = `heatmap-cell heat-box level-${day.level}`;
    cell.title = `${day.date}：專注 ${day.minutes} 分鐘`;
    elements.heatmapGrid.append(cell);
  });
}

function updateAtmosphere(mode = "auto") {
  let resolved = mode;
  if (mode === "auto") {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 17) resolved = "day";
    else if (hour >= 17 && hour < 19.5) resolved = "dusk";
    else resolved = "night";
  }
  elements.stage.dataset.atmosphere = resolved;
  const labels = {
    auto: "環境氛圍：自動（跟隨真實時間）",
    day: "環境氛圍：白晝陽光",
    dusk: "環境氛圍：黃昏晚霞",
    night: "環境氛圍：子夜星空",
  };
  if (elements.toggleAtmosphere) elements.toggleAtmosphere.title = labels[mode] || labels.auto;
}

let rainAnimationFrame = null;
const raindrops = Array.from({ length: 28 }, () => ({
  x: Math.random() * 88,
  y: Math.random() * 96,
  length: 6 + Math.random() * 8,
  speed: 1.5 + Math.random() * 2.5,
  opacity: 0.3 + Math.random() * 0.5,
}));

function startWindowRain() {
  if (rainAnimationFrame || !elements.windowRain) return;
  const ctx = elements.windowRain.getContext("2d");
  if (!ctx) return;
  function renderRain() {
    ctx.clearRect(0, 0, 88, 96);
    ctx.strokeStyle = "rgba(180, 220, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const drop of raindrops) {
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 0.5, drop.y + drop.length);
      drop.y += drop.speed;
      if (drop.y > 96) {
        drop.y = -drop.length;
        drop.x = Math.random() * 88;
      }
    }
    ctx.stroke();
    rainAnimationFrame = requestAnimationFrame(renderRain);
  }
  renderRain();
}

function stopWindowRain() {
  if (rainAnimationFrame) {
    cancelAnimationFrame(rainAnimationFrame);
    rainAnimationFrame = null;
  }
  if (elements.windowRain) {
    const ctx = elements.windowRain.getContext("2d");
    ctx?.clearRect(0, 0, 88, 96);
  }
}

function clampProgress(value) {
  return Math.max(0, Math.min(1, value));
}

function updateGarden(remaining = timer.remaining) {
  const totalSeconds = Math.max(1, timer.minutes * 60);
  const growth = clampProgress(1 - remaining / totalSeconds);
  const sprout = clampProgress(growth * 5);
  const leaves = clampProgress((growth - 0.18) / 0.5);
  const bloom = clampProgress((growth - 0.68) / 0.32);
  const stage =
    growth === 0 ? "種子" : growth < 0.18 ? "發芽" : growth < 0.68 ? "成長中" : growth < 1 ? "即將完成" : "完全成長";
  const plantType = store.get().plantType;

  elements.focusGarden.style.setProperty("--growth", growth.toFixed(4));
  elements.focusGarden.style.setProperty("--sprout", sprout.toFixed(4));
  elements.focusGarden.style.setProperty("--leaves", leaves.toFixed(4));
  elements.focusGarden.style.setProperty("--bloom", bloom.toFixed(4));
  elements.focusGarden.classList.toggle("complete", growth >= 1);

  const stageKey = `${plantType}:${stage}`;
  if (stageKey !== lastGardenStage) {
    const label = plantLabels[plantType];
    elements.gardenStatus.textContent = `${label} · ${stage}`;
    elements.focusGarden.setAttribute("aria-label", `專注植物：${label}，${stage}階段`);
    lastGardenStage = stageKey;
  }
}

function renderState(state) {
  if (document.activeElement !== elements.roomName) elements.roomName.value = state.roomName;
  if (document.activeElement !== elements.nickname) elements.nickname.value = state.nickname;
  if (document.activeElement !== elements.minutes) elements.minutes.value = state.minutes;
  if (document.activeElement !== elements.plantType) elements.plantType.value = state.plantType;
  if (document.activeElement !== elements.musicVolume) elements.musicVolume.value = state.musicVolume;
  elements.musicVolumeValue.value = `${state.musicVolume}%`;
  elements.focusGarden.dataset.plant = state.plantType;
  elements.avatarZone.dataset.companionMode = state.companionMode;
  elements.dollCanvas.setAttribute(
    "aria-label",
    state.companionMode === "standee" ? "可旋轉的照片伴讀立牌" : "可旋轉的 3D 伴讀娃娃",
  );
  elements.companionPanelTitle.textContent = state.companionMode === "standee" ? "照片伴讀立牌" : "照片伴讀夥伴";
  elements.dollStyleSwitch.hidden = state.companionMode === "standee";
  updateGarden();
  music.setVolume(state.musicVolume);
  elements.styleButtons.forEach((button) => {
    const active = button.dataset.dollStyle === state.dollStyle;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.companionModeButtons.forEach((button) => {
    const active = button.dataset.companionMode === state.companionMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderGeneration(state);
  renderTips(state.tips);
  if (viewer && (state.photo !== lastRenderedPhoto || state.standeePhoto !== lastRenderedStandeePhoto)) {
    viewer.setPhoto(state.photo, state.standeePhoto || state.photo);
    lastRenderedPhoto = state.photo;
    lastRenderedStandeePhoto = state.standeePhoto;
  }
  if (viewer && state.modelUrl !== lastRenderedModelUrl) {
    viewer.setModel(state.modelUrl);
    lastRenderedModelUrl = state.modelUrl;
  }
  if (viewer && state.generation !== lastRenderedGeneration) {
    viewer.setGeneration(state.generation);
    lastRenderedGeneration = state.generation;
  }
  if (viewer && state.companionMode !== lastRenderedCompanionMode) {
    viewer.setMode(state.companionMode);
    lastRenderedCompanionMode = state.companionMode;
  }
  if (viewer && state.dollStyle !== lastRenderedStyle) {
    viewer.setStyle(state.dollStyle);
    lastRenderedStyle = state.dollStyle;
  }
  elements.accessoryButtons.forEach((btn) => {
    const acc = btn.dataset.accessory;
    const active = Boolean(state.accessories?.[acc]);
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  if (viewer && state.accessories) {
    viewer.setAccessories(state.accessories);
  }
  updateAtmosphere(state.ambientMode);
}

function makeTip(text, by = store.get().nickname) {
  return {
    id: crypto.randomUUID(),
    by,
    text: text.trim().slice(0, 72),
    createdAt: Date.now(),
    direction: "outgoing",
    delivery: p2p?.role === "host" ? "sent" : "pending",
  };
}

function addAndSendTip(text, by = store.get().nickname) {
  const tip = makeTip(text, by);
  if (!tip.text) return { accepted: false, sent: false };
  store.addTip(tip, "outgoing");
  const sent = p2p?.sendTip(tip) || false;
  return { accepted: true, sent, pending: tip.delivery === "pending" };
}

async function processPhoto(file) {
  const processId = ++photoProcessId;
  const companionMode = store.get().companionMode;
  try {
    store.update({ generation: "processing", generationProgress: 4 });
    const asset = await createCompanionAsset(
      file,
      (generationProgress, label) => {
        if (processId !== photoProcessId) return;
        store.update({ generation: "processing", generationProgress });
        elements.generationLabel.textContent = label;
      },
      { companionMode },
    );
    if (processId !== photoProcessId) return;
    store.update({
      photo: asset.photo,
      standeePhoto: asset.standeePhoto,
      modelUrl: asset.modelUrl,
      generation: "ready",
      generationProgress: 100,
    });
    showToast(
      asset.mode === "standee"
        ? "照片立牌已放進小木屋。 "
        : asset.mode === "generated"
          ? "3D 模型已放進小木屋。 "
          : asset.warning
            ? "3D 生成暫時失敗，已改用照片娃娃。 "
            : "照片娃娃已放進小木屋。 ",
    );
  } catch (error) {
    if (processId !== photoProcessId) return;
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
    showToast("已移除角色照片。 ");
  });
}

function bindCompanionMode() {
  elements.companionModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const companionMode = button.dataset.companionMode;
      store.update({ companionMode });
      showToast(companionMode === "standee" ? "已換成照片伴讀立牌。 " : "已換回 3D 伴讀公仔。 ");
    });
  });
}

function bindDollStyle() {
  elements.styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dollStyle = button.dataset.dollStyle;
      store.update({ dollStyle });
      const label =
        dollStyle === "detective"
          ? "已換成原創推理 Q 版公仔。 "
          : dollStyle === "wizard"
            ? "已換成星空魔法學者公仔。 "
            : "已換回暖心公仔。 ";
      showToast(label);
    });
  });
}

function bindTimer() {
  timer.addEventListener("tick", (event) => {
    const minutes = Math.floor(event.detail / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(event.detail % 60)
      .toString()
      .padStart(2, "0");
    elements.timer.textContent = `${minutes}:${seconds}`;
    updateGarden(event.detail);
  });
  timer.addEventListener("running", (event) => {
    replaceButtonIcon(elements.toggleTimer, event.detail ? "pause" : "play", event.detail ? "暫停專注" : "開始專注");
    elements.focusGarden.classList.toggle("growing", event.detail);
    viewer?.setTimerState(event.detail ? "focusing" : "idle");
    p2p?.sendStatus(event.detail ? "focusing" : "resting", store.get().nickname, store.get().plantType);
    if (event.detail) {
      showCompanionBubble("專注計時開始～我們一起加油！✨", 3000);
    }
  });
  timer.addEventListener("complete", () => {
    viewer?.setTimerState("completed");
    companionSound.playCelebrationFanfare();
    showCompanionBubble("這輪專注完成了！起來活動一下筋骨，你超棒的 🎉", 5000);
    showToast("這輪完成了，留一張 Tip 給同房夥伴吧。 ");

    const activeTasks = taskTracker.getActiveTasks();
    let completedTaskId = null;
    if (activeTasks.length > 0) {
      completedTaskId = activeTasks[0].id;
      taskTracker.incrementPomodoro(completedTaskId);
      renderTasks();
    }
    studyStats.recordSession({
      durationMinutes: store.get().minutes,
      plantHarvested: store.get().plantType,
      taskId: completedTaskId,
    });
    renderStats();
  });
  elements.toggleTimer.addEventListener("click", () => timer.toggle());
  elements.resetTimer.addEventListener("click", () => {
    timer.reset();
    viewer?.setTimerState("idle");
  });
}

function bindMusic() {
  music.addEventListener("running", (event) => {
    replaceButtonIcon(
      elements.toggleMusic,
      event.detail ? "volume-2" : "music-2",
      event.detail ? "暫停背景音樂" : "播放背景音樂",
    );
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

function bindAmbientSound() {
  elements.toggleAmbient.addEventListener("click", () => {
    const isHidden = elements.ambientBar.hidden;
    elements.ambientBar.hidden = !isHidden;
    elements.toggleAmbient.classList.toggle("primary", isHidden);
    elements.toggleAmbient.setAttribute("aria-pressed", String(isHidden));
  });

  elements.ambientChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sound = chip.dataset.sound;
      const isPlaying = chip.classList.contains("active");
      if (isPlaying) {
        ambientSound.stopTrack(sound);
        chip.classList.remove("active");
        chip.setAttribute("aria-pressed", "false");
        if (sound === "rain") stopWindowRain();
      } else {
        ambientSound.startTrack(sound);
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        if (sound === "rain") startWindowRain();
      }
    });
  });

  elements.ambientVolume.addEventListener("input", () => {
    const volume = Number(elements.ambientVolume.value) / 100;
    ambientSound.setMasterVolume(volume);
    elements.ambientVolumeValue.value = `${elements.ambientVolume.value}%`;
  });
}

function bindPresets() {
  elements.presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const presetId = button.dataset.preset;
      const preset = SOUNDSCAPE_PRESETS[presetId];
      if (!preset) return;
      ambientSound.applyPreset(presetId);
      elements.ambientChips.forEach((chip) => {
        const sound = chip.dataset.sound;
        const isPlaying = sound in preset.tracks;
        chip.classList.toggle("active", isPlaying);
        chip.setAttribute("aria-pressed", String(isPlaying));
      });
      if ("rain" in preset.tracks) {
        startWindowRain();
      } else {
        stopWindowRain();
      }
      showToast(`已套用「${preset.name}」音景預設。`);
    });
  });
}

function bindAtmosphere() {
  const modes = ["auto", "day", "dusk", "night"];
  const cycleMode = () => {
    const current = store.get().ambientMode || "auto";
    const nextIdx = (modes.indexOf(current) + 1) % modes.length;
    const next = modes[nextIdx];
    store.update({ ambientMode: next });
    const labels = {
      auto: "已切換至「自動（跟隨真實時間）」",
      day: "已切換至「白晝陽光」",
      dusk: "已切換至「黃昏晚霞」",
      night: "已切換至「子夜星空」",
    };
    showToast(labels[next]);
  };
  elements.toggleAtmosphere?.addEventListener("click", cycleMode);
  elements.windowCelestial?.addEventListener("click", cycleMode);
}

function bindAccessories() {
  elements.accessoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const acc = button.dataset.accessory;
      const current = store.get().accessories || {};
      const next = { ...current, [acc]: !current[acc] };
      store.update({ accessories: next });
      const labels = {
        glasses: "復古金框眼鏡",
        crown: "學霸金冠",
        coffee: "暖心熱咖啡",
        cat: "伴讀小貓",
      };
      showToast(`${next[acc] ? "已為玩偶佩戴" : "已卸下"}${labels[acc] || acc}。`);
    });
  });
}

function bindP2PCheer() {
  elements.sendCheer?.addEventListener("click", () => {
    const res = p2p?.sendCelebration("clap", store.get().nickname);
    companionSound.playTapChime();
    if (res) {
      showToast("已向同房夥伴送出喝采拍手！👏");
    } else {
      showToast("喝采拍手已準備，連線後夥伴會收到。");
    }
  });
}

function bindExports() {
  elements.copyMarkdownLog?.addEventListener("click", async () => {
    const md = studyStats.exportMarkdownSummary(taskTracker.tasks);
    try {
      await navigator.clipboard.writeText(md);
      showToast("今日 Markdown 伴讀日誌已複製到剪貼簿！📋");
    } catch {
      showToast("無法存取剪貼簿，請稍後重試。");
    }
  });

  elements.exportBackupJson?.addEventListener("click", () => {
    const json = studyStats.exportJsonBackup(taskTracker.tasks);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `newworld-study-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("學習記錄 JSON 備份檔已開始下載。📥");
  });
}

function bindTasks() {
  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = elements.taskInput.value.trim();
    if (!title) return;
    taskTracker.addTask(title);
    elements.taskInput.value = "";
    renderTasks();
  });

  elements.taskList.addEventListener("click", (event) => {
    const target = event.target;
    const item = target.closest(".task-item");
    if (!item) return;
    const taskId = item.dataset.taskId;

    if (target.classList.contains("task-checkbox")) {
      const isCompleted = taskTracker.toggleTask(taskId);
      if (isCompleted) {
        companionSound.playTapChime();
        showToast("任務已完成！繼續保持 🌟");
      }
      renderTasks();
      return;
    }

    const delBtn = target.closest(".task-del-btn");
    if (delBtn) {
      taskTracker.removeTask(taskId);
      renderTasks();
    }
  });

  renderTasks();
}

function bindTips() {
  elements.noteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = elements.noteInput.value.trim();
    if (!text) return;
    const result = addAndSendTip(text);
    elements.noteInput.value = "";
    showToast(result.pending && !result.sent ? "Tip 已加入待送，連線後會自動補送。 " : "Tip 已送出。 ");
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
  elements.nickname.addEventListener("change", () => {
    store.update({ nickname: elements.nickname.value });
  });
  elements.minutes.addEventListener("change", () => {
    const minutes = Math.max(5, Math.min(120, Number(elements.minutes.value) || 25));
    store.update({ minutes });
    timer.setMinutes(minutes);
  });
  elements.plantType.addEventListener("change", () => {
    lastGardenStage = "";
    store.update({ plantType: elements.plantType.value });
    showToast(`這一輪種植${plantLabels[store.get().plantType]}。 `);
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
  const shareInvite = async () => {
    const url = elements.inviteLink.value;
    if (!url.startsWith("http")) return;
    try {
      if (navigator.share) await navigator.share({ title: store.get().roomName, text: "一起來小木屋伴讀", url });
      else await navigator.clipboard.writeText(url);
      showToast(navigator.share ? "已開啟分享選單。 " : "邀請連結已複製。 ");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("目前無法分享，請使用複製連結。 ");
    }
  };
  elements.shareRoom.addEventListener("click", shareInvite);
  elements.mobileShareRoom.addEventListener("click", shareInvite);
  elements.retryConnection.addEventListener("click", () => restartP2P());
}

async function startP2P() {
  const { P2PRoom } = await import("./services/p2p-room.js");
  p2p = new P2PRoom({ getSnapshot: () => store.get() });
  p2p.addEventListener("ready", (event) => {
    const info = event.detail;
    if (info.role === "host") store.setRoomId(info.hostId, { migrateCurrent: true, includeStarters: true });
    elements.roomCode.textContent = `room://${info.hostId.slice(0, 16)}`;
    elements.inviteLink.value = info.invite;
    elements.copyInvite.disabled = false;
    elements.shareRoom.disabled = false;
    elements.mobileShareRoom.disabled = false;
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
    if (store.addTip({ ...event.detail, direction: "incoming", delivery: "received" }, "incoming")) {
      showRemoteTipSignal();
      showToast(`${event.detail.by} 傳來一張 Tip。 `);
    }
  });
  p2p.addEventListener("tip-delivery", (event) => store.markTipDelivery(event.detail.id, event.detail.delivery));
  p2p.addEventListener("peer-celebrate", (event) => {
    const detail = event.detail;
    companionSound.playCelebrationFanfare();
    if (elements.celebrateBanner && elements.celebrateText) {
      elements.celebrateText.textContent = `🎉 ${detail.by || "夥伴"} 送來了拍手喝采！`;
      elements.celebrateBanner.hidden = false;
      window.setTimeout(() => {
        if (elements.celebrateBanner) elements.celebrateBanner.hidden = true;
      }, 4500);
    }
    showToast(`🎉 ${detail.by || "夥伴"} 為你送上喝采！`);
  });
  p2p.addEventListener("peer-status", (event) => {
    const detail = event.detail;
    if (elements.peerStatusBar && elements.peerStatusText) {
      const statusText = detail.status === "focusing" ? "正在專注沈浸中 🎯" : "正在小憩喝水 🍵";
      elements.peerStatusText.textContent = `${detail.by} ${statusText}`;
      elements.peerStatusBar.hidden = false;
      window.setTimeout(() => {
        if (elements.peerStatusBar) elements.peerStatusBar.hidden = true;
      }, 6000);
    }
  });
  p2p.addEventListener("security-event", (event) => showToast(event.detail));
  p2p.addEventListener("network-error", (event) => showToast(event.detail));
  await p2p.start();
  p2p.restoreOutbox(store.getPendingTips());
}

async function restartP2P() {
  if (p2pStartPromise) return;
  p2p?.destroy();
  elements.copyInvite.disabled = true;
  elements.shareRoom.disabled = true;
  elements.mobileShareRoom.disabled = true;
  p2pStartPromise = startP2P()
    .catch((error) => showToast(error.message || "P2P 初始化失敗，Tip 會等待下次連線。 "))
    .finally(() => {
      p2pStartPromise = null;
    });
  await p2pStartPromise;
}

function bindMobileNavigation() {
  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function startViewer() {
  try {
    const { DollViewer } = await import("./services/doll-viewer.js");
    viewer = new DollViewer(elements.dollCanvas, elements.avatarZone);
    viewer.onTap = () => {
      companionSound.playTapChime();
      const isRunning = elements.focusGarden.classList.contains("growing");
      const quotes = isRunning ? focusQuotes : companionQuotes;
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      showCompanionBubble(quote);
    };
    viewer.onJoySpin = () => {
      companionSound.playCelebrationFanfare();
      showCompanionBubble("哇～旋轉大跳躍！今天的精神滿分！💫🌟", 3600);
      showToast("解鎖伴讀玩偶 360° 開心旋轉！🎉");
    };
    renderState(store.get());
  } catch {
    elements.dollCanvas.hidden = true;
    showToast("目前瀏覽器無法顯示 3D，已切換為簡易娃娃。 ");
  }
}

function init() {
  store.subscribe(renderState);
  bindImageUpload();
  bindCompanionMode();
  bindDollStyle();
  bindAccessories();
  bindAtmosphere();
  bindTimer();
  bindMusic();
  bindAmbientSound();
  bindPresets();
  bindP2PCheer();
  bindTasks();
  bindExports();
  renderStats();
  bindTips();
  bindTipSignal();
  bindSettings();
  bindMobileNavigation();
  elements.avatarFallback?.addEventListener("click", () => {
    viewer?.triggerBounce();
    viewer?.onTap?.();
  });
  timer.emitTick();
  startViewer();
  restartP2P();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  window.addEventListener("beforeunload", () => {
    p2p?.destroy();
    viewer?.dispose();
    music.destroy();
    ambientSound.stopAll();
    stopWindowRain();
  });
}

init();
