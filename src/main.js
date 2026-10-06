import "./styles.css";
import {
  Activity,
  BarChart2,
  Bell,
  BellOff,
  BellRing,
  BookmarkPlus,
  BookOpen,
  Cat,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCopy,
  CloudRain,
  Camera,
  Copy,
  Crosshair,
  Crown,
  Cuboid,
  Download,
  Flame,
  Glasses,
  GripVertical,
  HandMetal,
  House,
  Image as ImageIcon,
  ImagePlus,
  Keyboard,
  Lightbulb,
  ListPlus,
  Maximize2,
  Minimize2,
  MessageCircleHeart,
  Music,
  Music2,
  Pause,
  PanelTop,
  Pencil,
  Play,
  Plus,
  PlusCircle,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shuffle,
  Sliders,
  Smartphone,
  Sparkle,
  Sparkles,
  SunMoon,
  Trash2,
  Volume2,
  Wand2,
  Waves,
  Wind,
  X,
  Zap,
  createIcons,
} from "lucide";
import {
  AmbientSoundscapeManager,
  SOUNDSCAPE_PRESETS,
  ACOUSTIC_PRESETS,
  encodeSoundscapeCode,
  decodeSoundscapeCode,
} from "./services/ambient-sound.js";
import { BackgroundMusic } from "./services/background-music.js";
import { CompanionSoundManager } from "./services/companion-sound.js";
import { createCompanionAsset } from "./services/doll-generation.js";
import { FocusTimer, SPRINT_PRESETS } from "./services/focus-timer.js";
import { LofiGenerator } from "./services/lofi-generator.js";
import { NotificationManager } from "./services/notification-manager.js";
import { StudyStatsManager } from "./services/study-stats.js";
import { TaskTracker } from "./services/task-tracker.js";
import { FocusPosterGenerator } from "./services/poster-generator.js";
import { renderQrToCanvas, downloadQrCanvas, copyQrCanvasToClipboard } from "./services/qr-generator.js";
import { WeatherEngine } from "./services/weather-engine.js";
import { createStore, AFFINITY_RANKS, getAffinityRank, AFFINITY_AURAS, getUnlockedAura } from "./state/store.js";

const icons = {
  Activity,
  BarChart2,
  Bell,
  BellOff,
  BellRing,
  BookmarkPlus,
  BookOpen,
  Camera,
  Cat,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCopy,
  CloudRain,
  Copy,
  Crosshair,
  Crown,
  Cuboid,
  Download,
  Flame,
  Glasses,
  GripVertical,
  HandMetal,
  House,
  Image: ImageIcon,
  ImagePlus,
  Keyboard,
  Lightbulb,
  ListPlus,
  Maximize2,
  Minimize2,
  MessageCircleHeart,
  Music,
  Music2,
  Pause,
  PanelTop,
  Pencil,
  Play,
  Plus,
  PlusCircle,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shuffle,
  Sliders,
  Smartphone,
  Sparkle,
  Sparkles,
  SunMoon,
  Trash2,
  Volume2,
  Wand2,
  Waves,
  Wind,
  X,
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
  timerModeBar: $("#timerModeBar"),
  timerModePills: [...document.querySelectorAll(".timer-mode-pill")],
  cycleCountBadge: $("#cycleCountBadge"),
  timerSyncBadge: $("#timerSyncBadge"),
  pillShortBreakText: $("#pillShortBreakText"),
  pillLongBreakText: $("#pillLongBreakText"),
  btnWoodenFish: $("#btnWoodenFish"),
  btnSingingBowl: $("#btnSingingBowl"),
  btnBreathingGuide: $("#btnBreathingGuide"),
  zenSparks: $("#zenSparks"),
  categoryPicker: $("#categoryPicker"),
  categoryChips: [...document.querySelectorAll(".category-chip")],
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
  peerReactionTray: $("#peerReactionTray"),
  reactionChips: [...document.querySelectorAll(".reaction-chip")],
  floatingReactions: $("#floatingReactions"),
  focusIntentionBar: $("#focusIntentionBar"),
  focusIntentionInput: $("#focusIntentionInput"),
  btnSyncActiveTask: $("#btnSyncActiveTask"),
  zenFocusIntention: $("#zenFocusIntention"),
  zenIntentionText: $("#zenIntentionText"),
  ambientBar: $("#ambientBar"),
  ambientVolume: $("#ambientVolume"),
  ambientVolumeValue: $("#ambientVolumeValue"),
  ambientChips: [...document.querySelectorAll(".ambient-chip")],
  ambientMixer: $("#ambientMixer"),
  ambientMixerCount: $("#ambientMixerCount"),
  ambientMixerTracks: $("#ambientMixerTracks"),
  btnSpatialCabin: $("#btnSpatialCabin"),
  btnSpatialCenter: $("#btnSpatialCenter"),
  presetButtons: [...document.querySelectorAll(".preset-btn")],
  customPresetsRow: $("#customPresetsRow"),
  customPresetsList: $("#customPresetsList"),
  saveCustomPresetBtn: $("#saveCustomPresetBtn"),
  btnImportSoundscape: $("#btnImportSoundscape"),
  taskPanel: $("#taskPanel"),
  taskForm: $("#taskForm"),
  taskInput: $("#taskInput"),
  taskTargetPomo: $("#taskTargetPomo"),
  taskList: $("#taskList"),
  taskSummaryBadge: $("#taskSummaryBadge"),
  statsPanel: $("#statsPanel"),
  streakBadge: $("#streakBadge"),
  statTodayMinutes: $("#statTodayMinutes"),
  statTotalHours: $("#statTotalHours"),
  statCompletedSessions: $("#statCompletedSessions"),
  statTotalHarvest: $("#statTotalHarvest"),
  heatmapSection: $("#heatmapSection"),
  heatmapRangeLabel: $("#heatmapRangeLabel"),
  heatmapPrev: $("#heatmapPrev"),
  heatmapReset: $("#heatmapReset"),
  heatmapNext: $("#heatmapNext"),
  heatmapThemeChips: [...document.querySelectorAll(".heatmap-theme-picker .theme-chip")],
  heatmapGrid: $("#heatmapGrid"),
  hourlySection: $("#hourlySection"),
  peakFlowBadge: $("#peakFlowBadge"),
  hourlyChartSvg: $("#hourlyChartSvg"),
  categorySection: $("#categorySection"),
  categoryLeadBadge: $("#categoryLeadBadge"),
  categoryBreakdownList: $("#categoryBreakdownList"),
  sessionTimelineSection: $("#sessionTimelineSection"),
  sessionTimelineCount: $("#sessionTimelineCount"),
  sessionTimelineList: $("#sessionTimelineList"),
  flowReflectionPrompt: $("#flowReflectionPrompt"),
  flowReflectionBtns: [...document.querySelectorAll(".reflection-btn")],
  weeklyTrendCard: $("#weeklyTrendCard"),
  weeklyTrendDiffBadge: $("#weeklyTrendDiffBadge"),
  weeklyTrendStat: $("#weeklyTrendStat"),
  weeklyTrendFlowRate: $("#weeklyTrendFlowRate"),
  copyMarkdownLog: $("#copyMarkdownLog"),
  btnExportWeeklyReport: $("#btnExportWeeklyReport"),
  exportBackupJson: $("#exportBackupJson"),
  btnOpenPoster: $("#btnOpenPoster"),
  posterModal: $("#posterModal"),
  closePoster: $("#closePoster"),
  posterCanvasWrapper: $("#posterCanvasWrapper"),
  posterThemeRow: $("#posterThemeRow"),
  posterThemeChips: document.querySelectorAll(".poster-theme-chip"),
  btnDownloadPoster: $("#btnDownloadPoster"),
  btnCopyPoster: $("#btnCopyPoster"),
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
  shortBreakMinutes: $("#shortBreakMinutes"),
  longBreakMinutes: $("#longBreakMinutes"),
  completionChime: $("#completionChime"),
  syncWithHostTimer: $("#syncWithHostTimer"),
  p2pSyncRow: $("#p2pSyncRow"),
  plantType: $("#plantType"),
  musicVolume: $("#musicVolume"),
  musicVolumeValue: $("#musicVolumeValue"),
  inviteLink: $("#inviteLink"),
  btnShowInviteQr: $("#btnShowInviteQr"),
  copyInvite: $("#copyInvite"),
  roleBadge: $("#roleBadge"),
  connectionStatus: $("#connectionStatus"),
  retryConnection: $("#retryConnection"),
  toggleNotification: $("#toggleNotification"),
  notificationIcon: $("#notificationIcon"),
  notificationBtnText: $("#notificationBtnText"),
  toggleZen: $("#toggleZen"),
  exitZenBtn: $("#exitZenBtn"),
  openShortcuts: $("#openShortcuts"),
  shortcutsModal: $("#shortcutsModal"),
  closeShortcuts: $("#closeShortcuts"),
  openHerbarium: $("#openHerbarium"),
  herbariumModal: $("#herbariumModal"),
  closeHerbarium: $("#closeHerbarium"),
  tabPlants: $("#tabPlants"),
  tabBadges: $("#tabBadges"),
  plantsView: $("#plantsView"),
  badgesView: $("#badgesView"),
  breathingModal: $("#breathingModal"),
  closeBreathing: $("#closeBreathing"),
  modeBoxBreathing: $("#modeBoxBreathing"),
  modeRelaxBreathing: $("#modeRelaxBreathing"),
  modeAwakeBreathing: $("#modeAwakeBreathing"),
  breathingModePills: [...document.querySelectorAll(".breathing-mode-pill")],
  breathingHaloOuter: $("#breathingHaloOuter"),
  breathingPhaseText: $("#breathingPhaseText"),
  breathingSecondsText: $("#breathingSecondsText"),
  btnToggleBreathing: $("#btnToggleBreathing"),
  breathingPlayIcon: $("#breathingPlayIcon"),
  breathingPlayText: $("#breathingPlayText"),
  breathingCycleBadge: $("#breathingCycleBadge"),
  sleepBubble: $("#sleepBubble"),
  petHearts: $("#petHearts"),
  lofiChip: $("#lofiChip"),
  toast: $("#toast"),
  sprintPresetPicker: $("#sprintPresetPicker"),
  sprintChips: [...document.querySelectorAll(".sprint-chip")],
  btnQuickDistraction: $("#btnQuickDistraction"),
  parkingBadge: $("#parkingBadge"),
  fireplaceGlow: $("#fireplaceGlow"),
  taskForecastBadge: $("#taskForecastBadge"),
  btnBatchImportTasks: $("#btnBatchImportTasks"),
  btnClearCompletedTasks: $("#btnClearCompletedTasks"),
  distractionModal: $("#distractionModal"),
  closeDistraction: $("#closeDistraction"),
  distractionForm: $("#distractionForm"),
  distractionInput: $("#distractionInput"),
  distractionList: $("#distractionList"),
  parkingLotCount: $("#parkingLotCount"),
  btnClearFinishedParking: $("#btnClearFinishedParking"),
  batchTaskModal: $("#batchTaskModal"),
  closeBatchTask: $("#closeBatchTask"),
  batchTaskInput: $("#batchTaskInput"),
  btnCancelBatchTask: $("#btnCancelBatchTask"),
  btnConfirmBatchTasks: $("#btnConfirmBatchTasks"),
  btnPeerClink: $("#btnPeerClink"),
  btnPeerKnock: $("#btnPeerKnock"),
  flowAutopilot: $("#flowAutopilot"),
  windDownAlert: $("#windDownAlert"),
  btnOpenMigration: $("#btnOpenMigration"),
  migrationModal: $("#migrationModal"),
  closeMigration: $("#closeMigration"),
  btnExportMigration: $("#btnExportMigration"),
  migrationExportText: $("#migrationExportText"),
  migrationImportText: $("#migrationImportText"),
  btnApplyMigration: $("#btnApplyMigration"),
  btnP2PLivePush: $("#btnP2PLivePush"),
  btnShowMigrationQr: $("#btnShowMigrationQr"),
  migrationP2PStatus: $("#migrationP2PStatus"),
  qrModal: $("#qrModal"),
  closeQrModal: $("#closeQrModal"),
  btnCloseQrModalDialog: $("#btnCloseQrModalDialog"),
  qrCanvas: $("#qrCanvas"),
  qrModalTitle: $("#qrModalTitle"),
  qrModalSubtitle: $("#qrModalSubtitle"),
  qrModalDesc: $("#qrModalDesc"),
  qrModalUrlInput: $("#qrModalUrlInput"),
  btnCopyQrUrl: $("#btnCopyQrUrl"),
  btnDownloadQr: $("#btnDownloadQr"),
  btnCopyQrImage: $("#btnCopyQrImage"),
  windowWeather: $("#windowWeather"),
  ambientWeatherRow: $("#ambientWeatherRow"),
  weatherChips: document.querySelectorAll(".weather-chip"),
  btnFlowPrep: $("#btnFlowPrep"),
  flowPrepModal: $("#flowPrepModal"),
  closeFlowPrep: $("#closeFlowPrep"),
  prepIntentionInput: $("#prepIntentionInput"),
  prepBreathRing: $("#prepBreathRing"),
  prepBreathPhaseText: $("#prepBreathPhaseText"),
  prepBreathSubtext: $("#prepBreathSubtext"),
  prepBreathCounter: $("#prepBreathCounter"),
  btnSkipPrepBreath: $("#btnSkipPrepBreath"),
  btnStartFlowFromPrep: $("#btnStartFlowFromPrep"),

  // Acoustic FX
  btnToggleAcousticFX: $("#btnToggleAcousticFX"),
  acousticFxPanel: $("#acousticFxPanel"),
  acousticPresetBtns: [...document.querySelectorAll(".acoustic-preset-btn")],
  sliderReverbWet: $("#sliderReverbWet"),
  reverbWetValue: $("#reverbWetValue"),
  sliderEqBass: $("#sliderEqBass"),
  eqBassValue: $("#eqBassValue"),
  sliderEqMid: $("#sliderEqMid"),
  eqMidValue: $("#eqMidValue"),
  sliderEqTreble: $("#sliderEqTreble"),
  eqTrebleValue: $("#eqTrebleValue"),

  // Timeline Filter
  timelineFilterBar: $("#timelineFilterBar"),
  timelineRangeChips: [...document.querySelectorAll(".timeline-range-chip")],
  timelineFilterPills: [...document.querySelectorAll(".timeline-filter-pill")],
  timelineSummaryText: $("#timelineSummaryText"),

  // Companion Affinity
  btnCompanionAffinity: $("#btnCompanionAffinity"),
  affinityBadgeIcon: $("#affinityBadgeIcon"),
  affinityBadgeLevel: $("#affinityBadgeLevel"),
  affinityBadgeExp: $("#affinityBadgeExp"),
  affinityMiniFill: $("#affinityMiniFill"),
  affinityModal: $("#affinityModal"),
  closeAffinity: $("#closeAffinity"),
  affinityCurrentAvatar: $("#affinityCurrentAvatar"),
  affinityCurrentTitle: $("#affinityCurrentTitle"),
  affinityTotalExp: $("#affinityTotalExp"),
  affinityProgressFill: $("#affinityProgressFill"),
  affinityCurrentQuote: $("#affinityCurrentQuote"),
  affinityTiersList: $("#affinityTiersList"),
  affinityAuraChips: $("#affinityAuraChips"),

  // Flow Momentum & Smart Break
  flowMomentumBadge: $("#flowMomentumBadge"),
  momentumIcon: $("#momentumIcon"),
  momentumText: $("#momentumText"),
  momentumMiniFill: $("#momentumMiniFill"),
  smartBreakSuggestion: $("#smartBreakSuggestion"),
  smartBreakText: $("#smartBreakText"),
  btnApplySmartBreak: $("#btnApplySmartBreak"),
};

