/**
 * Focus Flow Polaroid Poster Generator
 * Pure client-side HTML5 Canvas rendering for shareable milestone polaroid cards.
 * Zero external image dependencies, 2x Retina high-definition export.
 */

export const PLANT_FLOWER_LANGUAGES = {
  rose: { name: "玫瑰", emoji: "🌹", language: "熱情專注與堅持不懈" },
  tulip: { name: "鬱金香", emoji: "🌷", language: "寧靜自律與心靈沉澱" },
  cactus: { name: "仙人掌", emoji: "🌵", language: "堅韌不拔與無畏挑戰" },
  succulent: { name: "多肉植物", emoji: "🪴", language: "溫柔生長與細水長流" },
  pine: { name: "松樹", emoji: "🌲", language: "從容沈穩與永恆守候" },
};

const CATEGORY_MAP = {
  dev: { label: "開發 Dev", icon: "💻", color: "#38bdf8" },
  read: { label: "閱讀 Read", icon: "📚", color: "#34d399" },
  write: { label: "寫作 Write", icon: "✍️", color: "#fbbf24" },
  design: { label: "設計 Design", icon: "🎨", color: "#f472b6" },
  review: { label: "複習 Review", icon: "🧠", color: "#a78bfa" },
};

export const POSTER_THEMES = {
  midnight: {
    id: "midnight",
    name: "午夜木屋",
    emoji: "🌙",
    bgGradient: ["#0e1a2b", "#152438", "#0a111c"],
    aura: ["rgba(45, 212, 191, 0.12)", "rgba(255, 224, 163, 0.05)", "rgba(0, 0, 0, 0)"],
    stars: "rgba(255, 255, 255, 0.25)",
    outerBorder: "rgba(255, 224, 163, 0.35)",
    innerBorder: "rgba(45, 212, 191, 0.2)",
    brandTitle: "#ffe0a3",
    accent: "#2dd4bf",
    cardBg: "rgba(255, 255, 255, 0.035)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    plantTitle: "#ffe0a3",
    signature: "#7dd3fc",
  },
  aurora: {
    id: "aurora",
    name: "晨曦極光",
    emoji: "🌌",
    bgGradient: ["#092026", "#0c2f38", "#041418"],
    aura: ["rgba(52, 211, 153, 0.18)", "rgba(56, 189, 248, 0.08)", "rgba(0, 0, 0, 0)"],
    stars: "rgba(167, 243, 208, 0.35)",
    outerBorder: "rgba(110, 231, 183, 0.38)",
    innerBorder: "rgba(56, 189, 248, 0.25)",
    brandTitle: "#6ee7b7",
    accent: "#34d399",
    cardBg: "rgba(20, 184, 166, 0.05)",
    cardBorder: "rgba(94, 234, 212, 0.15)",
    plantTitle: "#a7f3d0",
    signature: "#67e8f9",
  },
  sunset: {
    id: "sunset",
    name: "暮光晚霞",
    emoji: "🌅",
    bgGradient: ["#2d151e", "#3a1c22", "#180a11"],
    aura: ["rgba(251, 146, 60, 0.18)", "rgba(244, 114, 182, 0.08)", "rgba(0, 0, 0, 0)"],
    stars: "rgba(254, 215, 170, 0.3)",
    outerBorder: "rgba(251, 146, 60, 0.4)",
    innerBorder: "rgba(244, 114, 182, 0.25)",
    brandTitle: "#fdba74",
    accent: "#fb923c",
    cardBg: "rgba(251, 146, 60, 0.05)",
    cardBorder: "rgba(251, 146, 60, 0.15)",
    plantTitle: "#fed7aa",
    signature: "#f472b6",
  },
  forest: {
    id: "forest",
    name: "秘境森野",
    emoji: "🌲",
    bgGradient: ["#0f241a", "#142e22", "#08150f"],
    aura: ["rgba(74, 222, 128, 0.15)", "rgba(250, 204, 21, 0.06)", "rgba(0, 0, 0, 0)"],
    stars: "rgba(187, 247, 208, 0.3)",
    outerBorder: "rgba(74, 222, 128, 0.35)",
    innerBorder: "rgba(250, 204, 21, 0.2)",
    brandTitle: "#86efac",
    accent: "#4ade80",
    cardBg: "rgba(34, 197, 94, 0.04)",
    cardBorder: "rgba(74, 222, 128, 0.12)",
    plantTitle: "#bbf7d0",
    signature: "#a3e635",
  },
  cyber: {
    id: "cyber",
    name: "霓虹夜行",
    emoji: "🔮",
    bgGradient: ["#1e1035", "#261343", "#10061e"],
    aura: ["rgba(192, 132, 252, 0.18)", "rgba(244, 114, 182, 0.08)", "rgba(0, 0, 0, 0)"],
    stars: "rgba(233, 213, 255, 0.35)",
    outerBorder: "rgba(192, 132, 252, 0.4)",
    innerBorder: "rgba(244, 114, 182, 0.25)",
    brandTitle: "#d8b4fe",
    accent: "#c084fc",
    cardBg: "rgba(168, 85, 247, 0.05)",
    cardBorder: "rgba(192, 132, 252, 0.15)",
    plantTitle: "#e9d5ff",
    signature: "#f472b6",
  },
};

