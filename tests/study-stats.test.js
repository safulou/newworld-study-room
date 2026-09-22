import { describe, it, expect, beforeEach } from "vitest";
import { StudyStatsManager } from "../src/services/study-stats.js";

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
});
