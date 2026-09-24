import { describe, it, expect, beforeEach, vi } from "vitest";
import { FocusTimer } from "../src/services/focus-timer.js";

describe("FocusTimer Service", () => {
  let timer;

  beforeEach(() => {
    vi.useFakeTimers();
    timer = new FocusTimer(25);
  });

  it("initializes with default focus mode and 25 minutes", () => {
    expect(timer.mode).toBe("focus");
    expect(timer.focusMinutes).toBe(25);
    expect(timer.minutes).toBe(25);
    expect(timer.remaining).toBe(25 * 60);
    expect(timer.cycleRound).toBe(1);
    expect(timer.completedRounds).toBe(0);
  });

  it("switches modes correctly (shortBreak and longBreak)", () => {
    timer.setMode("shortBreak");
    expect(timer.mode).toBe("shortBreak");
    expect(timer.minutes).toBe(5);
    expect(timer.remaining).toBe(5 * 60);

    timer.setMode("longBreak");
    expect(timer.mode).toBe("longBreak");
    expect(timer.minutes).toBe(15);
    expect(timer.remaining).toBe(15 * 60);

    timer.setMode("focus");
    expect(timer.mode).toBe("focus");
    expect(timer.minutes).toBe(25);
  });

  it("advances modes according to 4-cycle pomodoro rule", () => {
    // Round 1 focus -> shortBreak
    expect(timer.advanceMode()).toBe("shortBreak");
    expect(timer.completedRounds).toBe(1);

    // ShortBreak -> Round 2 focus
    expect(timer.advanceMode()).toBe("focus");
    expect(timer.cycleRound).toBe(2);

    // Round 2 focus -> shortBreak
    expect(timer.advanceMode()).toBe("shortBreak");
    expect(timer.completedRounds).toBe(2);

    // ShortBreak -> Round 3 focus
    expect(timer.advanceMode()).toBe("focus");
    expect(timer.cycleRound).toBe(3);

    // Round 3 focus -> shortBreak
    expect(timer.advanceMode()).toBe("shortBreak");
    expect(timer.completedRounds).toBe(3);

    // ShortBreak -> Round 4 focus
    expect(timer.advanceMode()).toBe("focus");
    expect(timer.cycleRound).toBe(4);

    // Round 4 focus -> longBreak (4th round triggers long break!)
    expect(timer.advanceMode()).toBe("longBreak");
    expect(timer.completedRounds).toBe(4);

    // LongBreak -> Round 1 focus (new cycle begins)
    expect(timer.advanceMode()).toBe("focus");
    expect(timer.cycleRound).toBe(1);
  });

  it("supports configurable break durations", () => {
    timer.setBreakDurations({ shortBreak: 7, longBreak: 20 });
    timer.setMode("shortBreak");
    expect(timer.minutes).toBe(7);

    timer.setMode("longBreak");
    expect(timer.minutes).toBe(20);
  });

  it("emits mode-change and tick events", () => {
    let modeChangeDetail = null;
    timer.addEventListener("mode-change", (e) => {
      modeChangeDetail = e.detail;
    });

    timer.setMode("shortBreak");
    expect(modeChangeDetail).toBeDefined();
    expect(modeChangeDetail.mode).toBe("shortBreak");
    expect(modeChangeDetail.minutes).toBe(5);

    let tickedRemaining = null;
    timer.addEventListener("tick", (e) => {
      tickedRemaining = e.detail;
    });
    timer.emitTick();
    expect(tickedRemaining).toBe(5 * 60);
  });
});
