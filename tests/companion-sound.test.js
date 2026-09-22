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

  it("gracefully executes playTapChime and playCelebrationFanfare without errors", () => {
    expect(() => manager.playTapChime()).not.toThrow();
    expect(() => manager.playCelebrationFanfare()).not.toThrow();
  });
});