const store = createStore({
  roomId: initialHostId || `local-${crypto.randomUUID()}`,
  includeStarterTips: !initialHostId,
  migrateLegacy: !initialHostId,
});
const timer = new FocusTimer(store.get().minutes);
timer.setBreakDurations({
  shortBreak: store.get().shortBreakMinutes || 5,
  longBreak: store.get().longBreakMinutes || 15,
});
const music = new BackgroundMusic(store.get().musicVolume);
const ambientSound = new AmbientSoundscapeManager();
const lofiGenerator = new LofiGenerator();
const taskTracker = new TaskTracker();
const studyStats = new StudyStatsManager();
const companionSound = new CompanionSoundManager(0.4);
const notificationManager = new NotificationManager({ baseTitle: "NewWorld Study Room" });
const weatherEngine = new WeatherEngine(elements.windowRain);
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
let lastRecordedSessionId = null;
let flowReflectionTimer = null;

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
  elements.taskSummaryBadge.textContent = `${summary.completed}/${summary.total} (🍅 ${summary.totalPomodoros}/${summary.totalTargetPomodoros})`;

  if (elements.taskForecastBadge) {
    const forecast = taskTracker.getForecast(timer.minutes || 25);
    if (summary.total === 0) {
      elements.taskForecastBadge.textContent = "待安排 🍅";
    } else if (forecast.remainingPomodoros === 0) {
      elements.taskForecastBadge.textContent = "全部完成 ✨";
    } else {
      elements.taskForecastBadge.textContent = `預計 ${forecast.remainingPomodoros} 🍅 · ${forecast.formattedDuration}`;
    }
  }

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
    item.draggable = true;

    // Drag handle
    const handle = document.createElement("span");
    handle.className = "task-drag-handle";
    handle.title = "按住拖曳排序";
    const gripIcon = document.createElement("i");
    gripIcon.setAttribute("data-lucide", "grip-vertical");
    handle.append(gripIcon);

    // Reorder buttons for accessibility / mobile
    const moveBtns = document.createElement("div");
    moveBtns.className = "task-move-btns";
    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "task-move-btn up";
    upBtn.title = "上移任務";
    upBtn.setAttribute("aria-label", `上移任務「${task.title}」`);
    const upIcon = document.createElement("i");
    upIcon.setAttribute("data-lucide", "chevron-up");
    upBtn.append(upIcon);
    upBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (taskTracker.moveTask(task.id, "up")) {
        renderTasks();
      }
    });

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "task-move-btn down";
    downBtn.title = "下移任務";
    downBtn.setAttribute("aria-label", `下移任務「${task.title}」`);
    const downIcon = document.createElement("i");
    downIcon.setAttribute("data-lucide", "chevron-down");
    downBtn.append(downIcon);
    downBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (taskTracker.moveTask(task.id, "down")) {
        renderTasks();
      }
    });
    moveBtns.append(upBtn, downBtn);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `標記任務「${task.title}」完成狀態`);

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    title.title = task.title;

    // Pomodoro progress stepper
    const pomoProg = document.createElement("div");
    pomoProg.className = "task-pomo-progress";
    pomoProg.title = `累計 ${task.pomodoros} / 目標 ${task.targetPomodoros || 1} 個番茄鐘`;

    const decBtn = document.createElement("button");
    decBtn.type = "button";
    decBtn.className = "pomo-step-btn dec";
    decBtn.textContent = "-";
    decBtn.title = "減少目標番茄鐘數";
    decBtn.setAttribute("aria-label", `減少「${task.title}」目標番茄鐘數`);
    decBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      taskTracker.setTargetPomodoros(task.id, (task.targetPomodoros || 1) - 1);
      renderTasks();
    });

    const pomoText = document.createElement("span");
    pomoText.className = "task-pomo-text";
    pomoText.textContent = `🍅 ${task.pomodoros}/${task.targetPomodoros || 1}`;

    const incBtn = document.createElement("button");
    incBtn.type = "button";
    incBtn.className = "pomo-step-btn inc";
    incBtn.textContent = "+";
    incBtn.title = "增加目標番茄鐘數";
    incBtn.setAttribute("aria-label", `增加「${task.title}」目標番茄鐘數`);
    incBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      taskTracker.setTargetPomodoros(task.id, (task.targetPomodoros || 1) + 1);
      renderTasks();
    });

    pomoProg.append(decBtn, pomoText, incBtn);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "task-del-btn";
    delBtn.setAttribute("aria-label", `刪除任務「${task.title}」`);
    delBtn.title = "刪除任務";
    const trashIcon = document.createElement("i");
    trashIcon.setAttribute("data-lucide", "trash-2");
    delBtn.append(trashIcon);

    // Pomodoro budget progress bar
    const targetCount = Math.max(1, task.targetPomodoros || 1);
    const completedCount = task.pomodoros || 0;
    const pct = Math.min(100, Math.round((completedCount / targetCount) * 100));
    const isTargetMet = completedCount >= targetCount;

    const pomoBarWrapper = document.createElement("div");
    pomoBarWrapper.className = `task-pomo-bar-wrapper ${isTargetMet ? "target-met" : ""}`.trim();
    pomoBarWrapper.title = `番茄鐘進度：${completedCount} / ${targetCount} (${pct}%)`;

    const pomoBarFill = document.createElement("div");
    pomoBarFill.className = "task-pomo-bar-fill";
    pomoBarFill.style.width = `${pct}%`;
    pomoBarWrapper.append(pomoBarFill);

    item.append(handle, moveBtns, checkbox, title, pomoProg, delBtn, pomoBarWrapper);

    // HTML5 Drag and drop listeners
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id);
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      elements.taskList.querySelectorAll(".task-item").forEach((el) => el.classList.remove("drag-over"));
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      const sourceId = e.dataTransfer.getData("text/plain");
      if (!sourceId || sourceId === task.id) return;
      const currentIds = taskTracker.tasks.map((t) => t.id);
      const sourceIdx = currentIds.indexOf(sourceId);
      const targetIdx = currentIds.indexOf(task.id);
      if (sourceIdx !== -1 && targetIdx !== -1) {
        currentIds.splice(sourceIdx, 1);
        currentIds.splice(targetIdx, 0, sourceId);
        taskTracker.reorderTasks(currentIds);
        renderTasks();
      }
    });

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
  renderHourlyDistribution();
  renderCategoryBreakdown();
  renderWeeklyTrend();
  renderSessionTimeline();
}

function renderWeeklyTrend() {
  if (!elements.weeklyTrendCard) return;
  const trend = studyStats.getWeeklyTrend();
  if (elements.weeklyTrendDiffBadge) {
    const sign = trend.diffPercent >= 0 ? `+${trend.diffPercent}%` : `${trend.diffPercent}%`;
    elements.weeklyTrendDiffBadge.textContent = sign;
    elements.weeklyTrendDiffBadge.classList.toggle("negative", trend.diffPercent < 0);
  }
  if (elements.weeklyTrendStat) {
    elements.weeklyTrendStat.textContent = `本週 ${trend.currentHours}h · 巔峰：${trend.mostProductiveDay}`;
  }
  if (elements.weeklyTrendFlowRate) {
    elements.weeklyTrendFlowRate.textContent = `🌊 心流率 ${trend.flowRate}%`;
  }
}

