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

  recordSession({ durationMinutes = 25, plantHarvested = "rose", taskId = null }) {
    const entry = {
      id: "session_" + Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      durationMinutes,
      plantHarvested,
      taskId,
    };
    this.history.push(entry);
    this.saveHistory();
    return entry;
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

  getHarvestCounts() {
    const counts = {};
    for (const item of this.history) {
      if (item.plantHarvested) {
        counts[item.plantHarvested] = (counts[item.plantHarvested] || 0) + 1;
      }
    }
    return counts;
  }

  getHeatmapData(days = 28) {
    const today = new Date();
    const result = [];
    const dateMinutesMap = new Map();

    for (const entry of this.history) {
      if (entry.date) {
        dateMinutesMap.set(entry.date, (dateMinutesMap.get(entry.date) || 0) + (entry.durationMinutes || 0));
      }
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
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
    md += `- 🌱 收穫植物成果：${harvestStr || "尚未收穫"}\n\n`;

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