export class FocusPosterGenerator {
  /**
   * Render a high-resolution 2x Retina polaroid card
   * @param {Object} options
   * @param {string} [options.date] - Date string
   * @param {number} [options.todayMinutes] - Minutes focused today
   * @param {number} [options.totalHours] - Total cumulative hours
   * @param {number} [options.streakDays] - Consecutive streak days
   * @param {string} [options.topCategory] - Primary category id
   * @param {string} [options.harvestedPlant] - Plant type id
   * @param {string} [options.nickname] - User nickname
   * @param {string} [options.quote] - Encouraging quote
   * @param {string} [options.theme] - Theme key ('midnight'|'aurora'|'sunset'|'forest'|'cyber')
   * @returns {HTMLCanvasElement}
   */
  static generate({
    date = new Date().toISOString().split("T")[0],
    todayMinutes = 0,
    totalHours = 0,
    streakDays = 1,
    topCategory = "dev",
    harvestedPlant = "rose",
    nickname = "旅人",
    quote = "每一分鐘的專注，都是給未來的禮物 ✨",
    theme = "midnight",
  } = {}) {
    const canvas = document.createElement("canvas");
    const width = 440;
    const height = 620;
    const scale = 2; // Retina 2x

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.scale(scale, scale);

    const themeConfig = POSTER_THEMES[theme] || POSTER_THEMES.midnight;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, themeConfig.bgGradient[0]);
    bgGrad.addColorStop(0.5, themeConfig.bgGradient[1]);
    bgGrad.addColorStop(1, themeConfig.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial aura in center
    const aura = ctx.createRadialGradient(width / 2, height / 2 - 40, 20, width / 2, height / 2 - 40, 240);
    aura.addColorStop(0, themeConfig.aura[0]);
    aura.addColorStop(0.6, themeConfig.aura[1]);
    aura.addColorStop(1, themeConfig.aura[2]);
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    // 2. Starry sparkles (pseudo-random deterministic pattern)
    ctx.fillStyle = themeConfig.stars;
    const stars = [
      [36, 45],
      [120, 28],
      [380, 52],
      [410, 110],
      [45, 180],
      [395, 240],
      [28, 410],
      [415, 450],
      [70, 540],
      [370, 560],
    ];
    stars.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Double framed border with rounded corners
    const pad = 16;
    ctx.strokeStyle = themeConfig.outerBorder;
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 14);

