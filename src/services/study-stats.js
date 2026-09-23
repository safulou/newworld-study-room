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
}
