import { describe, it, expect, beforeEach } from "vitest";
import { CompanionSoundManager } from "../src/services/companion-sound.js";

describe("CompanionSoundManager", () => {
  let manager;

  beforeEach(() => {
    manager = new CompanionSoundManager(0.5);
  });

  it("initializes with provided volume and defaults", () => {
    expect(manager.volume).toBe(0.5);
    expect(manager.muted).toBe(false);
  });

  it("clamps volume between 0 and 1", () => {
    manager.setVolume(1.8);
    expect(manager.volume).toBe(1.0);
    manager.setVolume(-0.4);
    expect(manager.volume).toBe(0.0);
  });

  it("updates muted state", () => {
    manager.setMuted(true);
    expect(manager.muted).toBe(true);
    expect(manager.ensureContext()).toBeNull();
    manager.setMuted(false);
    expect(manager.muted).toBe(false);
  });

  it("gracefully executes audio effects without errors", () => {
    expect(() => manager.playTapChime()).not.toThrow();
    expect(() => manager.playCelebrationFanfare()).not.toThrow();
    expect(() => manager.playPettingPurr()).not.toThrow();
    expect(() => manager.playReactionChime("🔥")).not.toThrow();
    expect(() => manager.playReactionChime("💡")).not.toThrow();
    expect(() => manager.playWoodenFish()).not.toThrow();
    expect(() => manager.playSingingBowl()).not.toThrow();
    expect(() => manager.playWindChime()).not.toThrow();
    expect(() => manager.playCompletionChime("fanfare")).not.toThrow();
    expect(() => manager.playCompletionChime("bowl")).not.toThrow();
    expect(() => manager.playCompletionChime("wooden_fish")).not.toThrow();
    expect(() => manager.playCompletionChime("wind_chime")).not.toThrow();
    expect(() => manager.playBreathingCue("inhale")).not.toThrow();
    expect(() => manager.playBreathingCue("hold")).not.toThrow();
    expect(() => manager.playBreathingCue("exhale")).not.toThrow();
    expect(() => manager.playBreathingCue("rest")).not.toThrow();
  });
});
