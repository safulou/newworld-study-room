/**
 * Study Statistics & Focus Streaks Analytics Service
 */

const STATS_KEY = "newworld_study_stats_v1";

export class StudyStatsManager {
  constructor(storage = typeof localStorage !== "undefined" ? localStorage : null) {
    this.storage = storage;
    this.history = this.loadHistory();
  }

  loadHistory() {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(STATS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveHistory() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STATS_KEY, JSON.stringify(this.history));
    } catch {}
  }

  recordSession({
    durationMinutes = 25,
    plantHarvested = "rose",
    taskId = null,
    category = "dev",
    rating = "flow",
    note = "",
  }) {
    const validCategory = FOCUS_CATEGORIES[category] ? category : "dev";
    const validRatings = ["flow", "steady", "warmup"];
    const entry = {
      id: "session_" + Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      durationMinutes,
      plantHarvested,
      taskId,
      category: validCategory,
      rating: validRatings.includes(rating) ? rating : "flow",
      note: String(note || "").slice(0, 100),
    };
    this.history.push(entry);
    this.saveHistory();
    return entry;
  }

  updateSession(sessionId, updates = {}) {
    const entry = this.history.find((h) => h.id === sessionId);
    if (!entry) return null;
    if (updates.rating !== undefined) {
      const validRatings = ["flow", "steady", "warmup"];
      entry.rating = validRatings.includes(updates.rating) ? updates.rating : "flow";
    }
    if (updates.note !== undefined) {
      entry.note = String(updates.note || "").slice(0, 100);
    }
    this.saveHistory();
    return entry;
  }

  getTodaySessions(todayDate = new Date().toISOString().split("T")[0]) {
    return this.history
      .filter((h) => h.date === todayDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getFilteredSessions({ range = "today", category = "all", rating = "all", now = Date.now() } = {}) {
    const nowDate = new Date(now);
    const todayStr = nowDate.toISOString().split("T")[0];
    const sevenDaysAgo = now - 7 * 86400000;
    const thirtyDaysAgo = now - 30 * 86400000;

    const matched = this.history.filter((item) => {
      // 1. Time range filter
      if (range === "today") {
        if (item.date !== todayStr) return false;
      } else if (range === "week") {
        const itemTime = new Date(item.timestamp || item.date).getTime();
        if (itemTime < sevenDaysAgo) return false;
      } else if (range === "month") {
        const itemTime = new Date(item.timestamp || item.date).getTime();
        if (itemTime < thirtyDaysAgo) return false;
      }

      // 2. Category filter
      if (category && category !== "all") {
        if (item.category !== category) return false;
      }

      // 3. Rating filter
      if (rating && rating !== "all") {
        if (item.rating !== rating) return false;
      }

      return true;
    });

    matched.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalMinutes = matched.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const flowCount = matched.filter((h) => h.rating === "flow").length;
    const steadyCount = matched.filter((h) => h.rating === "steady").length;
    const warmupCount = matched.filter((h) => h.rating === "warmup").length;
    const flowRate = matched.length > 0 ? Math.round((flowCount / matched.length) * 100) : 0;

    let rangeLabel = "今日專注";
    if (range === "week") rangeLabel = "近 7 天";
    else if (range === "month") rangeLabel = "近 30 天";
    else if (range === "all") rangeLabel = "全部歷史";

    return {
      sessions: matched,
      totalCount: matched.length,
      totalMinutes,
      flowCount,
      steadyCount,
      warmupCount,
      flowRate,
      range,
      category,
      rating,
      rangeLabel,
    };
  }

  deleteSession(sessionId) {
    const index = this.history.findIndex((h) => h.id === sessionId);
    if (index === -1) return null;
    const [removed] = this.history.splice(index, 1);
    this.saveHistory();
    return removed;
  }

  getTotalMinutes() {
    return this.history.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
  }

  getCurrentStreakDays() {
    if (this.history.length === 0) return 0;

    const uniqueDates = Array.from(new Set(this.history.map((h) => h.date)))
      .sort()
      .reverse();
    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // If no session today or yesterday, streak is broken
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currentCheck = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.round((currentCheck - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentCheck = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }

  getWeeklyMinutes() {
    const oneWeekAgo = Date.now() - 7 * 86400000;
    return this.history
      .filter((h) => new Date(h.timestamp).getTime() >= oneWeekAgo)
      .reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
  }

  getWeeklyTrend(referenceDate = new Date()) {
    const refTime = referenceDate instanceof Date ? referenceDate.getTime() : new Date(referenceDate).getTime();
    const oneDayMs = 86400000;
    const sevenDaysMs = 7 * oneDayMs;
    const currentWeekStart = refTime - sevenDaysMs;
    const previousWeekStart = refTime - 14 * oneDayMs;

    const currentSessions = this.history.filter((h) => {
      const t = new Date(h.timestamp).getTime();
      return t >= currentWeekStart && t <= refTime;
    });

    const previousSessions = this.history.filter((h) => {
      const t = new Date(h.timestamp).getTime();
      return t >= previousWeekStart && t < currentWeekStart;
    });

    const currentMinutes = currentSessions.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);
    const previousMinutes = previousSessions.reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

    let diffPercent = 0;
    if (previousMinutes > 0) {
      diffPercent = Math.round(((currentMinutes - previousMinutes) / previousMinutes) * 100);
    } else if (currentMinutes > 0) {
      diffPercent = 100;
    }

    const dayNames = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
    const dayMinutesMap = {};
    currentSessions.forEach((h) => {
      const dayIdx = new Date(h.timestamp).getDay();
      dayMinutesMap[dayIdx] = (dayMinutesMap[dayIdx] || 0) + (h.durationMinutes || 0);
    });

    let bestDayIdx = -1;
    let peakMinutes = 0;
    for (const [dayIdx, mins] of Object.entries(dayMinutesMap)) {
      if (mins > peakMinutes) {
        peakMinutes = mins;
        bestDayIdx = Number(dayIdx);
      }
    }

    const mostProductiveDay = bestDayIdx !== -1 ? dayNames[bestDayIdx] : "無";
    const flowCount = currentSessions.filter((h) => h.rating === "flow").length;
    const flowRate = currentSessions.length > 0 ? Math.round((flowCount / currentSessions.length) * 100) : 0;

    return {
      currentMinutes,
      currentHours: Math.round((currentMinutes / 60) * 10) / 10,
      previousMinutes,
      diffPercent,
      mostProductiveDay,
      peakDayMinutes: peakMinutes,
      flowRate,
      totalSessions: currentSessions.length,
    };
  }

  getHarvestCounts() {
    const counts = {};
    for (const item of this.history) {
      if (item.plantHarvested) {
        counts[item.plantHarvested] = (counts[item.plantHarvested] || 0) + 1;
      }
    }
    return counts;
  }

  getHeatmapData(daysOrOptions = 28, offsetDays = 0) {
    let days;
    let offset;
    if (typeof daysOrOptions === "object" && daysOrOptions !== null) {
      days = Number(daysOrOptions.days) || 28;
      offset = Number(daysOrOptions.offsetDays) || 0;
    } else {
      days = Number(daysOrOptions) || 28;
      offset = Number(offsetDays) || 0;
    }
    days = Math.max(7, Math.min(120, days));
    offset = Math.max(0, offset);

    const baseTime = Date.now() - offset * 86400000;
    const baseDate = new Date(baseTime);
    const result = [];
    const dateMinutesMap = new Map();

    for (const entry of this.history) {
      if (entry.date) {
        dateMinutesMap.set(entry.date, (dateMinutesMap.get(entry.date) || 0) + (entry.durationMinutes || 0));
      }
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(baseDate.getTime() - i * 86400000);
      const dateStr = d.toISOString().split("T")[0];
      const minutes = dateMinutesMap.get(dateStr) || 0;
      let level = 0;
      if (minutes > 0 && minutes <= 25) level = 1;
      else if (minutes > 25 && minutes <= 60) level = 2;
      else if (minutes > 60 && minutes <= 120) level = 3;
      else if (minutes > 120) level = 4;

      result.push({ date: dateStr, minutes, level });
    }
    return result;
  }

  getHeatmapRange(daysOrOptions = 28, offsetDays = 0) {
    const data = this.getHeatmapData(daysOrOptions, offsetDays);
    if (!data.length) {
      return { startDate: "", endDate: "", totalMinutes: 0, activeDays: 0 };
    }
    const startDate = data[0].date;
    const endDate = data[data.length - 1].date;
    const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
    const activeDays = data.filter((d) => d.minutes > 0).length;
    return { startDate, endDate, totalMinutes, activeDays };
  }

  getHourlyDistribution() {
    const hours = new Array(24).fill(0);
    for (const entry of this.history) {
      if (entry.timestamp) {
        const d = new Date(entry.timestamp);
        const h = d.getHours();
        if (h >= 0 && h < 24) {
          hours[h] += entry.durationMinutes || 0;
        }
      }
    }

    let maxVal = 0;
    let peakHour = null;
    hours.forEach((mins, h) => {
      if (mins > maxVal) {
        maxVal = mins;
        peakHour = h;
      }
    });

    const totalMinutes = hours.reduce((a, b) => a + b, 0);

    return {
      hours,
      peakHour,
      peakMinutes: maxVal,
      totalMinutes,
    };
  }

  getCategoryBreakdown() {
    const categoryMinutes = {};
    for (const key of Object.keys(FOCUS_CATEGORIES)) {
      categoryMinutes[key] = 0;
    }

    for (const entry of this.history) {
      const cat = entry.category && FOCUS_CATEGORIES[entry.category] ? entry.category : "dev";
      categoryMinutes[cat] = (categoryMinutes[cat] || 0) + (entry.durationMinutes || 0);
    }

    const totalMinutes = Object.values(categoryMinutes).reduce((sum, m) => sum + m, 0);

    const categories = Object.entries(FOCUS_CATEGORIES).map(([id, meta]) => {
      const minutes = categoryMinutes[id] || 0;
      const percent = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
      return {
        id,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        minutes,
        percent,
      };
    });

    let topCategory = null;
    let maxMinutes = -1;
    for (const cat of categories) {
      if (cat.minutes > maxMinutes && cat.minutes > 0) {
        maxMinutes = cat.minutes;
        topCategory = cat;
      }
    }

    return {
      categories,
      totalMinutes,
      topCategory,
    };
  }

  exportMarkdownSummary(tasks = []) {
    const summary = this.getExecutiveSummary();
    const today = new Date().toISOString().split("T")[0];
    const todayMinutes = this.history
      .filter((h) => h.date === today)
      .reduce((sum, h) => sum + (h.durationMinutes || 0), 0);

    let md = `# NewWorld Study Room 伴讀工作日誌 (${today})\n\n`;
    md += `- 🔥 連續專注天數：${summary.streakDays} 天\n`;
    md += `- ⏱️ 今日專注時間：${todayMinutes} 分鐘\n`;
    md += `- 📚 累計專注時數：${summary.totalHours} 小時 (${summary.totalSessions} 輪番茄鐘)\n`;
    const plantNames = { rose: "玫瑰", tulip: "鬱金香", cactus: "仙人掌", succulent: "多肉植物", pine: "松樹" };
    const harvestStr = Object.entries(summary.harvestCounts)
      .map(([k, v]) => `${plantNames[k] || k} x${v}`)
      .join("、 ");
    md += `- 🌱 收穫植物成果：${harvestStr || "尚未收穫"}\n`;

    const breakdown = this.getCategoryBreakdown();
    if (breakdown.totalMinutes > 0) {
      const catStr = breakdown.categories
        .filter((c) => c.minutes > 0)
        .map((c) => `${c.icon} ${c.label}: ${c.minutes}分 (${c.percent}%)`)
        .join("、 ");
      if (catStr) {
        md += `- 🏷️ 專注類別分佈：${catStr}\n`;
      }
    }
    md += `\n`;

    if (tasks && tasks.length) {
      md += `### 📋 今日任務執行清單\n\n`;
      tasks.forEach((t) => {
        const check = t.completed ? "[x]" : "[ ]";
        const pomo = t.pomodoros ? ` (🍅 ${t.pomodoros})` : "";
        md += `- ${check} ${t.title}${pomo}\n`;
      });
    }
    return md;
  }

  exportExecutiveMarkdownReport(nickname = "自習旅人", tasks = [], filterOptions = null) {
    const summary = this.getExecutiveSummary();
    const trend = this.getWeeklyTrend();
    const breakdown = this.getCategoryBreakdown();
    const hasFilter = Boolean(filterOptions && (filterOptions.range || filterOptions.category || filterOptions.rating));
    const filteredResult = hasFilter ? this.getFilteredSessions(filterOptions) : null;
    const plantNames = {
      rose: "玫瑰",
      tulip: "鬱金香",
      cactus: "仙人掌",
      succulent: "多肉植物",
      pine: "松樹",
      sunflower: "向日葵",
      lavender: "薰衣草",
    };

    const scopeTitle =
      filteredResult && filteredResult.rangeLabel
        ? ` · 心流復盤報告（${filteredResult.rangeLabel}）`
        : " · 心流復盤週報";
    let md = `# 🌿 NewWorld Study Room${scopeTitle}\n`;
    md += `> 產生時間：${new Date().toLocaleString("zh-TW", { hour12: false })}\n`;
    md += `> 旅人暱稱：${nickname || "自習旅人"}\n\n`;
    md += `---\n\n`;

    md += `## 📊 核心心流與專注成效\n`;
    md += `- 🔥 連續專注天數：**${summary.streakDays} 天**\n`;
    md += `- ⏱️ 本週累積時數：**${trend.currentHours} 小時** (${trend.currentMinutes} 分鐘)\n`;
    const diffSign = trend.diffPercent >= 0 ? `+${trend.diffPercent}%` : `${trend.diffPercent}%`;
    md += `- 📈 週度時數成長：**${diffSign}** (上週 ${Math.round(trend.previousMinutes / 60)} 小時)\n`;
    md += `- ⚡ 最佳效率巔峰：**${trend.mostProductiveDay}** (${trend.peakDayMinutes} 分鐘)\n`;
    md += `- 🌊 深度心流比例：**${trend.flowRate}%** (本週 ${trend.totalSessions} 輪專注)\n`;
    md += `- 🏆 累計歷史總量：**${summary.totalHours} 小時** (${summary.totalSessions} 次完成)\n\n`;

    md += `## 📈 領域時間分配\n`;
    if (breakdown.totalMinutes > 0) {
      breakdown.categories.forEach((c) => {
        md += `- ${c.icon} **${c.label}**：${c.minutes} 分鐘 (${c.percent}%)\n`;
      });
    } else {
      md += `*尚無領域標籤記錄*\n`;
    }
    md += `\n`;

    md += `## 🌱 植栽花語收穫庫\n`;
    const harvestEntries = Object.entries(summary.harvestCounts);
    if (harvestEntries.length > 0) {
      const harvestStr = harvestEntries.map(([k, v]) => `${plantNames[k] || k} x${v}`).join("、 ");
      md += `- 收穫總計：${harvestStr}\n\n`;
    } else {
      md += `*尚無收穫植物記錄*\n\n`;
    }

    if (tasks && tasks.length > 0) {
      md += `## 📋 近期任務清單完成狀態\n`;
      tasks.forEach((t) => {
        const check = t.completed ? "[x]" : "[ ]";
        const pomo = t.pomodoros ? ` (🍅 ${t.pomodoros})` : "";
        md += `- ${check} ${t.title}${pomo}\n`;
      });
      md += `\n`;
    }

    const reportSessions = filteredResult ? filteredResult.sessions : this.getTodaySessions();
    if (reportSessions && reportSessions.length > 0) {
      const ratingBadges = {
        flow: "🔥 深度心流",
        steady: "✨ 穩定推進",
        warmup: "🌱 漸入佳境",
      };
      const sectionLabel =
        filteredResult && filteredResult.rangeLabel
          ? `📝 專注時序與心流筆記（${filteredResult.rangeLabel}）`
          : "📝 今日專注時序與心流筆記";
      md += `## ${sectionLabel}\n`;
      reportSessions.forEach((s) => {
        const timeStr = s.timestamp ? new Date(s.timestamp).toTimeString().slice(0, 5) : "--:--";
        const rat = ratingBadges[s.rating] || ratingBadges.flow;
        const noteStr = s.note ? ` · 筆記：「${s.note}」` : "";
        const catInfo = FOCUS_CATEGORIES[s.category] || { label: s.category || "開發", icon: "💻" };
        md += `- [${timeStr}] ${s.durationMinutes}m · ${catInfo.icon} ${catInfo.label} [${rat}]${noteStr}\n`;
      });
      md += `\n`;
    }

    return md;
  }

  exportJsonBackup(tasks = []) {
    return JSON.stringify(
      {
        version: "v3",
        exportedAt: new Date().toISOString(),
        history: this.history,
        tasks,
      },
      null,
      2,
    );
  }

  getExecutiveSummary() {
    return {
      totalSessions: this.history.length,
      totalMinutes: this.getTotalMinutes(),
      totalHours: Math.round((this.getTotalMinutes() / 60) * 10) / 10,
      streakDays: this.getCurrentStreakDays(),
      weeklyMinutes: this.getWeeklyMinutes(),
      harvestCounts: this.getHarvestCounts(),
    };
  }

  getHerbarium() {
    const counts = this.getHarvestCounts();
    return Object.entries(PLANT_BOTANICAL_SPECIES).map(([key, meta]) => {
      const count = counts[key] || 0;
      const historyItem = this.history.find((h) => h.plantHarvested === key);
      const firstDate = historyItem ? historyItem.date : null;
      return {
        ...meta,
        unlocked: count > 0,
        harvestCount: count,
        firstUnlockedDate: firstDate,
      };
    });
  }

  getBadges() {
    const totalHarvest = Object.values(this.getHarvestCounts()).reduce((a, b) => a + b, 0);
    const streak = this.getCurrentStreakDays();
    const uniquePlants = Object.keys(this.getHarvestCounts()).length;
    const totalMinutes = this.getTotalMinutes();

    return [
      {
        id: "first_sprout",
        title: "萌芽初綻",
        icon: "🌱",
        description: "完成第一次專注並收穫第 1 株植物",
        unlocked: totalHarvest >= 1,
      },
      {
        id: "botanist",
        title: "木屋植物學家",
        icon: "🌸",
        description: "培育收穫全部 5 種不同的專注植物",
        unlocked: uniquePlants >= 5,
      },
      {
        id: "streak_master",
        title: "連貫心流",
        icon: "🔥",
        description: "保持連續 3 天專注陪伴",
        unlocked: streak >= 3,
      },
      {
        id: "golden_gardener",
        title: "黃金七天紀律",
        icon: "👑",
        description: "達成連續 7 天專注，解鎖黃金花盆榮耀",
        unlocked: streak >= 7,
      },
      {
        id: "master_hour",
        title: "百刻求索",
        icon: "⏳",
        description: "累計專注時間突破 10 小時（600 分鐘）",
        unlocked: totalMinutes >= 600,
      },
    ];
  }

  getFlowMomentum(todaySessions = null) {
    const sessions = todaySessions || this.getTodaySessions();
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const sessionCount = sessions.length;
    const flowCount = sessions.filter((s) => s.rating === "flow").length;
    const flowRate = sessionCount > 0 ? Math.round((flowCount / sessionCount) * 100) : 0;

    // Base minutes points (0 ~ 50 points: 100 mins reach max base)
    const basePoints = Math.min(50, totalMinutes * 0.5);
    // Consistency count points (0 ~ 25 points: 4 sessions reach max)
    const countPoints = Math.min(25, sessionCount * 6.5);
    // Flow depth points (0 ~ 25 points based on % of flow sessions)
    const depthPoints = Math.round(flowRate * 0.25);

    const score = Math.min(100, Math.round(basePoints + countPoints + depthPoints));

    let tier = "dormant";
    let levelName = "蓄勢待發";
    let icon = "☕";
    let quote = "準備就緒，隨時開啟今日心流之旅。";
    let recommendedBreak = 5;

    if (score >= 80) {
      tier = "hyper_focus";
      levelName = "深度超頻";
      icon = "🌊";
      quote = "心流狀態極致充沛，靈感泉湧不止！";
      recommendedBreak = 15;
    } else if (score >= 55) {
      tier = "peak_flow";
      levelName = "巔峰心流";
      icon = "🔥";
      quote = "專注勢能旺盛，眼前挑戰迎刃而解！";
      recommendedBreak = 10;
    } else if (score >= 30) {
      tier = "steady_flow";
      levelName = "穩步爬升";
      icon = "⚡";
      quote = "專注節奏正佳，保持當前勢頭推進。";
      recommendedBreak = 5;
    } else if (score >= 10) {
      tier = "warming_up";
      levelName = "初入狀態";
      icon = "🌱";
      quote = "熱身完畢，大腦引擎漸入佳境。";
      recommendedBreak = 5;
    }

    return {
      score,
      tier,
      levelName,
      icon,
      quote,
      recommendedBreak,
      totalMinutes,
      sessionCount,
      flowRate,
    };
  }

  getSmartBreakRecommendation(lastSession = null, todaySessions = null) {
    const momentum = this.getFlowMomentum(todaySessions);
    const duration = lastSession?.durationMinutes || 25;
    const rating = lastSession?.rating || "flow";

    let recommendedMinutes;
    let reason;

    if (momentum.totalMinutes >= 180) {
      recommendedMinutes = 15;
      reason = "今日專注已超過 3 小時，強烈建議站立活動伸展放鬆 🚶";
    } else if (duration >= 45 || rating === "flow") {
      recommendedMinutes = 10;
      reason = "深度心流後大腦耗能較高，建議 10 分鐘護眼放鬆 💧";
    } else if (duration <= 15 || rating === "warmup") {
      recommendedMinutes = 3;
      reason = "短衝刺熱身，建議 3 分鐘敏捷換氣維持專注動力 ⚡";
    } else {
      recommendedMinutes = 5;
      reason = "標準番茄節奏，補充水分準備迎接下一輪 🍵";
    }

    return {
      recommendedMinutes,
      reason,
      momentumScore: momentum.score,
      momentumTier: momentum.tier,
    };
  }
}

export const PLANT_BOTANICAL_SPECIES = {
  rose: {
    id: "rose",
    name: "緋紅玫瑰",
    icon: "🌹",
    flowerLanguage: "熱情、堅持不懈與自我超越",
    rarity: "common",
  },
  tulip: {
    id: "tulip",
    name: "明黃鬱金香",
    icon: "🌷",
    flowerLanguage: "博學、沈靜心靈與永恆專注",
    rarity: "common",
  },
  cactus: {
    id: "cactus",
    name: "翡翠仙人掌",
    icon: "🌵",
    flowerLanguage: "堅毅頑強、抵禦外界干擾",
    rarity: "uncommon",
  },
  succulent: {
    id: "succulent",
    name: "碧玉多肉",
    icon: "🪴",
    flowerLanguage: "踏實累積、生生不息的微小進步",
    rarity: "uncommon",
  },
  pine: {
    id: "pine",
    name: "雪嶺冷杉",
    icon: "🌲",
    flowerLanguage: "歲月深沈、經久不衰的自律品格",
    rarity: "rare",
  },
};

export const FOCUS_CATEGORIES = {
  dev: {
    id: "dev",
    label: "開發",
    icon: "💻",
    color: "#38bdf8",
  },
  read: {
    id: "read",
    label: "閱讀",
    icon: "📚",
    color: "#4ade80",
  },
  write: {
    id: "write",
    label: "寫作",
    icon: "✍️",
    color: "#fbbf24",
  },
  design: {
    id: "design",
    label: "設計",
    icon: "🎨",
    color: "#f472b6",
  },
  review: {
    id: "review",
    label: "複習",
    icon: "🧠",
    color: "#a78bfa",
  },
};
