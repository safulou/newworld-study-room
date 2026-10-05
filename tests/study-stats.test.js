import { describe, it, expect, beforeEach } from "vitest";
import { StudyStatsManager, FOCUS_CATEGORIES } from "../src/services/study-stats.js";

class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
}

describe("StudyStatsManager Service", () => {
  let stats;
  let mockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    stats = new StudyStatsManager(mockStorage);
  });

  it("records study sessions accurately", () => {
    const entry = stats.recordSession({
      durationMinutes: 30,
      plantHarvested: "tulip",
      taskId: "task_123",
    });

    expect(entry.durationMinutes).toBe(30);
    expect(entry.plantHarvested).toBe("tulip");
    expect(stats.getTotalMinutes()).toBe(30);
  });

  it("calculates harvest counts correctly", () => {
    stats.recordSession({ durationMinutes: 25, plantHarvested: "rose" });
    stats.recordSession({ durationMinutes: 25, plantHarvested: "rose" });
    stats.recordSession({ durationMinutes: 25, plantHarvested: "cactus" });

    const counts = stats.getHarvestCounts();
    expect(counts["rose"]).toBe(2);
    expect(counts["cactus"]).toBe(1);
  });

  it("computes streak days for active sessions", () => {
    expect(stats.getCurrentStreakDays()).toBe(0);

    // Record session for today
    stats.recordSession({ durationMinutes: 25 });
    expect(stats.getCurrentStreakDays()).toBe(1);
  });

  it("provides executive summary", () => {
    stats.recordSession({ durationMinutes: 60, plantHarvested: "pine" });
    const summary = stats.getExecutiveSummary();

    expect(summary.totalSessions).toBe(1);
    expect(summary.totalMinutes).toBe(60);
    expect(summary.totalHours).toBe(1.0);
    expect(summary.harvestCounts["pine"]).toBe(1);
  });

  it("generates 28-day heatmap data accurately", () => {
    stats.recordSession({ durationMinutes: 45 });
    const heatmap = stats.getHeatmapData(28);
    expect(heatmap.length).toBe(28);
    const todayData = heatmap[heatmap.length - 1];
    expect(todayData.minutes).toBe(45);
    expect(todayData.level).toBe(2);
  });

  it("supports heatmap offset pagination and date range summary", () => {
    stats.recordSession({ durationMinutes: 30 });
    const currentRange = stats.getHeatmapRange(28, 0);
    expect(currentRange.totalMinutes).toBe(30);
    expect(currentRange.activeDays).toBe(1);
    expect(currentRange.startDate).toBeDefined();
    expect(currentRange.endDate).toBeDefined();

    const previousPage = stats.getHeatmapData(28, 28);
    expect(previousPage.length).toBe(28);
  });

  it("exports formatted markdown study log", () => {
    stats.recordSession({ durationMinutes: 25, plantHarvested: "rose" });
    const md = stats.exportMarkdownSummary([{ title: "撰寫代碼", completed: true, pomodoros: 1 }]);
    expect(md).toContain("NewWorld Study Room 伴讀工作日誌");
    expect(md).toContain("玫瑰 x1");
    expect(md).toContain("[x] 撰寫代碼 (🍅 1)");
  });

  it("returns botanical herbarium and badge unlocking progress", () => {
    stats.recordSession({ durationMinutes: 25, plantHarvested: "rose" });
    const herbarium = stats.getHerbarium();
    expect(herbarium.length).toBe(5);

    const rose = herbarium.find((p) => p.id === "rose");
    expect(rose.unlocked).toBe(true);
    expect(rose.harvestCount).toBe(1);

    const tulip = herbarium.find((p) => p.id === "tulip");
    expect(tulip.unlocked).toBe(false);

    const badges = stats.getBadges();
    expect(badges.length).toBe(5);
    const firstSprout = badges.find((b) => b.id === "first_sprout");
    expect(firstSprout.unlocked).toBe(true);
  });

  it("calculates 24-hour focus distribution and peak flow window", () => {
    stats.recordSession({ durationMinutes: 50 });
    const dist = stats.getHourlyDistribution();
    expect(dist.hours.length).toBe(24);
    expect(dist.totalMinutes).toBe(50);
    expect(dist.peakHour).not.toBeNull();
    expect(dist.peakMinutes).toBe(50);
  });

  it("calculates focus category breakdown analytics and percentage share", () => {
    expect(FOCUS_CATEGORIES.dev).toBeDefined();
    expect(FOCUS_CATEGORIES.read).toBeDefined();

    stats.recordSession({ durationMinutes: 50, category: "dev" });
    stats.recordSession({ durationMinutes: 25, category: "read" });
    stats.recordSession({ durationMinutes: 25, category: "dev" });

    const breakdown = stats.getCategoryBreakdown();
    expect(breakdown.totalMinutes).toBe(100);
    expect(breakdown.topCategory.id).toBe("dev");

    const devCat = breakdown.categories.find((c) => c.id === "dev");
    expect(devCat.minutes).toBe(75);
    expect(devCat.percent).toBe(75);

    const readCat = breakdown.categories.find((c) => c.id === "read");
    expect(readCat.minutes).toBe(25);
    expect(readCat.percent).toBe(25);

    const md = stats.exportMarkdownSummary();
    expect(md).toContain("專注類別分佈");
    expect(md).toContain("開發: 75分 (75%)");
  });

  it("retrieves and deletes today's focus session timeline items", () => {
    const s1 = stats.recordSession({ durationMinutes: 25, category: "dev", plantHarvested: "rose" });
    const s2 = stats.recordSession({ durationMinutes: 50, category: "write", plantHarvested: "tulip" });

    const todaySessions = stats.getTodaySessions();
    expect(todaySessions.length).toBe(2);
    expect(todaySessions[0].id).toBe(s2.id); // Newest first

    const deleted = stats.deleteSession(s1.id);
    expect(deleted.id).toBe(s1.id);
    expect(stats.getTodaySessions().length).toBe(1);
    expect(stats.getTotalMinutes()).toBe(50);

    expect(stats.deleteSession("non_existent_id")).toBeNull();
  });

  it("records and updates post-session flow rating and note reflection", () => {
    const s = stats.recordSession({
      durationMinutes: 25,
      category: "dev",
      rating: "steady",
      note: "完成演算法重構",
    });

    expect(s.rating).toBe("steady");
    expect(s.note).toBe("完成演算法重構");

    const updated = stats.updateSession(s.id, { rating: "flow", note: "突破核心難題！" });
    expect(updated).not.toBeNull();
    expect(updated.rating).toBe("flow");
    expect(updated.note).toBe("突破核心難題！");

    // Invalid rating falls back to flow
    stats.updateSession(s.id, { rating: "invalid_rating" });
    expect(stats.history.find((h) => h.id === s.id).rating).toBe("flow");

    expect(stats.updateSession("non_existent", { rating: "steady" })).toBeNull();
  });
});