function renderCategoryBreakdown() {
  if (!elements.categoryBreakdownList) return;
  const breakdown = studyStats.getCategoryBreakdown();

  if (elements.categoryLeadBadge) {
    if (breakdown.topCategory) {
      elements.categoryLeadBadge.textContent = `主領域：${breakdown.topCategory.icon} ${breakdown.topCategory.label} (${breakdown.topCategory.percent}%)`;
    } else {
      elements.categoryLeadBadge.textContent = "尚無領域記錄";
    }
  }

  elements.categoryBreakdownList.innerHTML = breakdown.categories
    .map((cat) => {
      return `
        <div class="category-breakdown-row">
          <div class="category-row-meta">
            <span class="category-row-label">
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
            </span>
            <span class="category-row-stats">${cat.minutes} 分鐘 · ${cat.percent}%</span>
          </div>
          <div class="category-bar-bg">
            <div class="category-bar-fill" style="width: ${cat.percent}%; background: ${cat.color};"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

const timelineFilter = {
  range: "today",
  rating: "all",
};

function renderSessionTimeline() {
  if (!elements.sessionTimelineList) return;
  const filtered = studyStats.getFilteredSessions(timelineFilter);
  if (elements.sessionTimelineCount) {
    elements.sessionTimelineCount.textContent = `${filtered.totalCount} 次完成`;
  }
  if (elements.timelineSummaryText) {
    elements.timelineSummaryText.textContent = `共 ${filtered.totalCount} 輪 · ${filtered.totalMinutes} 分鐘 · 心流率 ${filtered.flowRate}%`;
  }
  if (filtered.sessions.length === 0) {
    elements.sessionTimelineList.innerHTML = `<div class="session-timeline-empty">此篩選條件下尚無專注記錄，開始專注來播種吧！🌱</div>`;
    return;
  }

  const categoryConfigs = {
    dev: { label: "開發", icon: "💻", bg: "rgba(56, 189, 248, 0.2)", color: "#38bdf8" },
    read: { label: "閱讀", icon: "📚", bg: "rgba(52, 211, 153, 0.2)", color: "#34d399" },
    write: { label: "寫作", icon: "✍️", bg: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" },
    design: { label: "設計", icon: "🎨", bg: "rgba(244, 114, 182, 0.2)", color: "#f472b6" },
    review: { label: "複習", icon: "🧠", bg: "rgba(167, 139, 250, 0.2)", color: "#a78bfa" },
  };

  const plantEmojis = {
    rose: "🌹",
    sunflower: "🌻",
    lavender: "🪻",
    tulip: "🌷",
    cactus: "🌵",
    pine: "🌲",
  };

  elements.sessionTimelineList.innerHTML = "";
  filtered.sessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = "session-timeline-item";

    const timeStr = session.timestamp ? new Date(session.timestamp).toTimeString().slice(0, 5) : "--:--";
    const datePrefix = timelineFilter.range !== "today" && session.date ? `${session.date.slice(5)} ` : "";
    const cat = categoryConfigs[session.category] || categoryConfigs.dev;
    const plantEmoji = plantEmojis[session.plantHarvested] || "🌱";

    const ratingBadges = {
      flow: { label: "深度心流", icon: "🔥" },
      steady: { label: "穩定推進", icon: "✨" },
      warmup: { label: "漸入佳境", icon: "🌱" },
    };
    const rat = ratingBadges[session.rating] || ratingBadges.flow;
    const noteHtml = session.note ? `<span class="timeline-note" title="${session.note}">${session.note}</span>` : "";

    item.innerHTML = `
      <span class="timeline-time">${datePrefix}${timeStr}</span>
      <span class="timeline-category-badge" style="background: ${cat.bg}; color: ${cat.color};">
        <span>${cat.icon}</span>
        <span>${cat.label}</span>
      </span>
      <button type="button" class="timeline-rating" title="心流狀態：${rat.label} (點擊切換)" aria-label="切換心流狀態：${rat.label}">${rat.icon}</button>
      <span class="timeline-task-title" title="${session.taskTitle || "自主專注"}">${session.taskTitle || "自主專注"}</span>
      ${noteHtml}
      <span class="timeline-duration">${session.durationMinutes}m</span>
      <span class="timeline-plant" title="收穫 ${session.plantHarvested || "植物"}">${plantEmoji}</span>
    `;

    const ratBtn = item.querySelector(".timeline-rating");
    ratBtn?.addEventListener("click", () => {
      const nextRating = session.rating === "flow" ? "steady" : session.rating === "steady" ? "warmup" : "flow";
      studyStats.updateSession(session.id, { rating: nextRating });
      renderStats();
      showToast(`已將此記錄調整為「${ratingBadges[nextRating].label}」！`);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "timeline-del-btn";
    delBtn.title = "刪除此筆專注記錄";
    delBtn.setAttribute("aria-label", "刪除此筆記錄");
    delBtn.innerHTML = "&times;";
    delBtn.addEventListener("click", () => {
      const removed = studyStats.deleteSession(session.id);
      if (removed) {
        renderStats();
        if (elements.herbariumModal?.open) {
          renderHerbarium();
        }
        showToast("已刪除該次專注記錄。");
      }
    });

    item.append(delBtn);
    elements.sessionTimelineList.append(item);
  });
}

function bindStatsTimeline() {
  elements.timelineRangeChips?.forEach((chip) => {
    chip.addEventListener("click", () => {
      timelineFilter.range = chip.dataset.range || "today";
      elements.timelineRangeChips.forEach((c) => c.classList.toggle("active", c === chip));
      renderSessionTimeline();
    });
  });

  elements.timelineFilterPills?.forEach((pill) => {
    pill.addEventListener("click", () => {
      timelineFilter.rating = pill.dataset.rating || "all";
      elements.timelineFilterPills.forEach((p) => p.classList.toggle("active", p === pill));
      renderSessionTimeline();
    });
  });
}

let heatmapOffsetDays = 0;

function renderHeatmap() {
  if (!elements.heatmapGrid) return;
  const currentTheme = store.get().heatmapTheme || "emerald";
  if (elements.heatmapSection) {
    elements.heatmapSection.dataset.theme = currentTheme;
  }
  elements.heatmapThemeChips?.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.theme === currentTheme);
  });

  const range = studyStats.getHeatmapRange(28, heatmapOffsetDays);
  if (elements.heatmapRangeLabel) {
    if (heatmapOffsetDays === 0) {
      elements.heatmapRangeLabel.textContent = `近 28 天 (${range.startDate} ~ ${range.endDate})`;
    } else {
      elements.heatmapRangeLabel.textContent = `前 ${heatmapOffsetDays} 天 (${range.startDate} ~ ${range.endDate})`;
    }
  }

  elements.heatmapGrid.replaceChildren();
  const data = studyStats.getHeatmapData(28, heatmapOffsetDays);
  data.forEach((day) => {
    const cell = document.createElement("div");
    cell.className = `heatmap-cell heat-box level-${day.level}`;
    cell.title = `${day.date}：專注 ${day.minutes} 分鐘`;
    elements.heatmapGrid.append(cell);
  });
}

function renderHourlyDistribution() {
  if (!elements.hourlyChartSvg) return;
  const dist = studyStats.getHourlyDistribution();

  if (dist.totalMinutes === 0 || dist.peakMinutes === 0) {
    if (elements.peakFlowBadge) {
      elements.peakFlowBadge.textContent = "尚無專注記錄";
    }
  } else if (elements.peakFlowBadge) {
    const startHourStr = String(dist.peakHour).padStart(2, "0");
    const endHourStr = String((dist.peakHour + 1) % 24).padStart(2, "0");
    elements.peakFlowBadge.textContent = `心流高峰：${startHourStr}:00 - ${endHourStr}:00 (${dist.peakMinutes}分)`;
  }

  const maxVal = Math.max(...dist.hours, 1);
  const chartHeight = 44;

  const rects = dist.hours
    .map((minutes, h) => {
      const isPeak = dist.peakMinutes > 0 && h === dist.peakHour;
      const barHeight = minutes > 0 ? Math.max(4, Math.round((minutes / maxVal) * chartHeight)) : 2;
      const x = h * 10 + 1.5;
      const y = 50 - barHeight;
      const hourLabel = `${String(h).padStart(2, "0")}:00`;
      const tooltip = `${hourLabel} - ${minutes} 分鐘專注`;
      const cls = isPeak ? "hourly-bar peak" : "hourly-bar";
      return `<rect class="${cls}" x="${x}" y="${y}" width="7" height="${barHeight}" rx="1.5"><title>${tooltip}</title></rect>`;
    })
    .join("");

  elements.hourlyChartSvg.innerHTML = rects;
}

function updateNotificationUI(state = store.get()) {
  if (!elements.toggleNotification || !elements.notificationBtnText) return;
  if (!notificationManager.isSupported()) {
    elements.toggleNotification.disabled = true;
    elements.notificationBtnText.textContent = "不支援桌面通知";
    elements.toggleNotification.className = "notification-btn";
    return;
  }
  const perm = notificationManager.getPermission();
  if (perm === "denied") {
    elements.toggleNotification.disabled = false;
    elements.toggleNotification.className = "notification-btn blocked";
    elements.toggleNotification.innerHTML =
      '<i data-lucide="bell-off"></i><span id="notificationBtnText">通知已封鎖（瀏覽器設定）</span>';
    createIcons({ icons });
  } else if (perm === "granted" && state.desktopNotifications) {
    elements.toggleNotification.disabled = false;
    elements.toggleNotification.className = "notification-btn active";
    elements.toggleNotification.innerHTML =
      '<i data-lucide="bell-ring"></i><span id="notificationBtnText">桌面通知：已開啟</span>';
    createIcons({ icons });
  } else {
    elements.toggleNotification.disabled = false;
    elements.toggleNotification.className = "notification-btn";
    const label = perm === "granted" ? "桌面通知：已關閉（點擊啟用）" : "開啟桌面通知";
    elements.toggleNotification.innerHTML = `<i data-lucide="bell"></i><span id="notificationBtnText">${label}</span>`;
    createIcons({ icons });
  }
}

function syncWeatherAtmosphere() {
  const currentStore = store.get();
  const campfireActive = ambientSound.tracks && "campfire" in ambientSound.tracks;
  const isNight = elements.stage?.dataset.atmosphere === "night";

  if (elements.fireplaceGlow) {
    if (campfireActive || isNight) {
      elements.fireplaceGlow.classList.add("active");
    } else {
      elements.fireplaceGlow.classList.remove("active");
    }
  }

  const manualWeather = currentStore.windowWeather;
  if (manualWeather && manualWeather !== "auto") {
    weatherEngine.setMode(manualWeather);
    return;
  }

  // Auto weather derivation based on soundscape and day/night
  if (ambientSound.tracks && "rain" in ambientSound.tracks) {
    weatherEngine.setMode("rain");
  } else if (ambientSound.tracks && ("wind" in ambientSound.tracks || "brown_noise" in ambientSound.tracks)) {
    weatherEngine.setMode("leaves");
  } else if (isNight) {
    weatherEngine.setMode("snow");
  } else {
    weatherEngine.setMode("clear");
  }
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
  syncWeatherAtmosphere();
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
  if (elements.shortBreakMinutes && document.activeElement !== elements.shortBreakMinutes) {
    elements.shortBreakMinutes.value = state.shortBreakMinutes;
  }
  if (elements.longBreakMinutes && document.activeElement !== elements.longBreakMinutes) {
    elements.longBreakMinutes.value = state.longBreakMinutes;
  }
  if (elements.completionChime && document.activeElement !== elements.completionChime) {
    elements.completionChime.value = state.completionChime;
  }
  if (elements.syncWithHostTimer && document.activeElement !== elements.syncWithHostTimer) {
    elements.syncWithHostTimer.checked = Boolean(state.syncWithHostTimer);
  }
  if (elements.flowAutopilot && document.activeElement !== elements.flowAutopilot) {
    elements.flowAutopilot.checked = Boolean(state.flowAutopilot);
  }
  if (elements.windDownAlert && document.activeElement !== elements.windDownAlert) {
    elements.windDownAlert.checked = Boolean(state.windDownAlert);
  }
  if (elements.pillShortBreakText) {
    elements.pillShortBreakText.textContent = `☕ 短休 ${state.shortBreakMinutes}m`;
  }
  if (elements.pillLongBreakText) {
    elements.pillLongBreakText.textContent = `🌴 長休 ${state.longBreakMinutes}m`;
  }
  const isGuest = p2p?.role === "guest";
  if (elements.p2pSyncRow) {
    elements.p2pSyncRow.hidden = !isGuest;
  }
  if (elements.timerSyncBadge) {
    elements.timerSyncBadge.hidden = !isGuest || !state.syncWithHostTimer;
  }
  if (document.activeElement !== elements.plantType) elements.plantType.value = state.plantType;
  if (elements.windowWeather && document.activeElement !== elements.windowWeather) {
    elements.windowWeather.value = state.windowWeather || "auto";
  }
  elements.weatherChips?.forEach((chip) => {
    const active = chip.dataset.weather === (state.windowWeather || "auto");
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  if (elements.focusIntentionInput && document.activeElement !== elements.focusIntentionInput) {
    elements.focusIntentionInput.value = state.focusIntention || "";
  }
  if (elements.zenIntentionText) {
    elements.zenIntentionText.textContent = state.focusIntention
      ? `當前意圖：${state.focusIntention}`
      : "當前意圖：保持專注";
  }
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
  elements.categoryChips.forEach((chip) => {
    const active = chip.dataset.category === (state.focusCategory || "dev");
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-checked", String(active));
  });
  if (state.sprintPreset) {
    updateSprintPresetUI(state.sprintPreset);
  }
  const pendingParking = (state.parkingLot || []).filter((p) => !p.completed).length;
  if (elements.parkingBadge) {
    if (pendingParking > 0) {
      elements.parkingBadge.textContent = String(pendingParking);
      elements.parkingBadge.hidden = false;
    } else {
      elements.parkingBadge.hidden = true;
    }
  }
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
  updateNotificationUI(state);
  renderCustomPresets();
  updateAffinityUI();
  applyCurrentAura();
  updateFlowMomentumUI();
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

const lastAffinityInteractionTime = {
  pet: 0,
  peer: 0,
};

function updateAffinityUI() {
  const exp = store.get().companionAffinityExp || 0;
  const rank = getAffinityRank(exp);

  if (elements.affinityBadgeIcon) elements.affinityBadgeIcon.textContent = rank.icon;
  if (elements.affinityBadgeLevel) elements.affinityBadgeLevel.textContent = `Lv.${rank.level} ${rank.title}`;
  if (elements.affinityBadgeExp) {
    elements.affinityBadgeExp.textContent = rank.nextExp === Infinity ? "MAX" : `${rank.currentExp}/${rank.nextExp}`;
  }
  if (elements.affinityMiniFill) {
    elements.affinityMiniFill.style.width = `${rank.progressPercent}%`;
  }

  if (elements.affinityCurrentAvatar) elements.affinityCurrentAvatar.textContent = rank.icon;
  if (elements.affinityCurrentTitle) elements.affinityCurrentTitle.textContent = `Lv.${rank.level} ${rank.title}`;
  if (elements.affinityTotalExp) elements.affinityTotalExp.textContent = `累計 ${rank.currentExp} EXP`;
  if (elements.affinityProgressFill) elements.affinityProgressFill.style.width = `${rank.progressPercent}%`;
  if (elements.affinityCurrentQuote) elements.affinityCurrentQuote.textContent = `「${rank.quote}」`;
}

function applyCurrentAura() {
  const exp = store.get().companionAffinityExp || 0;
  const rank = getAffinityRank(exp);
  const userPref = store.get().companionAura || "auto";

  let auraToApply;
  if (userPref === "auto") {
    auraToApply = getUnlockedAura(rank.level);
  } else if (userPref === "none") {
    auraToApply = "none";
  } else {
    const config = AFFINITY_AURAS[userPref];
    if (config && rank.level >= config.minLevel) {
      auraToApply = userPref;
    } else {
      auraToApply = getUnlockedAura(rank.level);
    }
  }

  viewer?.setAffinityAura?.(auraToApply);
}

function renderAffinityAuraChips() {
  if (!elements.affinityAuraChips) return;
  const currentExp = store.get().companionAffinityExp || 0;
  const currentRank = getAffinityRank(currentExp);
  const selectedPref = store.get().companionAura || "auto";

  elements.affinityAuraChips.replaceChildren();

  // 1. Auto option
  const autoBtn = document.createElement("button");
  autoBtn.type = "button";
  autoBtn.className = `affinity-aura-chip${selectedPref === "auto" ? " active" : ""}`;
  const autoAura = getUnlockedAura(currentRank.level);
  const autoLabel = autoAura === "none" ? "自動 (尚未解鎖)" : `自動 (${AFFINITY_AURAS[autoAura]?.label || autoAura})`;
  autoBtn.textContent = `✨ ${autoLabel}`;
  autoBtn.title = "自動佩戴目前最高解鎖的光環";
  autoBtn.addEventListener("click", () => {
    store.update({ companionAura: "auto" });
    applyCurrentAura();
    renderAffinityAuraChips();
  });
  elements.affinityAuraChips.append(autoBtn);

  // 2. None option
  const noneBtn = document.createElement("button");
  noneBtn.type = "button";
  noneBtn.className = `affinity-aura-chip${selectedPref === "none" ? " active" : ""}`;
  noneBtn.textContent = "⭕ 隱藏光環";
  noneBtn.title = "不顯示任何光環裝飾";
  noneBtn.addEventListener("click", () => {
    store.update({ companionAura: "none" });
    applyCurrentAura();
    renderAffinityAuraChips();
  });
  elements.affinityAuraChips.append(noneBtn);

  // 3. Specific Auras
  Object.values(AFFINITY_AURAS).forEach((aura) => {
    if (aura.id === "none") return;
    const isUnlocked = currentRank.level >= aura.minLevel;
    const isSelected = selectedPref === aura.id;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `affinity-aura-chip${isSelected ? " active" : ""}`;
    btn.disabled = !isUnlocked;
    btn.textContent = `${aura.icon} ${aura.label} (Lv.${aura.minLevel})`;
    btn.title = isUnlocked ? `佩戴【${aura.label}】光環` : `需達到 Lv.${aura.minLevel} 解鎖`;

    if (isUnlocked) {
      btn.addEventListener("click", () => {
        store.update({ companionAura: aura.id });
        applyCurrentAura();
        renderAffinityAuraChips();
      });
    }
    elements.affinityAuraChips.append(btn);
  });
}

function renderAffinityModal() {
  if (!elements.affinityTiersList) return;
  const currentExp = store.get().companionAffinityExp || 0;
  const currentRank = getAffinityRank(currentExp);

  renderAffinityAuraChips();

  elements.affinityTiersList.replaceChildren();
  AFFINITY_RANKS.forEach((tier) => {
    const isUnlocked = currentExp >= tier.minExp;
    const isCurrent = tier.level === currentRank.level;

    const item = document.createElement("div");
    item.className = `affinity-tier-item${isUnlocked ? " unlocked" : ""}${isCurrent ? " current" : ""}`;

    const left = document.createElement("div");
    left.className = "affinity-tier-left";
    const icon = document.createElement("span");
    icon.className = "affinity-tier-icon";
    icon.textContent = tier.icon;
    const title = document.createElement("span");
    title.className = "affinity-tier-title";
    title.textContent = `Lv.${tier.level} ${tier.title}`;
    left.append(icon, title);

    const right = document.createElement("div");
    right.className = "affinity-tier-right";
    const expSpan = document.createElement("span");
    expSpan.className = "affinity-tier-exp";
    expSpan.textContent = `${tier.minExp} EXP`;
    const statusSpan = document.createElement("span");
    statusSpan.className = "affinity-tier-status";
    statusSpan.textContent = isCurrent ? "📍 當前" : isUnlocked ? "✓ 已解鎖" : "🔒 未解鎖";
    right.append(expSpan, statusSpan);

    item.append(left, right);
    elements.affinityTiersList.append(item);
  });
}

function addAffinityExp(amount = 0, reason = "") {
  if (!amount || amount <= 0) return;
  const currentExp = store.get().companionAffinityExp || 0;
  const oldRank = getAffinityRank(currentExp);
  const newExp = currentExp + amount;
  store.update({ companionAffinityExp: newExp });
  const newRank = getAffinityRank(newExp);

  updateAffinityUI();

  if (newRank.level > oldRank.level) {
    applyCurrentAura();
    showToast(`🎉 伴讀夥伴默契升級！邁入【Lv.${newRank.level} ${newRank.title}】！`);
    companionSound.playCelebrationFanfare();
    showCompanionBubble(`哇！我們的默契等級提升到【Lv.${newRank.level} ${newRank.title}】了！✨`, 5000);
    spawnZenSpark(`✨ 默契升級 Lv.${newRank.level}！`);
    viewer?.triggerBounce();
    elements.btnCompanionAffinity?.classList.add("affinity-level-up");
    setTimeout(() => {
      elements.btnCompanionAffinity?.classList.remove("affinity-level-up");
    }, 1200);
  } else if (reason && reason !== "撫摸夥伴") {
    // Subtle visual indicator for non-petting affinity gains
    elements.btnCompanionAffinity?.classList.add("affinity-level-up");
    setTimeout(() => {
      elements.btnCompanionAffinity?.classList.remove("affinity-level-up");
    }, 400);
  }
}

function bindCompanionAffinity() {
  elements.btnCompanionAffinity?.addEventListener("click", () => {
    updateAffinityUI();
    renderAffinityModal();
    elements.affinityModal?.showModal();
  });

  elements.closeAffinity?.addEventListener("click", () => {
    elements.affinityModal?.close();
  });

  elements.affinityModal?.addEventListener("click", (e) => {
    if (e.target === elements.affinityModal) {
      elements.affinityModal.close();
    }
  });
}

function updateTimerModeUI(mode, cycleRound) {
  elements.timerModePills?.forEach((pill) => {
    const pillMode = pill.getAttribute("data-mode");
    const isActive = pillMode === mode;
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  if (elements.cycleCountBadge) {
    elements.cycleCountBadge.textContent = `${cycleRound}/4`;
  }
}

function broadcastTimerSyncIfHost() {
  if (p2p && p2p.role === "host") {
    p2p.sendTimerSync({
      mode: timer.mode,
      remaining: timer.remaining,
      isRunning: Boolean(timer.interval),
      cycleRound: timer.cycleRound,
    });
  }
}

function bindTimer() {
  let lastWindDownPlayedSec = 0;

  timer.addEventListener("tick", (event) => {
    const minutes = Math.floor(event.detail / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(event.detail % 60)
      .toString()
      .padStart(2, "0");
    elements.timer.textContent = `${minutes}:${seconds}`;
    updateGarden(event.detail);
    notificationManager.updateTitle({
      remaining: event.detail,
      isRunning: true,
      totalSeconds: timer.minutes * 60,
    });

    if (timer.mode === "focus" && store.get().windDownAlert) {
      if ((event.detail === 180 || event.detail === 60) && lastWindDownPlayedSec !== event.detail) {
        lastWindDownPlayedSec = event.detail;
        companionSound.playWindDownChime();
        showToast(event.detail === 180 ? "🕊️ 專注剩餘 3 分鐘，準備溫和收尾" : "✨ 專注剩餘 1 分鐘，整理手邊思緒");
        spawnZenSpark("🕊️ 舒緩收尾");
      }
    }
  });

  timer.addEventListener("modechange", (event) => {
    updateTimerModeUI(event.detail.mode, event.detail.cycleRound);
    broadcastTimerSyncIfHost();
  });

  timer.addEventListener("running", (event) => {
    const isFocus = timer.mode === "focus";
    const playTitle = isFocus ? "開始專注" : "開始休息";
    const pauseTitle = isFocus ? "暫停專注" : "暫停休息";
    replaceButtonIcon(elements.toggleTimer, event.detail ? "pause" : "play", event.detail ? pauseTitle : playTitle);
    broadcastTimerSyncIfHost();

    if (event.detail) {
      lastWindDownPlayedSec = 0;
    }

    if (isFocus) {
      elements.focusGarden.classList.toggle("growing", event.detail);
      viewer?.setTimerState(event.detail ? "focusing" : "idle");
      p2p?.sendStatus(
        event.detail ? "focusing" : "resting",
        store.get().nickname,
        store.get().plantType,
        store.get().focusIntention,
        store.get().windowWeather,
        store.get().sprintPreset,
      );
    } else {
      elements.focusGarden.classList.remove("growing");
      viewer?.setTimerState(event.detail ? "resting" : "idle");
      p2p?.sendStatus(
        "resting",
        store.get().nickname,
        store.get().plantType,
        store.get().focusIntention,
        store.get().windowWeather,
        store.get().sprintPreset,
      );
    }

    if (event.detail) {
      if (isFocus) {
        showCompanionBubble("專注計時開始～我們一起加油！✨", 3000);
      } else {
        showCompanionBubble("休息時間開始，放鬆一下眼睛與肩膀～🍵", 3000);
      }
      notificationManager.updateTitle({
        remaining: timer.remaining,
        isRunning: true,
        totalSeconds: timer.minutes * 60,
      });
    } else {
      notificationManager.updateTitle({
        remaining: timer.remaining,
        isRunning: false,
        totalSeconds: timer.minutes * 60,
      });
    }
  });

  timer.addEventListener("complete", () => {
    notificationManager.updateTitle({ isCompleted: true });

    if (timer.mode === "focus") {
      viewer?.setTimerState("completed");
      companionSound.playCompletionChime(store.get().completionChime || "fanfare");

      const activeTasks = taskTracker.getActiveTasks();
      let completedTaskId = null;
      let taskTitle = "";
      if (activeTasks.length > 0) {
        completedTaskId = activeTasks[0].id;
        taskTitle = activeTasks[0].title;
        taskTracker.incrementPomodoro(completedTaskId);
        renderTasks();
      }
      const recorded = studyStats.recordSession({
        durationMinutes: timer.focusMinutes,
        plantHarvested: store.get().plantType,
        taskId: completedTaskId,
        category: store.get().focusCategory || "dev",
        note: store.get().focusIntention || "",
      });
      lastRecordedSessionId = recorded?.id || null;
      showFlowReflectionPrompt();
      showSmartBreakSuggestion(recorded);
      updateFlowMomentumUI();
      renderStats();
      addAffinityExp(25, "專注完成");

      if (store.get().desktopNotifications) {
        notificationManager.notifyFocusComplete({
          plantLabel: plantLabels[store.get().plantType],
          taskTitle,
        });
      }

      const nextMode = timer.advanceMode();
      broadcastTimerSyncIfHost();
      if (nextMode === "longBreak") {
        showCompanionBubble(`太棒了！連續達成 4 輪番茄鐘！進入 ${timer.longBreakMinutes} 分鐘深度長休 🌴`, 7000);
        showToast(`達成 4 輪番茄鐘！進入 ${timer.longBreakMinutes} 分鐘深度長休 🌴`);
      } else {
        showCompanionBubble(
          `第 ${timer.cycleRound}/4 輪專注完成！進入 ${timer.shortBreakMinutes} 分鐘短休，喝口水吧 ☕`,
          6000,
        );
        showToast(`專注完成！進入 ${timer.shortBreakMinutes} 分鐘短休 ☕`);
      }
    } else {
      companionSound.playSingingBowl();
      viewer?.setTimerState("idle");
      timer.advanceMode();
      broadcastTimerSyncIfHost();
      showCompanionBubble(`休息結束囉！準備好開始第 ${timer.cycleRound}/4 輪專注了嗎？🎯`, 5000);
      showToast(`休息結束，進入第 ${timer.cycleRound}/4 輪專注 🎯`);
    }

    if (store.get().flowAutopilot) {
      window.setTimeout(() => {
        timer.start();
        showToast("🚀 心流自動巡航：已自動開啟下一輪計時");
      }, 1200);
    }
  });

  elements.timerModePills?.forEach((pill) => {
    pill.addEventListener("click", () => {
      const mode = pill.getAttribute("data-mode");
      if (mode && mode !== timer.mode) {
        timer.setMode(mode);
        if (mode === "focus") {
          showCompanionBubble(`切換至專注模式（${timer.focusMinutes} 分鐘）🎯`, 2500);
        } else if (mode === "shortBreak") {
          showCompanionBubble(`切換至短休（${timer.shortBreakMinutes} 分鐘），喝杯水吧 ☕`, 2500);
        } else if (mode === "longBreak") {
          showCompanionBubble(`切換至深度長休（${timer.longBreakMinutes} 分鐘），伸展一下 🌴`, 2500);
        }
      }
    });
  });

  elements.toggleTimer.addEventListener("click", () => timer.toggle());
  elements.resetTimer.addEventListener("click", () => {
    timer.reset();
    viewer?.setTimerState("idle");
    notificationManager.updateTitle({ remaining: null, isRunning: false });
    broadcastTimerSyncIfHost();
  });
}

function showFlowReflectionPrompt() {
  if (!elements.flowReflectionPrompt) return;
  elements.flowReflectionPrompt.hidden = false;
  clearTimeout(flowReflectionTimer);
  flowReflectionTimer = setTimeout(() => {
    hideFlowReflectionPrompt();
  }, 10000);
}

function hideFlowReflectionPrompt() {
  if (!elements.flowReflectionPrompt) return;
  elements.flowReflectionPrompt.hidden = true;
  if (elements.smartBreakSuggestion) {
    elements.smartBreakSuggestion.hidden = true;
  }
  clearTimeout(flowReflectionTimer);
}

let currentSmartBreakMinutes = 5;

function showSmartBreakSuggestion(lastSession = null) {
  if (!elements.smartBreakSuggestion) return;
  const rec = studyStats.getSmartBreakRecommendation(lastSession);
  currentSmartBreakMinutes = rec.recommendedMinutes;
  if (elements.smartBreakText) {
    elements.smartBreakText.textContent = `💡 智慧建議：${rec.reason}（建議 ${rec.recommendedMinutes} 分鐘）`;
  }
  if (elements.btnApplySmartBreak) {
    elements.btnApplySmartBreak.textContent = `一鍵套用短休 ${rec.recommendedMinutes}m`;
  }
  elements.smartBreakSuggestion.hidden = false;
}

function bindSmartBreak() {
  elements.btnApplySmartBreak?.addEventListener("click", () => {
    store.update({ shortBreakMinutes: currentSmartBreakMinutes });
    timer.shortBreakMinutes = currentSmartBreakMinutes;
    if (timer.mode === "shortBreak") {
      timer.remaining = currentSmartBreakMinutes * 60;
      timer.minutes = currentSmartBreakMinutes;
      timer.emitTick();
    }
    if (elements.smartBreakSuggestion) {
      elements.smartBreakSuggestion.hidden = true;
    }
    showToast(`已套用智慧休憩：短休設定為 ${currentSmartBreakMinutes} 分鐘 ☕`);
    broadcastTimerSyncIfHost();
  });

  elements.flowMomentumBadge?.addEventListener("click", () => {
    const momentum = studyStats.getFlowMomentum();
    showToast(`${momentum.icon} 心流勢能 ${momentum.score}%【${momentum.levelName}】：${momentum.quote}`);
  });
}

function updateFlowMomentumUI() {
  if (!elements.flowMomentumBadge) return;
  const momentum = studyStats.getFlowMomentum();
  if (elements.momentumIcon) {
    elements.momentumIcon.textContent = momentum.icon;
  }
  if (elements.momentumText) {
    elements.momentumText.textContent = `心流勢能：${momentum.levelName} (${momentum.score}%)`;
  }
  if (elements.momentumMiniFill) {
    elements.momentumMiniFill.style.width = `${momentum.score}%`;
  }
  elements.flowMomentumBadge.title = `心流勢能 ${momentum.score}% (${momentum.levelName})\n今日累積 ${momentum.totalMinutes} 分鐘 / ${momentum.sessionCount} 輪專注\n「${momentum.quote}」`;
}

function bindFlowReflection() {
  elements.flowReflectionBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
      const rating = btn.dataset.rating;
      if (lastRecordedSessionId) {
        studyStats.updateSession(lastRecordedSessionId, { rating });
        renderStats();
        updateFlowMomentumUI();
        const ratingNames = { flow: "🔥 深度心流", steady: "✨ 穩定推進", warmup: "🌱 漸入佳境" };
        showToast(`心流狀態已標記為「${ratingNames[rating] || rating}」！`);
      }
      hideFlowReflectionPrompt();
    });
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

function bindCategoryPicker() {
  elements.categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const cat = chip.dataset.category;
      if (!cat) return;
      store.update({ focusCategory: cat });
    });
  });
}

const TRACK_METAS = {
  rain: { name: "雨聲", icon: "cloud-rain" },
  wind: { name: "微風", icon: "wind" },
  campfire: { name: "營火", icon: "flame" },
  brown_noise: { name: "潮汐", icon: "waves" },
  keyboard: { name: "機械鍵盤", icon: "keyboard" },
  pencil: { name: "鉛筆書寫", icon: "pencil" },
  binaural_theta: { name: "Theta波 (6Hz 冥想)", icon: "moon" },
  binaural_alpha: { name: "Alpha波 (10Hz 心流)", icon: "sparkles" },
  binaural_gamma: { name: "Gamma波 (40Hz 敏捷)", icon: "zap" },
  pink_noise: { name: "粉紅噪", icon: "activity" },
  ocean_waves: { name: "潮汐海浪", icon: "waves" },
};

function formatPanLabel(pan) {
  const panPercent = Math.round(pan * 100);
  if (panPercent === 0) return "居中";
  if (panPercent < 0) return `左 ${Math.abs(panPercent)}%`;
  return `右 ${panPercent}%`;
}

function getBinauralBandInfo(freq) {
  if (freq < 4) return { band: "Delta (δ)", icon: "💤", desc: "深層修復" };
  if (freq < 8) return { band: "Theta (θ)", icon: "🌙", desc: "深度冥想" };
  if (freq < 14) return { band: "Alpha (α)", icon: "✨", desc: "放鬆心流" };
  if (freq < 30) return { band: "Beta (β)", icon: "⚡", desc: "主動專注" };
  return { band: "Gamma (γ)", icon: "💥", desc: "巔峰認知" };
}

function renderAmbientMixer() {
  if (!elements.ambientMixer || !elements.ambientMixerTracks) return;
  const activeTracks = ambientSound.getActiveTracks();
  if (activeTracks.length === 0) {
    elements.ambientMixer.hidden = true;
    return;
  }

  elements.ambientMixer.hidden = false;
  if (elements.ambientMixerCount) {
    elements.ambientMixerCount.textContent = `${activeTracks.length} 軌運行中`;
  }

  const activeElement = document.activeElement;
  const activeTrackAttr = activeElement?.closest?.(".ambient-mixer-track")?.dataset.track;
  const isPanSlider = activeElement?.classList?.contains("mixer-track-pan-slider");
  const isFreqSlider = activeElement?.classList?.contains("mixer-track-freq-slider");

  elements.ambientMixerTracks.innerHTML = activeTracks
    .map((name) => {
      const meta = TRACK_METAS[name] || { name, icon: "volume-2" };
      const vol = Math.round(ambientSound.getTrackVolume(name) * 100);
      const pan = ambientSound.getTrackPan(name);
      const panPercent = Math.round(pan * 100);
      const panText = formatPanLabel(pan);

      let binauralHtml = "";
      if (name.startsWith("binaural_")) {
        const freqConfig = ambientSound.getBinauralBeatFrequency(name) || { base: 210, diff: 10 };
        const band = getBinauralBandInfo(freqConfig.diff);
        binauralHtml = `
          <div class="mixer-binaural-row">
            <span class="mixer-binaural-label">節律: <strong>${freqConfig.diff.toFixed(1)} Hz</strong> · ${band.icon} ${band.band} (${band.desc})</span>
            <div class="mixer-binaural-controls">
              <input class="mixer-track-freq-slider" type="range" min="1" max="45" step="0.5" value="${freqConfig.diff}" aria-label="${meta.name} 雙耳節律頻率微調" />
            </div>
          </div>
        `;
      }

      return `
        <div class="ambient-mixer-track" data-track="${name}">
          <div class="mixer-track-row">
            <span class="mixer-track-name" title="${meta.name}">${meta.name}</span>
            <input class="mixer-track-slider" type="range" min="0" max="100" step="1" value="${vol}" aria-label="${meta.name} 軌道音量" />
            <span class="mixer-track-value">${vol}%</span>
          </div>
          <div class="mixer-pan-row">
            <span class="mixer-pan-label">方位: ${panText}</span>
            <div class="mixer-pan-controls">
              <span class="mixer-pan-indicator">L</span>
              <input class="mixer-track-pan-slider" type="range" min="-100" max="100" step="5" value="${panPercent}" aria-label="${meta.name} 聲道左右音場方位" />
              <span class="mixer-pan-indicator">R</span>
            </div>
          </div>
          ${binauralHtml}
        </div>
      `;
    })
    .join("");

  if (activeTrackAttr) {
    let selector = ".mixer-track-slider";
    if (isPanSlider) selector = ".mixer-track-pan-slider";
    else if (isFreqSlider) selector = ".mixer-track-freq-slider";
    const restoredSlider = elements.ambientMixerTracks.querySelector(`[data-track="${activeTrackAttr}"] ${selector}`);
    restoredSlider?.focus();
  }
}

function syncAcousticUI() {
  const eq = ambientSound.getMasterEQ();
  const reverb = ambientSound.getMasterReverb();
  if (elements.sliderReverbWet) elements.sliderReverbWet.value = String(Math.round(reverb.wet * 100));
  if (elements.reverbWetValue) elements.reverbWetValue.textContent = `${Math.round(reverb.wet * 100)}%`;
  if (elements.sliderEqBass) elements.sliderEqBass.value = String(eq.bass);
  if (elements.eqBassValue) elements.eqBassValue.textContent = `${eq.bass > 0 ? "+" : ""}${eq.bass} dB`;
  if (elements.sliderEqMid) elements.sliderEqMid.value = String(eq.mid);
  if (elements.eqMidValue) elements.eqMidValue.textContent = `${eq.mid > 0 ? "+" : ""}${eq.mid} dB`;
  if (elements.sliderEqTreble) elements.sliderEqTreble.value = String(eq.treble);
  if (elements.eqTrebleValue) elements.eqTrebleValue.textContent = `${eq.treble > 0 ? "+" : ""}${eq.treble} dB`;

  elements.acousticPresetBtns?.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.acoustic === reverb.preset);
  });
}

function bindAmbientSound() {
  elements.toggleAmbient.addEventListener("click", () => {
    const isHidden = elements.ambientBar.hidden;
    elements.ambientBar.hidden = !isHidden;
    elements.toggleAmbient.classList.toggle("primary", isHidden);
    elements.toggleAmbient.setAttribute("aria-pressed", String(isHidden));
  });

  elements.btnSpatialCabin?.addEventListener("click", () => {
    ambientSound.applySpatialScenario("cabin_realism");
    renderAmbientMixer();
    showToast("已套用小木屋立體聲環繞音場 🪵");
  });

  elements.btnSpatialCenter?.addEventListener("click", () => {
    ambientSound.applySpatialScenario("centered");
    renderAmbientMixer();
    showToast("所有運行軌道立體聲道已居中 🎯");
  });

  elements.btnToggleAcousticFX?.addEventListener("click", () => {
    if (!elements.acousticFxPanel) return;
    const isHidden = elements.acousticFxPanel.hidden;
    elements.acousticFxPanel.hidden = !isHidden;
    elements.btnToggleAcousticFX.classList.toggle("active", isHidden);
  });

  elements.acousticPresetBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.acoustic;
      if (ambientSound.applyAcousticPreset(presetKey)) {
        syncAcousticUI();
        showToast(`已套用聲學空間：「${ACOUSTIC_PRESETS[presetKey]?.name || presetKey}」🎛️`);
      }
    });
  });

  elements.sliderReverbWet?.addEventListener("input", (e) => {
    const wet = Number(e.target.value) / 100;
    ambientSound.setMasterReverb({ wet, preset: "custom" });
    if (elements.reverbWetValue) elements.reverbWetValue.textContent = `${e.target.value}%`;
    elements.acousticPresetBtns?.forEach((btn) => btn.classList.remove("active"));
  });

  elements.sliderEqBass?.addEventListener("input", (e) => {
    const bass = Number(e.target.value);
    const current = ambientSound.getMasterEQ();
    ambientSound.setMasterEQ({ ...current, bass });
    if (elements.eqBassValue) elements.eqBassValue.textContent = `${bass > 0 ? "+" : ""}${bass} dB`;
    elements.acousticPresetBtns?.forEach((btn) => btn.classList.remove("active"));
  });

  elements.sliderEqMid?.addEventListener("input", (e) => {
    const mid = Number(e.target.value);
    const current = ambientSound.getMasterEQ();
    ambientSound.setMasterEQ({ ...current, mid });
    if (elements.eqMidValue) elements.eqMidValue.textContent = `${mid > 0 ? "+" : ""}${mid} dB`;
    elements.acousticPresetBtns?.forEach((btn) => btn.classList.remove("active"));
  });

  elements.sliderEqTreble?.addEventListener("input", (e) => {
    const treble = Number(e.target.value);
    const current = ambientSound.getMasterEQ();
    ambientSound.setMasterEQ({ ...current, treble });
    if (elements.eqTrebleValue) elements.eqTrebleValue.textContent = `${treble > 0 ? "+" : ""}${treble} dB`;
    elements.acousticPresetBtns?.forEach((btn) => btn.classList.remove("active"));
  });

  elements.ambientChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sound = chip.dataset.sound;
      if (sound === "lofi") {
        const isRunning = lofiGenerator.toggle();
        chip.classList.toggle("active", isRunning);
        chip.setAttribute("aria-pressed", String(isRunning));
        return;
      }
      const isPlaying = chip.classList.contains("active");
      if (isPlaying) {
        ambientSound.stopTrack(sound);
        chip.classList.remove("active");
        chip.setAttribute("aria-pressed", "false");
      } else {
        ambientSound.startTrack(sound);
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
      }
      renderAmbientMixer();
      syncWeatherAtmosphere();
    });
  });

  elements.ambientMixerTracks?.addEventListener("input", (e) => {
    const volSlider = e.target.closest(".mixer-track-slider");
    if (volSlider) {
      const trackRow = volSlider.closest(".ambient-mixer-track");
      const trackName = trackRow?.dataset.track;
      if (!trackName) return;
      const vol = Number(volSlider.value);
      ambientSound.setTrackVolume(trackName, vol / 100);
      const valueLabel = trackRow.querySelector(".mixer-track-value");
      if (valueLabel) valueLabel.textContent = `${vol}%`;
      return;
    }

    const panSlider = e.target.closest(".mixer-track-pan-slider");
    if (panSlider) {
      const trackRow = panSlider.closest(".ambient-mixer-track");
      const trackName = trackRow?.dataset.track;
      if (!trackName) return;
      const panVal = Number(panSlider.value);
      ambientSound.setTrackPan(trackName, panVal / 100);
      const panLabel = trackRow.querySelector(".mixer-pan-label");
      if (panLabel) {
        panLabel.textContent = `方位: ${formatPanLabel(panVal / 100)}`;
      }
      return;
    }

    const freqSlider = e.target.closest(".mixer-track-freq-slider");
    if (freqSlider) {
      const trackRow = freqSlider.closest(".ambient-mixer-track");
      const trackName = trackRow?.dataset.track;
      if (!trackName) return;
      const diffVal = Number(freqSlider.value);
      const currentConfig = ambientSound.getBinauralBeatFrequency(trackName);
      const baseFreq = currentConfig?.base || 210;
      ambientSound.setBinauralBeatFrequency(trackName, baseFreq, diffVal);
      const bandInfo = getBinauralBandInfo(diffVal);
      const binauralLabel = trackRow.querySelector(".mixer-binaural-label");
      if (binauralLabel) {
        binauralLabel.innerHTML = `節律: <strong>${diffVal.toFixed(1)} Hz</strong> · ${bandInfo.icon} ${bandInfo.band} (${bandInfo.desc})`;
      }
    }
  });

  const onKeyType = () => {
    if (ambientSound.tracks && "keyboard" in ambientSound.tracks) {
      ambientSound.playSingleKeyPress(ambientSound.masterVolume * 0.35);
    }
  };
  elements.taskInput?.addEventListener("keydown", onKeyType);
  elements.noteInput?.addEventListener("keydown", onKeyType);

  elements.ambientVolume.addEventListener("input", () => {
    const volume = Number(elements.ambientVolume.value) / 100;
    ambientSound.setMasterVolume(volume);
    lofiGenerator.setVolume(volume);
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
        if (sound === "lofi") return;
        const isPlaying = sound in preset.tracks;
        chip.classList.toggle("active", isPlaying);
        chip.setAttribute("aria-pressed", String(isPlaying));
      });
      syncWeatherAtmosphere();
      renderAmbientMixer();
      syncAcousticUI();
      showToast(`已套用「${preset.name}」音景預設。`);
    });
  });
}

function handleImportSoundscape(rawInput) {
  if (!rawInput || typeof rawInput !== "string") return;
  let code = rawInput.trim();
  if (code.includes("soundscape=")) {
    const match = code.match(/soundscape=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      code = match[1];
    }
  }

  const decoded = decodeSoundscapeCode(code);
  if (!decoded) {
    showToast("無法解析音景分享碼，格式可能不正確。");
    return;
  }

  const defaultName = decoded.name || "匯入音景";
  const inputName = window.prompt("請確認匯入音景名稱：", defaultName);
  if (inputName === null) return;
  const finalName = (inputName.trim() || defaultName).slice(0, 16);

  const normalizedTracks = {};
  for (const [k, v] of Object.entries(decoded.tracks)) {
    const num = Number(v);
    normalizedTracks[k] = num > 1 ? Math.round((num / 100) * 100) / 100 : num;
  }

  const newPreset = {
    id: crypto.randomUUID(),
    name: finalName,
    tracks: normalizedTracks,
    pans: decoded.pans || {},
    eq: decoded.eq || null,
    reverb: decoded.reverb || null,
  };

  const currentPresets = store.get().customPresets || [];
  store.update({ customPresets: [...currentPresets, newPreset] });
  renderCustomPresets();

  ambientSound.applyTrackMix(newPreset.tracks, newPreset.pans);
  if (newPreset.eq) ambientSound.setMasterEQ(newPreset.eq);
  if (newPreset.reverb) ambientSound.setMasterReverb(newPreset.reverb);
  syncAcousticUI();
  elements.ambientChips.forEach((chipEl) => {
    const sound = chipEl.dataset.sound;
    if (sound === "lofi") return;
    const isPlaying = sound in newPreset.tracks && newPreset.tracks[sound] > 0;
    chipEl.classList.toggle("active", isPlaying);
    chipEl.setAttribute("aria-pressed", String(isPlaying));
  });
  syncWeatherAtmosphere();
  renderAmbientMixer();
  showToast(`已成功匯入並套用「${finalName}」音景！🎧`);
}

function renderCustomPresets() {
  if (!elements.customPresetsList) return;
  elements.customPresetsList.innerHTML = "";
  const customPresets = store.get().customPresets || [];
  customPresets.forEach((preset) => {
    const chip = document.createElement("div");
    chip.className = "custom-preset-chip";

    const nameBtn = document.createElement("button");
    nameBtn.type = "button";
    nameBtn.style.background = "transparent";
    nameBtn.style.border = "none";
    nameBtn.style.color = "inherit";
    nameBtn.style.cursor = "pointer";
    nameBtn.style.padding = "0";
    nameBtn.textContent = preset.name;
    nameBtn.title = `套用「${preset.name}」混音`;

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.className = "preset-share-btn";
    shareBtn.title = `複製「${preset.name}」音景分享連結`;
    shareBtn.setAttribute("aria-label", `複製分享連結 ${preset.name}`);
    shareBtn.innerHTML = "🔗";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "preset-del-btn";
    delBtn.title = `刪除「${preset.name}」預設`;
    delBtn.setAttribute("aria-label", `刪除預設 ${preset.name}`);
    delBtn.innerHTML = "&times;";

    nameBtn.addEventListener("click", () => {
      ambientSound.applyTrackMix(preset.tracks, preset.pans || {});
      if (preset.eq) {
        ambientSound.setMasterEQ(preset.eq);
      }
      if (preset.reverb) {
        ambientSound.setMasterReverb(preset.reverb);
      }
      syncAcousticUI();
      elements.ambientChips.forEach((chipEl) => {
        const sound = chipEl.dataset.sound;
        if (sound === "lofi") return;
        const isPlaying = sound in preset.tracks && preset.tracks[sound] > 0;
        chipEl.classList.toggle("active", isPlaying);
        chipEl.setAttribute("aria-pressed", String(isPlaying));
      });
      syncWeatherAtmosphere();
      renderAmbientMixer();
      showToast(`已套用自訂預設「${preset.name}」。`);
    });

    shareBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        const code = encodeSoundscapeCode(preset);
        const url = `${window.location.origin}${window.location.pathname}#soundscape=${code}`;
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          showToast(`已複製「${preset.name}」音景分享連結！🔗`);
        } else {
          window.prompt("音景分享網址：", url);
        }
      } catch {
        showToast("產生分享連結失敗。");
      }
    });

    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const updated = (store.get().customPresets || []).filter((p) => p.id !== preset.id);
      store.update({ customPresets: updated });
      renderCustomPresets();
      showToast(`已刪除「${preset.name}」自訂預設。`);
    });

    chip.append(nameBtn, shareBtn, delBtn);
    elements.customPresetsList.append(chip);
  });
}

