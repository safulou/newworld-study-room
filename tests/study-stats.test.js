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

  it("calculates weekly trend analytics and compares against previous week", () => {
    const now = new Date("2026-10-05T12:00:00Z");
    stats.history = [
      {
        id: "s1",
        timestamp: "2026-10-05T10:00:00Z",
        date: "2026-10-05",
        durationMinutes: 50,
        category: "dev",
        rating: "flow",
        plantHarvested: "rose",
      },
      {
        id: "s2",
        timestamp: "2026-10-04T10:00:00Z",
        date: "2026-10-04",
        durationMinutes: 25,
        category: "read",
        rating: "steady",
        plantHarvested: "tulip",
      },
      {
        id: "s3",
        timestamp: "2026-09-26T10:00:00Z",
        date: "2026-09-26",
        durationMinutes: 50,
        category: "dev",
        rating: "warmup",
        plantHarvested: "cactus",
      },
    ];

    const trend = stats.getWeeklyTrend(now);
    expect(trend.currentMinutes).toBe(75);
    expect(trend.previousMinutes).toBe(50);
    expect(trend.diffPercent).toBe(50);
    expect(trend.totalSessions).toBe(2);
    expect(trend.flowRate).toBe(50);
    expect(trend.mostProductiveDay).toBe("週一");
    expect(trend.peakDayMinutes).toBe(50);
  });

  it("exports comprehensive executive markdown weekly review report", () => {
    stats.history = [
      {
        id: "s1",
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        durationMinutes: 50,
        category: "dev",
        rating: "flow",
        plantHarvested: "rose",
        note: "重構核心服務架構",
      },
    ];

    const tasks = [{ id: "t1", title: "優化雙耳節律", completed: true, pomodoros: 2 }];
    const report = stats.exportExecutiveMarkdownReport("Arsen", tasks);

    expect(report).toContain("心流復盤週報");
    expect(report).toContain("旅人暱稱：Arsen");
    expect(report).toContain("核心心流與專注成效");
    expect(report).toContain("領域時間分配");
    expect(report).toContain("植栽花語收穫庫");
    expect(report).toContain("近期任務清單完成狀態");
    expect(report).toContain("優化雙耳節律 (🍅 2)");
    expect(report).toContain("今日專注時序與心流筆記");
    expect(report).toContain("🔥 深度心流");
    expect(report).toContain("重構核心服務架構");
  });

  it("filters sessions by date range, category, and rating and generates scoped reports", () => {
    const now = new Date("2026-10-06T12:00:00Z").getTime();
    stats.history = [
      {
        id: "s1",
        timestamp: "2026-10-06T09:00:00Z",
        date: "2026-10-06",
        durationMinutes: 25,
        category: "dev",
        rating: "flow",
      },
      {
        id: "s2",
        timestamp: "2026-10-05T14:00:00Z",
        date: "2026-10-05",
        durationMinutes: 50,
        category: "read",
        rating: "steady",
      },
      {
        id: "s3",
        timestamp: "2026-09-20T10:00:00Z",
        date: "2026-09-20",
        durationMinutes: 30,
        category: "dev",
        rating: "warmup",
      },
    ];

    // Filter today
    const todayResult = stats.getFilteredSessions({ range: "today", now });
    expect(todayResult.totalCount).toBe(1);
    expect(todayResult.totalMinutes).toBe(25);
    expect(todayResult.flowCount).toBe(1);

    // Filter week
    const weekResult = stats.getFilteredSessions({ range: "week", now });
    expect(weekResult.totalCount).toBe(2);
    expect(weekResult.totalMinutes).toBe(75);

    // Filter by category
    const devResult = stats.getFilteredSessions({ range: "all", category: "dev", now });
    expect(devResult.totalCount).toBe(2);
    expect(devResult.totalMinutes).toBe(55);

    // Filter by rating
    const flowResult = stats.getFilteredSessions({ range: "all", rating: "flow", now });
    expect(flowResult.totalCount).toBe(1);

    // Scoped Markdown Report
    const weekReport = stats.exportExecutiveMarkdownReport("Lina", [], { range: "week", now });
    expect(weekReport).toContain("心流復盤報告（近 7 天）");
  });
});