    ctx.strokeStyle = themeConfig.innerBorder;
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad + 4, pad + 4, width - (pad + 4) * 2, height - (pad + 4) * 2, 11);

    // 4. Header branding
    ctx.textAlign = "center";
    ctx.fillStyle = themeConfig.brandTitle;
    ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("✦ NEWWORLD STUDY ROOM ✦", width / 2, 46);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`心流專注里程碑 · ${date}`, width / 2, 64);

    // 5. Main Stats Card
    const cardX = 36;
    const cardY = 84;
    const cardW = width - cardX * 2;
    const cardH = 200;

    ctx.fillStyle = themeConfig.cardBg;
    this.fillRoundRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.strokeStyle = themeConfig.cardBorder;
    this.strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 12);

    // Today Focus Big Number
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 56px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText(String(todayMinutes), width / 2, cardY + 76);

    ctx.fillStyle = themeConfig.accent;
    ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("TODAY'S FOCUS MINUTES", width / 2, cardY + 102);

    // Badges Row inside card
    const cat = CATEGORY_MAP[topCategory] || CATEGORY_MAP.dev;
    const badges = [
      { text: `${cat.icon} ${cat.label}`, bg: "rgba(56, 189, 248, 0.15)", border: cat.color, color: cat.color },
      { text: `🔥 ${streakDays} 天連續`, bg: "rgba(251, 146, 60, 0.15)", border: "#fb923c", color: "#fdba74" },
      { text: `累計 ${totalHours}h`, bg: "rgba(255, 224, 163, 0.15)", border: "#ffe0a3", color: "#ffe0a3" },
    ];

    const badgeW = 104;
    const badgeH = 26;
    const gap = 12;
    const totalBadgesW = badgeW * 3 + gap * 2;
    let bx = cardX + (cardW - totalBadgesW) / 2;
    const by = cardY + 138;

    badges.forEach((b) => {
      ctx.fillStyle = b.bg;
      this.fillRoundRect(ctx, bx, by, badgeW, badgeH, 6);
      ctx.strokeStyle = b.border;
      this.strokeRoundRect(ctx, bx, by, badgeW, badgeH, 6);

      ctx.fillStyle = b.color;
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(b.text, bx + badgeW / 2, by + 17);
      bx += badgeW + gap;
    });

    // 6. Harvested Botanical Herbarium Feature
    const plantInfo = PLANT_FLOWER_LANGUAGES[harvestedPlant] || PLANT_FLOWER_LANGUAGES.rose;
    const plantY = 328;

    ctx.fillStyle = "#f8fafc";
    ctx.font = "44px sans-serif";
    ctx.fillText(plantInfo.emoji, width / 2, plantY + 36);

    ctx.fillStyle = themeConfig.plantTitle;
    ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`今日收穫：${plantInfo.name}`, width / 2, plantY + 70);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`花語：「${plantInfo.language}」`, width / 2, plantY + 92);

    // 7. Divider diamond ornament
    ctx.strokeStyle = "rgba(88, 113, 138, 0.4)";
    ctx.beginPath();
    ctx.moveTo(70, 455);
    ctx.lineTo(190, 455);
    ctx.moveTo(250, 455);
    ctx.lineTo(370, 455);
    ctx.stroke();

    ctx.fillStyle = themeConfig.accent;
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("❖", width / 2, 459);

    // 8. Companion Quote & Signature
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 13px ui-sans-serif, system-ui, sans-serif";
    const quoteStr = quote.length > 28 ? `${quote.slice(0, 26)}...` : quote;
    ctx.fillText(`「${quoteStr}」`, width / 2, 498);

    ctx.fillStyle = themeConfig.signature;
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`—— 伴讀夥伴 · ${nickname}`, width / 2, 524);

    // 9. Watermark Footer
    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("newworld-study-room · 沉浸式伴讀小木屋", width / 2, 584);

    return canvas;
  }

  /**
   * Render a high-resolution 2x Retina soundscape polaroid art card
   * @param {Object} options
   * @param {string} [options.name] - Soundscape preset name
   * @param {Object} [options.tracks] - Map of track volumes
   * @param {Object} [options.pans] - Map of track pans
   * @param {Object} [options.eq] - Master EQ { bass, mid, treble }
   * @param {Object} [options.reverb] - Master Reverb { preset, wet }
   * @param {string} [options.nickname] - Author nickname
   * @param {string} [options.theme] - Theme key ('midnight'|'aurora'|'sunset'|'forest'|'cyber')
   * @param {HTMLCanvasElement} [options.qrCanvas] - Optional pre-rendered QR code canvas
   * @returns {HTMLCanvasElement}
   */
  static generateSoundscapeCard({
    name = "自訂專注音景",
    tracks = {},
    pans = {},
    eq = null,
    reverb = null,
    nickname = "旅人",
    theme = "midnight",
    qrCanvas = null,
  } = {}) {
    const canvas = document.createElement("canvas");
    const width = 440;
    const height = 620;
    const scale = 2; // Retina 2x

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.scale(scale, scale);

    const themeConfig = POSTER_THEMES[theme] || POSTER_THEMES.midnight;

    // 1. Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, themeConfig.bgGradient[0]);
    bgGrad.addColorStop(0.5, themeConfig.bgGradient[1]);
    bgGrad.addColorStop(1, themeConfig.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Radial aura
    const aura = ctx.createRadialGradient(width / 2, height / 2 - 40, 20, width / 2, height / 2 - 40, 240);
    aura.addColorStop(0, themeConfig.aura[0]);
    aura.addColorStop(0.6, themeConfig.aura[1]);
    aura.addColorStop(1, themeConfig.aura[2]);
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    // Starry sparkles
    ctx.fillStyle = themeConfig.stars;
    const stars = [
      [36, 45],
      [120, 28],
      [380, 52],
      [410, 110],
      [45, 180],
      [395, 240],
      [28, 410],
      [415, 450],
      [70, 540],
      [370, 560],
    ];
    stars.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Double framed border
    const pad = 16;
    ctx.strokeStyle = themeConfig.outerBorder;
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 14);

    ctx.strokeStyle = themeConfig.innerBorder;
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad + 4, pad + 4, width - (pad + 4) * 2, height - (pad + 4) * 2, 11);

    // Header branding
    ctx.textAlign = "center";
    ctx.fillStyle = themeConfig.brandTitle;
    ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("✦ NEWWORLD CABIN · 聲學調音卡 ✦", width / 2, 46);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`氛圍空間調音 · ${nickname} 調配`, width / 2, 64);

    // Main Card (Title + Waveform)
    const cardX = 36;
    const cardY = 82;
    const cardW = width - cardX * 2;
    const cardH = 205;

    ctx.fillStyle = themeConfig.cardBg;
    this.fillRoundRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.strokeStyle = themeConfig.cardBorder;
    this.strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 12);

    // Preset Icon & Title
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`🎧 ${name}`, width / 2, cardY + 36);

    // Procedural Audio Waveform / Spectrum Bars
    const barCount = 24;
    const barWidth = 6;
    const barGap = 6;
    const totalBarsW = barCount * barWidth + (barCount - 1) * barGap;
    const startBarX = (width - totalBarsW) / 2;
    const baseY = cardY + 160;

    const trackKeys = Object.keys(tracks).filter((k) => Number(tracks[k]) > 0);
    const activityFactor = Math.max(0.3, Math.min(1.0, trackKeys.length * 0.25));

    for (let i = 0; i < barCount; i++) {
      const norm = i / (barCount - 1);
      const wave = Math.sin(norm * Math.PI * 2.8) * 0.4 + Math.cos(norm * Math.PI * 1.5) * 0.35 + 0.5;
      const barHeight = Math.max(12, Math.min(85, wave * 75 * activityFactor + 10));

      const bx = startBarX + i * (barWidth + barGap);
      const by = baseY - barHeight;

      const barGrad = ctx.createLinearGradient(0, by, 0, baseY);
      barGrad.addColorStop(0, themeConfig.accent);
      barGrad.addColorStop(1, themeConfig.brandTitle);
      ctx.fillStyle = barGrad;
      this.fillRoundRect(ctx, bx, by, barWidth, barHeight, 3);
    }

    // Spectrum label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("∼∼ PROCEDURAL AMBIENT HARMONICS ∼∼", width / 2, cardY + 192);

    // Middle Composition Panel: Active Tracks & Acoustics
    const infoY = 302;
    const infoH = 150;
    ctx.fillStyle = themeConfig.cardBg;
    this.fillRoundRect(ctx, cardX, infoY, cardW, infoH, 10);
    ctx.strokeStyle = themeConfig.cardBorder;
    this.strokeRoundRect(ctx, cardX, infoY, cardW, infoH, 10);

    // Track Mix Tags
    ctx.textAlign = "left";
    ctx.fillStyle = themeConfig.accent;
    ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("🎚️ 軌道配比與空間聲像：", cardX + 16, infoY + 26);

    const trackNameMap = {
      rain: "雨聲",
      wind: "微風",
      campfire: "篝火",
      keyboard: "鍵盤",
      pencil: "鉛筆",
      brown_noise: "褐噪",
      pink_noise: "粉噪",
      ocean_waves: "潮汐",
      binaural_theta: "θ波(6Hz)",
      binaural_alpha: "α波(10Hz)",
      binaural_gamma: "γ波(40Hz)",
    };

    const trackEntries = Object.entries(tracks).filter(([, v]) => Number(v) > 0);
    const displayTracks = trackEntries.slice(0, 4);
    let trackLine = displayTracks
      .map(([k, v]) => {
        const pan = pans[k];
        const panStr =
          pan && Math.abs(pan) >= 0.1
            ? pan < 0
              ? `L${Math.round(Math.abs(pan) * 100)}`
              : `R${Math.round(pan * 100)}`
            : "C";
        return `${trackNameMap[k] || k} ${Math.round(v * 100)}% [${panStr}]`;
      })
      .join(" · ");
    if (trackEntries.length > 4) trackLine += ` · +${trackEntries.length - 4}軌`;
    if (!trackLine) trackLine = "尚未啟動背景音軌";

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(trackLine, cardX + 16, infoY + 48);

    // Separator
    ctx.strokeStyle = themeConfig.cardBorder;
    ctx.beginPath();
    ctx.moveTo(cardX + 16, infoY + 66);
    ctx.lineTo(cardX + cardW - 16, infoY + 66);
    ctx.stroke();

    // Master Acoustics: EQ & Reverb
    ctx.fillStyle = themeConfig.accent;
    ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("🏛️ 母帶等化與空間殘響：", cardX + 16, infoY + 90);

    const eqBass = eq?.bass ?? 0;
    const eqMid = eq?.mid ?? 0;
    const eqTreble = eq?.treble ?? 0;
    const eqStr = `低頻 ${eqBass > 0 ? "+" : ""}${eqBass}dB · 中頻 ${eqMid > 0 ? "+" : ""}${eqMid}dB · 高頻 ${eqTreble > 0 ? "+" : ""}${eqTreble}dB`;

    const reverbPresetMap = {
      bypass: "直通 (無殘響)",
      cabin: "小木屋 🪵",
      library: "圖書館 📚",
      cathedral: "大教堂 ⛪",
      custom: "自訂空間",
    };
    const rvPreset = reverbPresetMap[reverb?.preset] || reverb?.preset || "原木木屋";
    const rvWet = Math.round((reverb?.wet ?? 0.2) * 100);
    const rvStr = `空間：${rvPreset} (濕度 ${rvWet}%)`;

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`EQ：${eqStr}`, cardX + 16, infoY + 112);
    ctx.fillText(`殘響：${rvStr}`, cardX + 16, infoY + 132);

    // Bottom Area: QR Code + Scan Instruction
    const qrY = 466;
    if (qrCanvas && typeof ctx.drawImage === "function") {
      const qrSize = 96;
      const qrX = cardX + 16;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      ctx.textAlign = "left";
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("📷 掃描直接於自習室聆聽", qrX + qrSize + 16, qrY + 36);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("支援跨裝置手機相機掃描即聽", qrX + qrSize + 16, qrY + 56);
      ctx.fillText("零伺服器保留 · 100% 離線純代碼合成", qrX + qrSize + 16, qrY + 76);
    } else {
      ctx.textAlign = "center";
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("🎧 歡迎載入此音景配方，進入深度專注心流", width / 2, qrY + 45);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("NewWorld Study Room · Cozy Cabin Acoustic", width / 2, qrY + 68);
    }

    // Signature Footer
    ctx.textAlign = "center";
    ctx.fillStyle = themeConfig.signature;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("— 願舒適聲景陪伴你的每一次沉浸 —", width / 2, 592);

    return canvas;
  }

  static strokeRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.stroke();
  }

  static fillRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.rect(x, y, width, height);
    }
    ctx.fill();
  }

  /**
   * Export canvas to PNG blob
   * @param {HTMLCanvasElement} canvas
   * @returns {Promise<Blob>}
   */
  static exportBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  /**
   * Copy image to clipboard if supported
   * @param {HTMLCanvasElement} canvas
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(canvas) {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) return false;
      const blob = await this.exportBlob(canvas);
      if (!blob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Trigger download of canvas as PNG file
   * @param {HTMLCanvasElement} canvas
   * @param {string} filename
   */
  static download(canvas, filename = `study-flow-${new Date().toISOString().split("T")[0]}.png`) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}