function bindCustomPresets() {
  elements.saveCustomPresetBtn?.addEventListener("click", () => {
    const activeTracks = ambientSound.getActiveTracks();
    if (activeTracks.length === 0) {
      showToast("請先開啟至少一種白噪音軌道。");
      return;
    }
    const count = (store.get().customPresets || []).length;
    const defaultName = `心流混音 ${count + 1}`;
    const inputName = window.prompt("請輸入自訂音景預設名稱：", defaultName);
    if (!inputName) return;
    const trimmed = inputName.trim().slice(0, 16);
    if (!trimmed) return;
    const currentMix = ambientSound.getCurrentTrackMix();
    const currentPans = ambientSound.getCurrentTrackPans();
    const newPreset = {
      id: crypto.randomUUID(),
      name: trimmed,
      tracks: currentMix,
      pans: currentPans,
      eq: ambientSound.getMasterEQ(),
      reverb: ambientSound.getMasterReverb(),
    };
    const currentPresets = store.get().customPresets || [];
    store.update({ customPresets: [...currentPresets, newPreset] });
    renderCustomPresets();
    showToast(`已儲存「${trimmed}」自訂音景！⭐`);
  });

  elements.btnImportSoundscape?.addEventListener("click", () => {
    const input = window.prompt("請貼上音景分享碼或分享網址：");
    if (!input) return;
    handleImportSoundscape(input.trim());
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

  // Manual weather scene switching
  elements.windowWeather?.addEventListener("change", (e) => {
    store.update({ windowWeather: e.target.value });
    syncWeatherAtmosphere();
  });

  elements.weatherChips?.forEach((chip) => {
    chip.addEventListener("click", () => {
      const mode = chip.dataset.weather;
      if (!mode) return;
      store.update({ windowWeather: mode });
      syncWeatherAtmosphere();
      const names = {
        auto: "✨ 自動智能連動",
        rain: "🌧️ 窗外細雨",
        snow: "❄️ 冬日落雪",
        leaves: "🍂 飄零落葉",
        clear: "🌌 晴空星塵",
      };
      showToast(`窗外景緻已切換為：${names[mode] || mode}`);
    });
  });

  // Clicking window pane cycles weather mode
  elements.cabinWindow?.addEventListener("click", (e) => {
    if (e.target.closest("#windowCelestial")) return;
    const weatherModes = ["auto", "rain", "snow", "leaves", "clear"];
    const current = store.get().windowWeather || "auto";
    const nextIdx = (weatherModes.indexOf(current) + 1) % weatherModes.length;
    const next = weatherModes[nextIdx];
    store.update({ windowWeather: next });
    syncWeatherAtmosphere();
    const names = {
      auto: "✨ 自動智能連動",
      rain: "🌧️ 窗外細雨",
      snow: "❄️ 冬日落雪",
      leaves: "🍂 飄零落葉",
      clear: "🌌 晴空星塵",
    };
    showToast(`窗外景緻已切換為：${names[next] || next}`);
  });

  // Interactive breeze on cabin window
  elements.cabinWindow?.addEventListener("mousemove", (e) => {
    const rect = elements.cabinWindow.getBoundingClientRect();
    if (!rect.width) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    weatherEngine?.setWind(normX * 2.2);
  });
  elements.cabinWindow?.addEventListener("mouseleave", () => {
    weatherEngine?.setWind(0);
  });
  elements.cabinWindow?.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = elements.cabinWindow.getBoundingClientRect();
      if (!rect.width) return;
      const normX = (touch.clientX - rect.left) / rect.width - 0.5;
      weatherEngine?.setWind(normX * 2.2);
    },
    { passive: true },
  );
  elements.cabinWindow?.addEventListener("touchend", () => {
    weatherEngine?.setWind(0);
  });
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

function spawnFloatingReaction(emoji, author = "夥伴") {
  if (!elements.floatingReactions) return;
  const bubble = document.createElement("div");
  bubble.className = "floating-reaction-bubble";
  const drift = (Math.random() - 0.5) * 120;
  bubble.style.setProperty("--drift-x", `${drift}px`);

  const emojiSpan = document.createElement("span");
  emojiSpan.className = "reaction-bubble-emoji";
  emojiSpan.textContent = emoji;

  const authorSpan = document.createElement("span");
  authorSpan.className = "reaction-bubble-author";
  authorSpan.textContent = author;

  bubble.append(emojiSpan, authorSpan);
  elements.floatingReactions.append(bubble);

  window.setTimeout(() => {
    bubble.remove();
  }, 2800);
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

  elements.reactionChips?.forEach((btn) => {
    btn.addEventListener("click", () => {
      const emoji = btn.dataset.reaction;
      if (!emoji) return;
      companionSound.playReactionChime(emoji);
      spawnFloatingReaction(emoji, "你");
      p2p?.sendReaction(emoji, store.get().nickname);
      showToast(`已送出表情 ${emoji} 給同房夥伴！`);
    });
  });

  elements.btnPeerClink?.addEventListener("click", () => {
    companionSound.playCupClink();
    spawnFloatingReaction("🥂", "你");
    spawnZenSpark("🥂 乾杯！");
    p2p?.sendInteraction("clink", store.get().nickname);
    const now = Date.now();
    if (now - lastAffinityInteractionTime.peer > 3000) {
      lastAffinityInteractionTime.peer = now;
      addAffinityExp(5, "伴讀交流");
    }
    showToast("乾杯！與同房夥伴碰杯 🥂");
  });

  elements.btnPeerKnock?.addEventListener("click", () => {
    companionSound.playDeskKnock();
    spawnFloatingReaction("🪵", "你");
    spawnZenSpark("🪵 叩叩！");
    p2p?.sendInteraction("knock", store.get().nickname);
    const now = Date.now();
    if (now - lastAffinityInteractionTime.peer > 3000) {
      lastAffinityInteractionTime.peer = now;
      addAffinityExp(5, "伴讀交流");
    }
    showToast("叩叩！輕敲小木屋木桌打招呼 🪵");
  });
}

function bindHeatmapControls() {
  elements.heatmapPrev?.addEventListener("click", () => {
    heatmapOffsetDays += 28;
    renderHeatmap();
  });
  elements.heatmapReset?.addEventListener("click", () => {
    heatmapOffsetDays = 0;
    renderHeatmap();
  });
  elements.heatmapNext?.addEventListener("click", () => {
    heatmapOffsetDays = Math.max(0, heatmapOffsetDays - 28);
    renderHeatmap();
  });
  elements.heatmapThemeChips?.forEach((chip) => {
    chip.addEventListener("click", () => {
      const theme = chip.dataset.theme;
      if (theme) {
        store.update({ heatmapTheme: theme });
        renderHeatmap();
      }
    });
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

  elements.btnExportWeeklyReport?.addEventListener("click", async () => {
    const md = studyStats.exportExecutiveMarkdownReport(store.get().nickname, taskTracker.tasks, timelineFilter);
    try {
      await navigator.clipboard.writeText(md);
      const scopeName =
        timelineFilter.range === "today"
          ? "今日"
          : timelineFilter.range === "month"
            ? "本月"
            : timelineFilter.range === "all"
              ? "全時段"
              : "週度";
      showToast(`${scopeName}心流復盤報告已複製到剪貼簿！📋`);
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

function createMigrationBundle() {
  return {
    app: "newworld-study-room",
    version: 1,
    exportedAt: Date.now(),
    profile: store.get(),
    tasks: taskTracker.tasks,
    history: studyStats.history,
  };
}

function serializeMigrationBundle(bundle) {
  const json = JSON.stringify(bundle);
  const utf8Bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return "NWSR1_" + btoa(binary);
}

function deserializeMigrationBundle(code) {
  const trimmed = code.trim();
  if (trimmed.startsWith("NWSR1_")) {
    const binary = atob(trimmed.slice(6));
    const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  }
  return JSON.parse(trimmed);
}

function applyMigrationBundle(bundle) {
  if (!bundle || bundle.app !== "newworld-study-room") {
    throw new Error("無效的資料包格式");
  }

  if (bundle.profile && typeof bundle.profile === "object") {
    store.update({
      roomName: bundle.profile.roomName,
      nickname: bundle.profile.nickname,
      minutes: bundle.profile.minutes,
      shortBreakMinutes: bundle.profile.shortBreakMinutes,
      longBreakMinutes: bundle.profile.longBreakMinutes,
      completionChime: bundle.profile.completionChime,
      plantType: bundle.profile.plantType,
      flowAutopilot: bundle.profile.flowAutopilot,
      windDownAlert: bundle.profile.windDownAlert,
    });
  }

  if (Array.isArray(bundle.tasks)) {
    const existingIds = new Set(taskTracker.tasks.map((t) => t.id));
    bundle.tasks.forEach((importedTask) => {
      if (importedTask && importedTask.id && !existingIds.has(importedTask.id)) {
        taskTracker.tasks.push(importedTask);
        existingIds.add(importedTask.id);
      }
    });
    taskTracker.saveTasks();
    renderTasks();
  }

  if (Array.isArray(bundle.history)) {
    const existingHistoryIds = new Set(studyStats.history.map((h) => h.id));
    bundle.history.forEach((entry) => {
      if (entry && entry.id && !existingHistoryIds.has(entry.id)) {
        studyStats.history.push(entry);
        existingHistoryIds.add(entry.id);
      }
    });
    studyStats.saveHistory();
    renderStats();
  }
}

function bindMigrationModal() {
  elements.btnOpenMigration?.addEventListener("click", () => {
    elements.migrationModal?.showModal();
    if (elements.migrationP2PStatus) {
      const isOnline = Boolean(p2p && p2p.peer && p2p.peer.open);
      elements.migrationP2PStatus.textContent = isOnline
        ? `目前連線狀態：${p2p.connections.size} 位夥伴在線`
        : "尚未建立 P2P 房間連線，建議使用方案 A/B 離線代碼包";
    }
  });

  elements.closeMigration?.addEventListener("click", () => {
    elements.migrationModal?.close();
  });

  elements.migrationModal?.addEventListener("click", (e) => {
    if (!e.target.closest(".migration-dialog-card")) {
      elements.migrationModal?.close();
    }
  });

  elements.btnExportMigration?.addEventListener("click", async () => {
    try {
      const bundle = createMigrationBundle();
      const code = serializeMigrationBundle(bundle);
      if (elements.migrationExportText) {
        elements.migrationExportText.value = code;
      }
      await navigator.clipboard.writeText(code);
      showToast("已產生遷移代碼並複製至剪貼簿！📋");
    } catch {
      showToast("已產生遷移代碼，請手動複製文字框內容。");
    }
  });

  elements.btnApplyMigration?.addEventListener("click", () => {
    const raw = elements.migrationImportText?.value || "";
    if (!raw.trim()) {
      showToast("請先貼上欲匯入的遷移代碼包。");
      return;
    }
    try {
      const bundle = deserializeMigrationBundle(raw);
      applyMigrationBundle(bundle);
      if (elements.migrationImportText) elements.migrationImportText.value = "";
      elements.migrationModal?.close();
      showToast("🎉 資料鏡像遷移成功！所有資料已同步生效。");
    } catch {
      showToast("解析失敗，請確認代碼是否完整複製。");
    }
  });

  elements.btnP2PLivePush?.addEventListener("click", () => {
    if (!p2p || !p2p.peer || !p2p.peer.open) {
      showToast("P2P 尚未連線，無法空中推送。");
      return;
    }
    if (p2p.connections.size === 0) {
      showToast("房間內目前沒有其他已連線的夥伴裝置。");
      return;
    }
    const bundle = createMigrationBundle();
    p2p.sendMigrationData(bundle);
    showToast(`已向房內 ${p2p.connections.size} 台夥伴裝置空中推送資料鏡像！🚀`);
  });
}

function openQrModal({ title, subtitle, desc, url }) {
  if (!url) return;
  if (elements.qrModalTitle && title) elements.qrModalTitle.textContent = title;
  if (elements.qrModalSubtitle && subtitle) elements.qrModalSubtitle.textContent = subtitle;
  if (elements.qrModalDesc && desc) elements.qrModalDesc.textContent = desc;
  if (elements.qrModalUrlInput) elements.qrModalUrlInput.value = url;
  if (elements.qrCanvas) {
    renderQrToCanvas(elements.qrCanvas, url, { size: 220, margin: 3 });
  }
  elements.qrModal?.showModal();
}

function bindQrModal() {
  elements.btnShowInviteQr?.addEventListener("click", () => {
    const url = elements.inviteLink?.value;
    if (!url || !url.startsWith("http")) {
      showToast("尚未產生有效的邀請連結。");
      return;
    }
    openQrModal({
      title: "📱 掃描 QR Code 加入自習室",
      subtitle: "純前端即時生成，免外掛套件",
      desc: "用手機相機掃描此 QR Code，即可直接同步加入同一個伴讀房間。",
      url,
    });
  });

  elements.btnShowMigrationQr?.addEventListener("click", () => {
    const url = elements.inviteLink?.value;
    if (!url || !url.startsWith("http")) {
      showToast("尚未產生有效的配對連結。");
      return;
    }
    openQrModal({
      title: "📱 新裝置空中配對 QR Code",
      subtitle: "純前端即時生成，掃碼即配對",
      desc: "使用新裝置掃描此 QR Code，連入同一房間後即可透過方案 C 接收空中推送。",
      url,
    });
  });

  elements.closeQrModal?.addEventListener("click", () => {
    elements.qrModal?.close();
  });

  elements.btnCloseQrModalDialog?.addEventListener("click", () => {
    elements.qrModal?.close();
  });

  elements.qrModal?.addEventListener("click", (e) => {
    if (!e.target.closest(".qr-dialog-card")) {
      elements.qrModal?.close();
    }
  });

  elements.btnCopyQrUrl?.addEventListener("click", async () => {
    const url = elements.qrModalUrlInput?.value || "";
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast("已複製 QR Code 連結至剪貼簿！📋");
    } catch {
      elements.qrModalUrlInput?.select();
      showToast("已選取連結文字。");
    }
  });

  elements.btnDownloadQr?.addEventListener("click", () => {
    if (!elements.qrCanvas) return;
    const isMigration = elements.qrModalTitle?.textContent?.includes("新裝置");
    const filename = isMigration ? "newworld-study-migration-qr.png" : "newworld-study-invite-qr.png";
    downloadQrCanvas(elements.qrCanvas, filename);
    showToast("已下載 QR Code 圖片！📥");
  });

  elements.btnCopyQrImage?.addEventListener("click", async () => {
    if (!elements.qrCanvas) return;
    const copied = await copyQrCanvasToClipboard(elements.qrCanvas);
    if (copied) {
      showToast("QR Code 圖片已複製到剪貼簿！✨");
    } else {
      const isMigration = elements.qrModalTitle?.textContent?.includes("新裝置");
      const filename = isMigration ? "newworld-study-migration-qr.png" : "newworld-study-invite-qr.png";
      downloadQrCanvas(elements.qrCanvas, filename);
      showToast("瀏覽器未開放剪貼簿圖片寫入，已自動下載 PNG 圖片 📥");
    }
  });
}

let currentPosterCanvas = null;

function bindPosterModal() {
  const renderCard = (theme = store.get().posterTheme || "midnight") => {
    const summary = studyStats.getExecutiveSummary();
    const today = new Date().toISOString().split("T")[0];
    const todayMinutes = studyStats.history
      .filter((h) => h.date === today)
      .reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const currentPlant = store.get().plantType || "rose";
    const nickname = store.get().nickname || "旅人";
    const intention = store.get().focusIntention;
    const quote = intention ? `今日專注焦點：「${intention}」` : "每一分鐘的專注，都是給未來的禮物 ✨";

    currentPosterCanvas = FocusPosterGenerator.generate({
      date: today,
      todayMinutes,
      totalHours: summary.totalHours,
      streakDays: summary.streakDays,
      topCategory: summary.topCategory || store.get().focusCategory || "dev",
      harvestedPlant: currentPlant,
      nickname,
      quote,
      theme,
    });

    if (elements.posterCanvasWrapper) {
      elements.posterCanvasWrapper.replaceChildren(currentPosterCanvas);
    }
  };

  elements.posterThemeChips?.forEach((chip) => {
    chip.addEventListener("click", () => {
      const theme = chip.dataset.posterTheme;
      if (!theme) return;
      store.update({ posterTheme: theme });
      elements.posterThemeChips.forEach((c) => c.classList.toggle("active", c === chip));
      renderCard(theme);
    });
  });

  elements.btnOpenPoster?.addEventListener("click", () => {
    const activeTheme = store.get().posterTheme || "midnight";
    elements.posterThemeChips?.forEach((c) => c.classList.toggle("active", c.dataset.posterTheme === activeTheme));
    renderCard(activeTheme);
    elements.posterModal?.showModal();
  });

  elements.closePoster?.addEventListener("click", () => {
    elements.posterModal?.close();
  });

  elements.posterModal?.addEventListener("click", (e) => {
    if (e.target === elements.posterModal) {
      elements.posterModal.close();
    }
  });

  elements.btnDownloadPoster?.addEventListener("click", () => {
    if (!currentPosterCanvas) return;
    const today = new Date().toISOString().split("T")[0];
    FocusPosterGenerator.download(currentPosterCanvas, `focus-flow-${today}.png`);
    showToast("拍立得卡片已開始下載 📸");
  });

  elements.btnCopyPoster?.addEventListener("click", async () => {
    if (!currentPosterCanvas) return;
    const today = new Date().toISOString().split("T")[0];
    const success = await FocusPosterGenerator.copyToClipboard(currentPosterCanvas);
    if (success) {
      showToast("拍立得卡片已複製至剪貼簿 📋");
    } else {
      FocusPosterGenerator.download(currentPosterCanvas, `focus-flow-${today}.png`);
      showToast("因瀏覽器安全限制，已自動為您下載 PNG 📸");
    }
  });
}

function bindFocusIntention() {
  const commitIntention = () => {
    if (!elements.focusIntentionInput) return;
    const val = elements.focusIntentionInput.value.trim().slice(0, 60);
    store.update({ focusIntention: val });
    if (elements.zenIntentionText) {
      elements.zenIntentionText.textContent = val ? `當前意圖：${val}` : "當前意圖：保持專注";
    }
    if (timer.running && timer.mode === "focus") {
      p2p?.sendStatus(
        "focusing",
        store.get().nickname,
        store.get().plantType,
        val,
        store.get().windowWeather,
        store.get().sprintPreset,
      );
    }
  };

  elements.focusIntentionInput?.addEventListener("change", commitIntention);
  elements.focusIntentionInput?.addEventListener("blur", commitIntention);
  elements.focusIntentionInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  });

  elements.btnSyncActiveTask?.addEventListener("click", () => {
    const activeTask = taskTracker.tasks.find((t) => !t.completed);
    if (activeTask) {
      const text = activeTask.title.slice(0, 60);
      if (elements.focusIntentionInput) {
        elements.focusIntentionInput.value = text;
      }
      store.update({ focusIntention: text });
      if (elements.zenIntentionText) {
        elements.zenIntentionText.textContent = `當前意圖：${text}`;
      }
      if (timer.running && timer.mode === "focus") {
        p2p?.sendStatus(
          "focusing",
          store.get().nickname,
          store.get().plantType,
          text,
          store.get().windowWeather,
          store.get().sprintPreset,
        );
      }
      showToast(`已同步當前任務意圖：「${text}」🎯`);
    } else {
      showToast("任務清單中目前沒有未完成的任務。");
    }
  });
}

function bindTasks() {
  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = elements.taskInput.value.trim();
    if (!title) return;
    const target = Number(elements.taskTargetPomo?.value) || 2;
    taskTracker.addTask(title, target);
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
        companionSound.playSingingBowl();
        spawnZenSpark("🏆 任務達成！");
        viewer?.triggerBounce();
        addAffinityExp(10, "完成任務");
        showCompanionBubble("恭喜完成任務！你今天超有毅力 ✨", 4000);
        showToast("任務已完成！繼續保持 🌟");
      } else {
        companionSound.playTapChime();
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

function updateSprintPresetUI(presetKey) {
  elements.sprintChips?.forEach((chip) => {
    const isSelected = chip.dataset.preset === presetKey;
    chip.classList.toggle("active", isSelected);
    chip.setAttribute("aria-checked", String(isSelected));
  });
}

function bindSprintPresets() {
  const SPRINT_MESSAGES = {
    classic: "經典 25 分番茄鐘！節奏明快，保持專注～ 🍅",
    deep: "開啟 50 分鐘深度鑽研！深呼吸，沉浸心流之中 🌊",
    sprint: "15 分鐘極速衝刺！全力攻克眼前關鍵小任務 ⚡",
    ultradian: "90 分鐘超晝心流！跟隨大腦自然律動，全神貫注 🪐",
  };

  const initialPreset = store.get().sprintPreset || "classic";
  updateSprintPresetUI(initialPreset);

  elements.sprintChips?.forEach((chip) => {
    chip.addEventListener("click", () => {
      const presetKey = chip.dataset.preset;
      const preset = SPRINT_PRESETS[presetKey];
      if (!preset) return;

      const currentPreset = store.get().sprintPreset;
      if (currentPreset === presetKey) return;

      timer.applySprintPreset(presetKey);
      store.update({
        sprintPreset: presetKey,
        minutes: preset.focus,
        shortBreakMinutes: preset.shortBreak,
        longBreakMinutes: preset.longBreak,
      });

      if (elements.minutes) elements.minutes.value = String(preset.focus);
      if (elements.shortBreakMinutes) elements.shortBreakMinutes.value = String(preset.shortBreak);
      if (elements.longBreakMinutes) elements.longBreakMinutes.value = String(preset.longBreak);

      if (elements.pillShortBreakText) elements.pillShortBreakText.textContent = `☕ 短休 ${preset.shortBreak}m`;
      if (elements.pillLongBreakText) elements.pillLongBreakText.textContent = `🌴 長休 ${preset.longBreak}m`;

      updateSprintPresetUI(presetKey);
      renderTasks();

      const bubbleMsg = SPRINT_MESSAGES[presetKey] || `已切換為「${preset.label}」衝刺模式！`;
      showCompanionBubble(bubbleMsg, 3500);
      showToast(`已套用「${preset.label}」衝刺設定（專注 ${preset.focus}m / 短休 ${preset.shortBreak}m）。`);
    });
  });
}

function renderParkingLot() {
  if (!elements.distractionList) return;
  const items = store.get().parkingLot || [];
  const pendingCount = items.filter((item) => !item.completed).length;

  if (elements.parkingLotCount) {
    elements.parkingLotCount.textContent = String(items.length);
  }

  if (elements.parkingBadge) {
    if (pendingCount > 0) {
      elements.parkingBadge.textContent = String(pendingCount);
      elements.parkingBadge.hidden = false;
    } else {
      elements.parkingBadge.hidden = true;
    }
  }

  elements.distractionList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "distraction-empty";
    empty.textContent = "思緒清明，暫無雜念塵埃 ✨";
    elements.distractionList.append(empty);
    return;
  }

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = `distraction-item ${item.completed ? "completed" : ""}`.trim();
    el.dataset.id = item.id;

    const left = document.createElement("div");
    left.className = "distraction-item-left";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!item.completed;
    chk.title = item.completed ? "標示為未完成" : "標示為已處理";
    chk.setAttribute("aria-label", `切換狀態：${item.text}`);
    chk.addEventListener("change", () => {
      const current = store.get().parkingLot || [];
      const updated = current.map((p) => (p.id === item.id ? { ...p, completed: chk.checked } : p));
      store.update({ parkingLot: updated });
      renderParkingLot();
    });

    const span = document.createElement("span");
    span.className = "distraction-text";
    span.textContent = item.text;
    span.title = item.text;

    left.append(chk, span);

    const actions = document.createElement("div");
    actions.className = "distraction-actions";

    const convertBtn = document.createElement("button");
    convertBtn.type = "button";
    convertBtn.className = "distraction-action-btn promote";
    convertBtn.title = "轉化為待辦任務";
    convertBtn.setAttribute("aria-label", `轉為待辦任務：${item.text}`);
    convertBtn.innerHTML = '<i data-lucide="plus-circle"></i>';
    convertBtn.addEventListener("click", () => {
      taskTracker.addTask(item.text, 1);
      const current = store.get().parkingLot || [];
      store.update({
        parkingLot: current.filter((p) => p.id !== item.id),
      });
      renderTasks();
      renderParkingLot();
      showToast("已將雜念轉化為待辦任務！📋");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "distraction-action-btn delete";
    delBtn.title = "刪除雜念";
    delBtn.setAttribute("aria-label", `刪除雜念：${item.text}`);
    delBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    delBtn.addEventListener("click", () => {
      const current = store.get().parkingLot || [];
      store.update({ parkingLot: current.filter((p) => p.id !== item.id) });
      renderParkingLot();
    });

    actions.append(convertBtn, delBtn);
    el.append(left, actions);
    elements.distractionList.append(el);
  });

  createIcons({ icons });
}

function openDistractionModal() {
  if (!elements.distractionModal) return;
  renderParkingLot();
  elements.distractionModal.showModal();
  elements.distractionInput?.focus();
}

function closeDistractionModal() {
  elements.distractionModal?.close();
}

function bindDistraction() {
  elements.btnQuickDistraction?.addEventListener("click", openDistractionModal);
  elements.closeDistraction?.addEventListener("click", closeDistractionModal);

  elements.distractionModal?.addEventListener("click", (e) => {
    if (!e.target.closest(".distraction-dialog-card")) {
      closeDistractionModal();
    }
  });

  elements.distractionForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = (elements.distractionInput?.value || "").trim();
    if (!text) return;
    const current = store.get().parkingLot || [];
    const newItem = {
      id: `dist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text,
      createdAt: Date.now(),
      completed: false,
    };
    store.update({ parkingLot: [newItem, ...current] });
    if (elements.distractionInput) elements.distractionInput.value = "";
    renderParkingLot();
    showToast("雜念已封存至收集箱 💡 繼續保持專注！");
  });

  elements.btnClearFinishedParking?.addEventListener("click", () => {
    const current = store.get().parkingLot || [];
    const remaining = current.filter((p) => !p.completed);
    const cleared = current.length - remaining.length;
    if (cleared > 0) {
      store.update({ parkingLot: remaining });
      renderParkingLot();
      showToast(`已清理 ${cleared} 項已處理的雜念 ✨`);
    } else {
      showToast("目前沒有已處理的雜念項目。");
    }
  });
}

function bindBatchTaskImporter() {
  elements.btnBatchImportTasks?.addEventListener("click", () => {
    elements.batchTaskModal?.showModal();
    elements.batchTaskInput?.focus();
  });

  elements.closeBatchTask?.addEventListener("click", () => {
    elements.batchTaskModal?.close();
  });

  elements.btnCancelBatchTask?.addEventListener("click", () => {
    elements.batchTaskModal?.close();
  });

  elements.batchTaskModal?.addEventListener("click", (e) => {
    if (!e.target.closest(".batch-task-dialog-card")) {
      elements.batchTaskModal?.close();
    }
  });

  elements.btnConfirmBatchTasks?.addEventListener("click", () => {
    const text = elements.batchTaskInput?.value || "";
    const added = taskTracker.importMarkdown(text);
    if (added.length > 0) {
      renderTasks();
      if (elements.batchTaskInput) elements.batchTaskInput.value = "";
      elements.batchTaskModal?.close();
      showToast(`成功批次匯入 ${added.length} 個任務！📋`);
    } else {
      showToast("未辨識出有效任務項目，請檢查格式。");
    }
  });

  elements.btnClearCompletedTasks?.addEventListener("click", () => {
    const cleared = taskTracker.clearCompleted();
    if (cleared > 0) {
      renderTasks();
      showToast(`已清理 ${cleared} 個已完成任務 🧹`);
    } else {
      showToast("目前沒有已完成的任務可清理。");
    }
  });
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
  elements.shortBreakMinutes?.addEventListener("change", () => {
    const shortBreakMinutes = Math.max(1, Math.min(30, Number(elements.shortBreakMinutes.value) || 5));
    store.update({ shortBreakMinutes });
    timer.setBreakDurations({
      shortBreak: shortBreakMinutes,
      longBreak: store.get().longBreakMinutes || 15,
    });
    showToast(`短休時間已設定為 ${shortBreakMinutes} 分鐘。`);
  });
  elements.longBreakMinutes?.addEventListener("change", () => {
    const longBreakMinutes = Math.max(5, Math.min(60, Number(elements.longBreakMinutes.value) || 15));
    store.update({ longBreakMinutes });
    timer.setBreakDurations({
      shortBreak: store.get().shortBreakMinutes || 5,
      longBreak: longBreakMinutes,
    });
    showToast(`長休時間已設定為 ${longBreakMinutes} 分鐘。`);
  });
  elements.completionChime?.addEventListener("change", () => {
    const completionChime = elements.completionChime.value;
    store.update({ completionChime });
    companionSound.playCompletionChime(completionChime);
    const chimeNames = {
      fanfare: "歡慶號角",
      bowl: "西藏頌缽",
      wooden_fish: "禪意木魚",
      wind_chime: "微風風鈴",
    };
    showToast(`完賽鈴聲已切換為「${chimeNames[completionChime] || completionChime}」（試聽播放中）`);
  });
  elements.syncWithHostTimer?.addEventListener("change", () => {
    const syncWithHostTimer = elements.syncWithHostTimer.checked;
    store.update({ syncWithHostTimer });
    if (elements.timerSyncBadge) {
      elements.timerSyncBadge.hidden = !syncWithHostTimer || p2p?.role !== "guest";
    }
    showToast(syncWithHostTimer ? "已開啟「跟隨房主番茄鐘倒數」同步" : "已關閉房主番茄鐘同步");
  });
  elements.flowAutopilot?.addEventListener("change", () => {
    const flowAutopilot = elements.flowAutopilot.checked;
    store.update({ flowAutopilot });
    showToast(flowAutopilot ? "已開啟心流自動巡航（自動接續下一輪）" : "已關閉心流自動巡航");
  });
  elements.windDownAlert?.addEventListener("change", () => {
    const windDownAlert = elements.windDownAlert.checked;
    store.update({ windDownAlert });
    showToast(windDownAlert ? "已開啟收尾溫柔提示音（3m / 1m 水晶音）" : "已關閉收尾提示音");
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
  elements.toggleNotification?.addEventListener("click", async () => {
    if (!notificationManager.isSupported()) {
      showToast("您的瀏覽器不支援桌面推播通知。");
      return;
    }
    const perm = notificationManager.getPermission();
    if (perm === "denied") {
      showToast("通知已被瀏覽器封鎖，請點擊網址列左側設定允許通知。");
      return;
    }
    if (perm === "default") {
      const res = await notificationManager.requestPermission();
      if (res === "granted") {
        store.update({ desktopNotifications: true });
        showToast("桌面通知已開啟！番茄鐘結束時會提醒您 🔔");
      } else {
        showToast("未允許桌面通知權限。");
      }
      updateNotificationUI();
      return;
    }
    const current = store.get().desktopNotifications;
    store.update({ desktopNotifications: !current });
    showToast(!current ? "桌面通知已啟用 🔔" : "桌面通知已關閉 🔕");
    updateNotificationUI();
  });
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
    if (elements.btnShowInviteQr) elements.btnShowInviteQr.disabled = false;
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
      if (store.get().desktopNotifications) {
        notificationManager.notifyTip({ author: event.detail.by, text: event.detail.text });
      }
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
  p2p.addEventListener("peer-reaction", (event) => {
    const detail = event.detail;
    companionSound.playReactionChime(detail.emoji);
    spawnFloatingReaction(detail.emoji, detail.by || "同房夥伴");
    showToast(`${detail.by || "夥伴"} 送來了表情反應 ${detail.emoji}！`);
  });
  p2p.addEventListener("peer-interaction", (event) => {
    const detail = event.detail;
    if (detail.action === "clink") {
      companionSound.playCupClink();
      spawnFloatingReaction("🥂", detail.by || "同房夥伴");
      spawnZenSpark("🥂 乾杯！");
      showToast(`🥂 ${detail.by || "夥伴"} 與你乾杯碰杯！`);
    } else if (detail.action === "knock") {
      companionSound.playDeskKnock();
      spawnFloatingReaction("🪵", detail.by || "同房夥伴");
      spawnZenSpark("🪵 叩叩！");
      showToast(`🪵 ${detail.by || "夥伴"} 敲敲木桌向你打招呼！`);
    }
  });
  p2p.addEventListener("migration-data", (event) => {
    const detail = event.detail;
    if (!detail?.bundle) return;
    const from = detail.fromPeerId ? `夥伴 (${detail.fromPeerId.slice(0, 6)})` : "同房夥伴";
    const confirmed = window.confirm(
      `收到來自 ${from} 的小木屋設定與資料鏡像，是否立即套用至本機？\n（此操作將融合任務與里程碑）`,
    );
    if (confirmed) {
      applyMigrationBundle(detail.bundle);
      showToast("🎉 已成功自 P2P 即時同步資料鏡像！");
    }
  });
  p2p.addEventListener("peer-status", (event) => {
    const detail = event.detail;
    if (elements.peerStatusBar && elements.peerStatusText) {
      const weatherEmojiMap = {
        auto: "✨",
        rain: "🌧️",
        snow: "❄️",
        leaves: "🍂",
        clear: "🌌",
      };
      const presetNameMap = {
        classic: "黃金 25m",
        deep: "深度 50m",
        sprint: "衝刺 15m",
        ultradian: "晝夜 90m",
        custom: "自訂",
      };
      const statusAction = detail.status === "focusing" ? "正在專注" : "正在小憩喝水 🍵";
      const intentionSnippet = detail.intention ? `：「${detail.intention}」` : "";
      const weatherSnippet =
        detail.weather && detail.weather !== "auto" ? ` · 窗外 ${weatherEmojiMap[detail.weather] || "✨"}` : "";
      const presetSnippet =
        detail.sprintPreset && detail.status === "focusing" ? ` · ${presetNameMap[detail.sprintPreset] || ""}` : "";
      elements.peerStatusText.textContent = `${detail.by} ${statusAction}${intentionSnippet}${weatherSnippet}${presetSnippet}`;
      elements.peerStatusBar.hidden = false;
      window.setTimeout(() => {
        if (elements.peerStatusBar) elements.peerStatusBar.hidden = true;
      }, 7000);
    }
  });
  p2p.addEventListener("security-event", (event) => showToast(event.detail));
  p2p.addEventListener("network-error", (event) => showToast(event.detail));
  p2p.addEventListener("timer-sync", (event) => {
    if (store.get().syncWithHostTimer && p2p.role === "guest") {
      timer.syncState(event.detail);
      updateTimerModeUI(event.detail.mode, event.detail.cycleRound);
    }
  });
  p2p.addEventListener("presence", () => {
    if (p2p.role === "host") {
      broadcastTimerSyncIfHost();
    }
  });
  await p2p.start();
  const isGuest = p2p.role === "guest";
  if (elements.p2pSyncRow) elements.p2pSyncRow.hidden = !isGuest;
  if (elements.timerSyncBadge) elements.timerSyncBadge.hidden = !isGuest || !store.get().syncWithHostTimer;
  if (!isGuest) {
    broadcastTimerSyncIfHost();
  }
  p2p.restoreOutbox(store.getPendingTips());
}

async function restartP2P() {
  if (p2pStartPromise) return;
  p2p?.destroy();
  elements.copyInvite.disabled = true;
  if (elements.btnShowInviteQr) elements.btnShowInviteQr.disabled = true;
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

function spawnPetHearts(x = 115, y = 70) {
  if (!elements.petHearts) return;
  const hearts = ["❤️", "💖", "💕", "✨", "🌸"];
  for (let i = 0; i < 4; i++) {
    const heart = document.createElement("span");
    heart.className = "pet-heart";
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    const dx = (Math.random() - 0.5) * 50;
    const dy = (Math.random() - 0.5) * 20;
    const rot = (Math.random() - 0.5) * 40;
    heart.style.left = `${Math.max(10, Math.min(220, x + dx))}px`;
    heart.style.top = `${Math.max(10, Math.min(200, y + dy))}px`;
    heart.style.setProperty("--dx", `${(Math.random() - 0.5) * 40}px`);
    heart.style.setProperty("--rot", `${rot}deg`);
    elements.petHearts.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
  }
}

let idleSleepTimer = null;
let isDollSleeping = false;

function wakeUpDoll() {
  if (isDollSleeping) {
    isDollSleeping = false;
    viewer?.setSleeping(false);
    if (elements.sleepBubble) elements.sleepBubble.hidden = true;
  }
}

function bindIdleSleep() {
  const resetIdle = () => {
    wakeUpDoll();
    clearTimeout(idleSleepTimer);
    idleSleepTimer = setTimeout(
      () => {
        const isTimerRunning = elements.focusGarden?.classList.contains("growing");
        if (!isTimerRunning) {
          isDollSleeping = true;
          viewer?.setSleeping(true);
          if (elements.sleepBubble) elements.sleepBubble.hidden = false;
        }
      },
      10 * 60 * 1000,
    );
  };

  window.addEventListener("pointermove", resetIdle);
  window.addEventListener("pointerdown", resetIdle);
  window.addEventListener("keydown", resetIdle);
  resetIdle();
}

function bindZenMode() {
  let zenInactivityTimer = null;

  const showZenControls = () => {
    if (!document.body.classList.contains("zen-mode")) return;
    document.body.classList.remove("zen-inactive");
    clearTimeout(zenInactivityTimer);
    zenInactivityTimer = setTimeout(() => {
      if (document.body.classList.contains("zen-mode")) {
        document.body.classList.add("zen-inactive");
      }
    }, 3000);
  };

  const enterZen = () => {
    document.body.classList.add("zen-mode");
    if (elements.exitZenBtn) elements.exitZenBtn.hidden = false;
    showToast("已進入極簡禪意模式（按 Esc 或 Z 退出）");
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Optional fullscreen
    }
    showZenControls();
  };

  const exitZen = () => {
    document.body.classList.remove("zen-mode", "zen-inactive");
    if (elements.exitZenBtn) elements.exitZenBtn.hidden = true;
    clearTimeout(zenInactivityTimer);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Ignore
    }
    showToast("已退出禪意模式");
  };

  const toggleZen = () => {
    if (document.body.classList.contains("zen-mode")) {
      exitZen();
    } else {
      enterZen();
    }
  };

  elements.toggleZen?.addEventListener("click", toggleZen);
  elements.exitZenBtn?.addEventListener("click", exitZen);

  window.addEventListener("mousemove", showZenControls);
  window.addEventListener("pointerdown", showZenControls);

  window.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    if (activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable) {
      return;
    }

    if (e.key === "Escape" && document.body.classList.contains("zen-mode")) {
      e.preventDefault();
      exitZen();
    }
  });
}

function bindShortcuts() {
  elements.openShortcuts?.addEventListener("click", () => {
    elements.shortcutsModal?.showModal();
  });
  elements.closeShortcuts?.addEventListener("click", () => {
    elements.shortcutsModal?.close();
  });
  elements.shortcutsModal?.addEventListener("click", (e) => {
    const dialogCard = e.target.closest(".shortcuts-dialog-card");
    if (!dialogCard && elements.shortcutsModal.open) {
      elements.shortcutsModal.close();
    }
  });

  window.addEventListener("keydown", (e) => {
    const target = e.target;
    const isEditing =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable);
    if (isEditing) return;

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "?") {
      e.preventDefault();
      if (elements.shortcutsModal?.open) {
        elements.shortcutsModal.close();
      } else {
        elements.shortcutsModal?.showModal();
      }
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      elements.toggleTimer?.click();
      return;
    }

    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      elements.resetTimer?.click();
      return;
    }

    if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      elements.toggleMusic?.click();
      return;
    }

    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      elements.toggleAmbient?.click();
      return;
    }

    if (e.key === "z" || e.key === "Z") {
      e.preventDefault();
      elements.toggleZen?.click();
      return;
    }

    if (e.key === "1") {
      e.preventDefault();
      elements.btnWoodenFish?.click();
      return;
    }

    if (e.key === "2") {
      e.preventDefault();
      elements.btnSingingBowl?.click();
      return;
    }

    if (e.key === "3") {
      e.preventDefault();
      elements.btnBreathingGuide?.click();
      return;
    }

    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      elements.taskPanel?.scrollIntoView({ behavior: "smooth" });
      elements.taskInput?.focus();
      return;
    }

    if (e.key === "i" || e.key === "I") {
      e.preventDefault();
      openDistractionModal();
      return;
    }

    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      elements.statsPanel?.scrollIntoView({ behavior: "smooth" });
      return;
    }
  });
}

function spawnZenSpark(text) {
  if (!elements.zenSparks) return;
  const bubble = document.createElement("div");
  bubble.className = "zen-spark-bubble";
  bubble.textContent = text;
  const drift = (Math.random() - 0.5) * 40;
  bubble.style.setProperty("--drift-x", `${drift}px`);
  elements.zenSparks.append(bubble);
  window.setTimeout(() => bubble.remove(), 2200);
}

function spawnZenRipple() {
  if (!elements.zenSparks) return;
  const ripple = document.createElement("div");
  ripple.className = "zen-ripple";
  elements.zenSparks.append(ripple);
  window.setTimeout(() => ripple.remove(), 2200);
}

function bindZenTools() {
  elements.btnWoodenFish?.addEventListener("click", () => {
    companionSound.playWoodenFish();
    spawnZenSpark("✨ 專注 +1");
    viewer?.triggerBounce();
  });

  elements.btnSingingBowl?.addEventListener("click", () => {
    companionSound.playSingingBowl();
    spawnZenRipple();
    spawnZenSpark("🧘 靜心凝神");
  });

  elements.btnBreathingGuide?.addEventListener("click", () => {
    elements.breathingModal?.showModal();
  });
}

const BREATHING_MODES = {
  box: {
    name: "箱式呼吸 4-4-4-4",
    phases: [
      { name: "吸氣 Inhale", cue: "inhale", seconds: 4, cls: "inhale" },
      { name: "屏息 Hold", cue: "hold", seconds: 4, cls: "hold" },
      { name: "呼氣 Exhale", cue: "exhale", seconds: 4, cls: "exhale" },
      { name: "屏息 Rest", cue: "rest", seconds: 4, cls: "rest" },
    ],
  },
  relax: {
    name: "放鬆呼吸 4-7-8",
    phases: [
      { name: "吸氣 Inhale", cue: "inhale", seconds: 4, cls: "inhale" },
      { name: "屏息 Hold", cue: "hold", seconds: 7, cls: "hold" },
      { name: "呼氣 Exhale", cue: "exhale", seconds: 8, cls: "exhale" },
    ],
  },
  awake: {
    name: "提神呼吸 4-2-4-2",
    phases: [
      { name: "吸氣 Inhale", cue: "inhale", seconds: 4, cls: "inhale" },
      { name: "屏息 Hold", cue: "hold", seconds: 2, cls: "hold" },
      { name: "呼氣 Exhale", cue: "exhale", seconds: 4, cls: "exhale" },
      { name: "屏息 Rest", cue: "rest", seconds: 2, cls: "rest" },
    ],
  },
};

const breathingState = {
  running: false,
  mode: "box",
  phaseIndex: 0,
  secondsRemaining: 4,
  completedCycles: 0,
  timerInterval: null,
};

function updateBreathingVisual() {
  if (!elements.breathingHaloOuter) return;
  const currentMode = BREATHING_MODES[breathingState.mode] || BREATHING_MODES.box;
  const currentPhase = currentMode.phases[breathingState.phaseIndex];

  if (!breathingState.running) {
    elements.breathingHaloOuter.className = "breathing-halo-outer";
    if (elements.breathingPhaseText) elements.breathingPhaseText.textContent = "準備開始";
    if (elements.breathingSecondsText) elements.breathingSecondsText.textContent = "--";
    if (elements.btnToggleBreathing) {
      elements.btnToggleBreathing.classList.remove("active");
      if (elements.breathingPlayText) elements.breathingPlayText.textContent = "開始呼吸";
      replaceButtonIcon(elements.btnToggleBreathing, "play", "開始呼吸");
    }
    return;
  }

  elements.breathingHaloOuter.className = `breathing-halo-outer ${currentPhase.cls}`;
  if (elements.breathingPhaseText) elements.breathingPhaseText.textContent = currentPhase.name;
  if (elements.breathingSecondsText) elements.breathingSecondsText.textContent = `${breathingState.secondsRemaining}s`;

  if (elements.btnToggleBreathing) {
    elements.btnToggleBreathing.classList.add("active");
    if (elements.breathingPlayText) elements.breathingPlayText.textContent = "暫停引導";
    replaceButtonIcon(elements.btnToggleBreathing, "pause", "暫停引導");
  }
}

function stopBreathingGuide() {
  if (breathingState.timerInterval) {
    clearInterval(breathingState.timerInterval);
    breathingState.timerInterval = null;
  }
  breathingState.running = false;
  updateBreathingVisual();
}

function startBreathingGuide() {
  stopBreathingGuide();
  breathingState.running = true;
  const currentMode = BREATHING_MODES[breathingState.mode] || BREATHING_MODES.box;
  const currentPhase = currentMode.phases[breathingState.phaseIndex];
  breathingState.secondsRemaining = currentPhase.seconds;

  companionSound.playBreathingCue(currentPhase.cue);
  updateBreathingVisual();

  breathingState.timerInterval = setInterval(() => {
    breathingState.secondsRemaining--;
    if (breathingState.secondsRemaining <= 0) {
      const modeConfig = BREATHING_MODES[breathingState.mode] || BREATHING_MODES.box;
      breathingState.phaseIndex = (breathingState.phaseIndex + 1) % modeConfig.phases.length;
      if (breathingState.phaseIndex === 0) {
        breathingState.completedCycles++;
        if (elements.breathingCycleBadge) {
          elements.breathingCycleBadge.textContent = `已完成 ${breathingState.completedCycles} 循環`;
        }
      }
      const nextPhase = modeConfig.phases[breathingState.phaseIndex];
      breathingState.secondsRemaining = nextPhase.seconds;
      companionSound.playBreathingCue(nextPhase.cue);
    }
    updateBreathingVisual();
  }, 1000);
}

function bindBreathingGuide() {
  elements.closeBreathing?.addEventListener("click", () => {
    stopBreathingGuide();
    elements.breathingModal?.close();
  });
  elements.breathingModal?.addEventListener("click", (e) => {
    const dialogCard = e.target.closest(".breathing-dialog-card");
    if (!dialogCard && elements.breathingModal.open) {
      stopBreathingGuide();
      elements.breathingModal.close();
    }
  });

  elements.breathingModePills?.forEach((pill) => {
    pill.addEventListener("click", () => {
      const mode = pill.dataset.mode;
      if (!mode || !BREATHING_MODES[mode]) return;
      breathingState.mode = mode;
      breathingState.phaseIndex = 0;
      elements.breathingModePills.forEach((p) => p.classList.toggle("active", p === pill));
      stopBreathingGuide();
    });
  });

  elements.btnToggleBreathing?.addEventListener("click", () => {
    if (breathingState.running) {
      stopBreathingGuide();
    } else {
      startBreathingGuide();
    }
  });
}

let prepBreathTimer = null;
const PREP_MAX_BREATHS = 3;

function stopPrepBreathing() {
  if (prepBreathTimer) {
    clearTimeout(prepBreathTimer);
    prepBreathTimer = null;
  }
  if (elements.prepBreathRing) {
    elements.prepBreathRing.className = "prep-breath-ring";
  }
}

function runPrepBreathingCycle(cycleCount = 1) {
  if (!elements.flowPrepModal?.open) return;
  if (cycleCount > PREP_MAX_BREATHS) {
    if (elements.prepBreathPhaseText) elements.prepBreathPhaseText.textContent = "心神沉靜 ✨";
    if (elements.prepBreathSubtext) elements.prepBreathSubtext.textContent = "意念已凝聚 · 準備出發";
    if (elements.prepBreathCounter) elements.prepBreathCounter.textContent = "儀式完成 🌸";
    if (elements.prepBreathRing) elements.prepBreathRing.className = "prep-breath-ring";
    companionSound.playSingingBowl();
    return;
  }

  if (elements.prepBreathCounter) {
    elements.prepBreathCounter.textContent = `第 ${cycleCount} / ${PREP_MAX_BREATHS} 次呼吸`;
  }

  // Phase 1: Inhale (4s)
  if (elements.prepBreathRing) elements.prepBreathRing.className = "prep-breath-ring inhale";
  if (elements.prepBreathPhaseText) elements.prepBreathPhaseText.textContent = "緩緩吸氣";
  if (elements.prepBreathSubtext) elements.prepBreathSubtext.textContent = "感受清新能量進入身心";
  companionSound.playTapChime();

  prepBreathTimer = window.setTimeout(() => {
    if (!elements.flowPrepModal?.open) return;

    // Phase 2: Hold (2s)
    if (elements.prepBreathRing) elements.prepBreathRing.className = "prep-breath-ring hold";
    if (elements.prepBreathPhaseText) elements.prepBreathPhaseText.textContent = "屏息凝聚";
    if (elements.prepBreathSubtext) elements.prepBreathSubtext.textContent = "安定意念與思緒";

    prepBreathTimer = window.setTimeout(() => {
      if (!elements.flowPrepModal?.open) return;

      // Phase 3: Exhale (4s)
      if (elements.prepBreathRing) elements.prepBreathRing.className = "prep-breath-ring exhale";
      if (elements.prepBreathPhaseText) elements.prepBreathPhaseText.textContent = "緩緩吐氣";
      if (elements.prepBreathSubtext) elements.prepBreathSubtext.textContent = "放下肩膀與緊繃";

      prepBreathTimer = window.setTimeout(() => {
        if (!elements.flowPrepModal?.open) return;
        runPrepBreathingCycle(cycleCount + 1);
      }, 4000);
    }, 2000);
  }, 4000);
}

function startFlowFromRitual() {
  stopPrepBreathing();
  const intention = elements.prepIntentionInput?.value?.trim()?.slice(0, 60);
  if (intention) {
    store.update({ focusIntention: intention });
    if (elements.focusIntentionInput) elements.focusIntentionInput.value = intention;
    if (elements.zenIntentionText) elements.zenIntentionText.textContent = `當前意圖：${intention}`;
  }
  if (!timer.running) {
    timer.start();
  }
  viewer?.triggerBounce();
  addAffinityExp(15, "靜心儀式");
  showCompanionBubble("鎖定意圖，我們一起進入心流狀態！💫", 3500);
  showToast("心流儀式完成，專注啟動！🚀");
  elements.flowPrepModal?.close();
}

function bindFlowPrep() {
  elements.btnFlowPrep?.addEventListener("click", () => {
    const currentIntention = store.get().focusIntention || taskTracker.tasks.find((t) => !t.completed)?.title || "";
    if (elements.prepIntentionInput) {
      elements.prepIntentionInput.value = currentIntention;
    }
    stopPrepBreathing();
    elements.flowPrepModal?.showModal();
    runPrepBreathingCycle(1);
  });

  elements.closeFlowPrep?.addEventListener("click", () => {
    stopPrepBreathing();
    elements.flowPrepModal?.close();
  });

  elements.flowPrepModal?.addEventListener("click", (e) => {
    const dialogCard = e.target.closest(".flow-prep-dialog-card");
    if (!dialogCard && elements.flowPrepModal.open) {
      stopPrepBreathing();
      elements.flowPrepModal.close();
    }
  });

  elements.btnSkipPrepBreath?.addEventListener("click", startFlowFromRitual);
  elements.btnStartFlowFromPrep?.addEventListener("click", startFlowFromRitual);

  elements.prepIntentionInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      startFlowFromRitual();
    }
  });
}

function renderHerbarium() {
  if (!elements.plantsView || !elements.badgesView) return;
  const plants = studyStats.getHerbarium();
  elements.plantsView.innerHTML = `
    <div class="plant-grid">
      ${plants
        .map(
          (p) => `
        <div class="plant-card ${p.unlocked ? "unlocked" : "locked"}">
          <div class="plant-card-icon">${p.icon}</div>
          <div class="plant-card-body">
            <div class="plant-card-title-row">
              <span class="plant-card-name">${p.name}</span>
              <span class="plant-card-status">${p.unlocked ? "已綻放" : "未解鎖"}</span>
            </div>
            <div class="plant-card-lang">花語：${p.language}</div>
            <div class="plant-card-desc">${p.description}</div>
            <div class="plant-card-stats">
              <span>採收次數：<strong>${p.harvestCount}</strong> 次</span>
              ${p.firstUnlockedAt ? `<span>初次綻放：${new Date(p.firstUnlockedAt).toLocaleDateString()}</span>` : ""}
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;

  const badges = studyStats.getBadges();
  elements.badgesView.innerHTML = `
    <div class="badge-grid">
      ${badges
        .map(
          (b) => `
        <div class="badge-card ${b.unlocked ? "unlocked" : "locked"}">
          <div class="badge-icon">${b.icon}</div>
          <div class="badge-body">
            <div class="badge-title-row">
              <span class="badge-name">${b.name}</span>
              <span class="badge-rarity ${b.rarity}">${b.rarity}</span>
            </div>
            <div class="badge-desc">${b.description}</div>
            ${b.unlocked && b.unlockedAt ? `<div class="badge-meta">達成時間：${new Date(b.unlockedAt).toLocaleDateString()}</div>` : ""}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function bindHerbarium() {
  elements.openHerbarium?.addEventListener("click", () => {
    renderHerbarium();
    elements.herbariumModal?.showModal();
  });
  elements.closeHerbarium?.addEventListener("click", () => {
    elements.herbariumModal?.close();
  });
  elements.herbariumModal?.addEventListener("click", (e) => {
    if (e.target === elements.herbariumModal) {
      elements.herbariumModal.close();
    }
  });

  elements.tabPlants?.addEventListener("click", () => {
    elements.tabPlants.classList.add("active");
    elements.tabBadges.classList.remove("active");
    elements.plantsView.hidden = false;
    elements.badgesView.hidden = true;
  });

  elements.tabBadges?.addEventListener("click", () => {
    elements.tabBadges.classList.add("active");
    elements.tabPlants.classList.remove("active");
    elements.badgesView.hidden = false;
    elements.plantsView.hidden = true;
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
    viewer.onPet = (x, y) => {
      companionSound.playPettingPurr();
      spawnPetHearts(x, y);
      wakeUpDoll();
      const now = Date.now();
      if (now - lastAffinityInteractionTime.pet > 3000) {
        lastAffinityInteractionTime.pet = now;
        addAffinityExp(3, "撫摸夥伴");
      }
      const petQuotes = [
        "好舒服呀～摸摸頭最治癒了！(｡♥‿♥｡)",
        "咕嚕咕嚕... 充滿能量，繼續陪你專注！✨",
        "有你摸摸頭，今天的任務一定能順利完成！🌸",
        "摸摸～頭腦清醒了！一起加油吧！💪",
      ];
      const quote = petQuotes[Math.floor(Math.random() * petQuotes.length)];
      showCompanionBubble(quote, 2800);
    };
    renderState(store.get());
    applyCurrentAura();
  } catch {
    elements.dollCanvas.hidden = true;
    showToast("目前瀏覽器無法顯示 3D，已切換為簡易娃娃。 ");
  }
}

function checkSoundscapeUrlHash() {
  const hash = window.location.hash;
  if (!hash || !hash.includes("soundscape=")) return;
  const match = hash.match(/soundscape=([a-zA-Z0-9_-]+)/);
  if (!match || !match[1]) return;
  const code = match[1];
  const decoded = decodeSoundscapeCode(code);
  if (!decoded) return;

  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch {
    // Ignore in non-standard environments
  }

  const name = decoded.name || "分享音景";
  const shouldImport = window.confirm(`檢測到分享的「${name}」音景，是否立即匯入並套用？`);
  if (!shouldImport) return;

  const normalizedTracks = {};
  for (const [k, v] of Object.entries(decoded.tracks)) {
    const num = Number(v);
    normalizedTracks[k] = num > 1 ? Math.round((num / 100) * 100) / 100 : num;
  }

  const newPreset = {
    id: crypto.randomUUID(),
    name,
    tracks: normalizedTracks,
    pans: decoded.pans || {},
    eq: decoded.eq || null,
    reverb: decoded.reverb || null,
  };

  const currentPresets = store.get().customPresets || [];
  store.update({ customPresets: [...currentPresets, newPreset] });
  renderCustomPresets();

  ambientSound.applyTrackMix(newPreset.tracks, newPreset.pans);
  if (newPreset.eq) ambientSound.setMasterEQ(newPreset.eq);
  if (newPreset.reverb) ambientSound.setMasterReverb(newPreset.reverb);
  syncAcousticUI();
  elements.ambientChips.forEach((chipEl) => {
    const sound = chipEl.dataset.sound;
    if (sound === "lofi") return;
    const isPlaying = sound in newPreset.tracks && newPreset.tracks[sound] > 0;
    chipEl.classList.toggle("active", isPlaying);
    chipEl.setAttribute("aria-pressed", String(isPlaying));
  });
  syncWeatherAtmosphere();
  renderAmbientMixer();
  showToast(`已載入分享音景「${name}」！🎧`);
}

function init() {
  store.subscribe(renderState);
  bindImageUpload();
  bindCompanionMode();
  bindDollStyle();
  bindAccessories();
  bindAtmosphere();
  bindTimer();
  bindFlowReflection();
  bindSmartBreak();
  bindMusic();
  bindCategoryPicker();
  bindShortcuts();
  bindAmbientSound();
  renderAmbientMixer();
  bindPresets();
  bindCustomPresets();
  renderCustomPresets();
  checkSoundscapeUrlHash();
  bindZenMode();
  bindZenTools();
  bindBreathingGuide();
  bindFlowPrep();
  bindHerbarium();
  bindIdleSleep();
  bindP2PCheer();
  bindTasks();
  bindSprintPresets();
  bindDistraction();
  renderParkingLot();
  bindBatchTaskImporter();
  bindFocusIntention();
  bindExports();
  bindMigrationModal();
  bindQrModal();
  bindPosterModal();
  bindHeatmapControls();
  bindStatsTimeline();
  renderStats();
  bindTips();
  bindTipSignal();
  bindSettings();
  bindMobileNavigation();
  syncWeatherAtmosphere();
  bindCompanionAffinity();
  updateAffinityUI();
  applyCurrentAura();
  updateFlowMomentumUI();
  elements.avatarFallback?.addEventListener("click", () => {
    viewer?.triggerBounce();
    viewer?.onTap?.();
    const now = Date.now();
    if (now - lastAffinityInteractionTime.pet > 3000) {
      lastAffinityInteractionTime.pet = now;
      addAffinityExp(3, "撫摸夥伴");
    }
  });
  updateTimerModeUI(timer.mode, timer.cycleRound);
  timer.emitTick();
  startViewer();
  restartP2P();
  createIcons({ icons });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  window.addEventListener("beforeunload", () => {
    p2p?.destroy();
    viewer?.dispose();
    music.destroy();
    ambientSound.stopAll();
    lofiGenerator.stop();
    weatherEngine?.destroy();
    stopBreathingGuide();
    stopPrepBreathing();
  });
}

init();
