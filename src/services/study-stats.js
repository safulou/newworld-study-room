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
