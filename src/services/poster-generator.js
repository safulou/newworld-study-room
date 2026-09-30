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

    // 1. Background gradient (Midnight cabin atmosphere)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#0e1a2b");
    bgGrad.addColorStop(0.5, "#152438");
    bgGrad.addColorStop(1, "#0a111c");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial aura in center
    const aura = ctx.createRadialGradient(width / 2, height / 2 - 40, 20, width / 2, height / 2 - 40, 240);
    aura.addColorStop(0, "rgba(45, 212, 191, 0.12)");
    aura.addColorStop(0.6, "rgba(255, 224, 163, 0.05)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, width, height);

    // 2. Starry sparkles (pseudo-random deterministic pattern)
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
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
    ctx.strokeStyle = "rgba(255, 224, 163, 0.35)";
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad, pad, width - pad * 2, height - pad * 2, 14);

    ctx.strokeStyle = "rgba(45, 212, 191, 0.2)";
    ctx.lineWidth = 1;
    this.strokeRoundRect(ctx, pad + 4, pad + 4, width - (pad + 4) * 2, height - (pad + 4) * 2, 11);

    // 4. Header branding
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe0a3";
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

    ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
    this.fillRoundRect(ctx, cardX, cardY, cardW, cardH, 12);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    this.strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 12);

    // Today Focus Big Number
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 56px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx.fillText(String(todayMinutes), width / 2, cardY + 76);

    ctx.fillStyle = "#2dd4bf";
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

    ctx.fillStyle = "#ffe0a3";
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

    ctx.fillStyle = "#2dd4bf";
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("❖", width / 2, 459);

    // 8. Companion Quote & Signature
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "italic 13px ui-sans-serif, system-ui, sans-serif";
    const quoteStr = quote.length > 28 ? `${quote.slice(0, 26)}...` : quote;
    ctx.fillText(`「${quoteStr}」`, width / 2, 498);

    ctx.fillStyle = "#7dd3fc";
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(`—— 伴讀夥伴 · ${nickname}`, width / 2, 524);

    // 9. Watermark Footer
    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("newworld-study-room · 沉浸式伴讀小木屋", width / 2, 584);

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
