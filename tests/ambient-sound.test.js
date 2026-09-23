import { describe, it, expect } from "vitest";
import { AmbientSoundscapeManager, AMBIENT_SOUND_TYPES, SOUNDSCAPE_PRESETS } from "../src/services/ambient-sound.js";

describe("AmbientSoundscapeManager", () => {
  it("exposes valid ambient sound types including binaural beats", () => {
    expect(AMBIENT_SOUND_TYPES).toContain("rain");
    expect(AMBIENT_SOUND_TYPES).toContain("wind");
    expect(AMBIENT_SOUND_TYPES).toContain("campfire");
    expect(AMBIENT_SOUND_TYPES).toContain("brown_noise");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_alpha");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_gamma");
  });

  it("exposes soundscape presets", () => {
    expect(SOUNDSCAPE_PRESETS.cozy_fireplace).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.forest_breeze).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.deep_flow).toBeDefined();
  });

  it("initializes with default settings", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isMuted).toBe(false);
    expect(manager.masterVolume).toBe(0.5);
    expect(manager.getActiveTracks().length).toBe(0);
  });

  it("toggles mute correctly", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.toggleMute()).toBe(true);
    expect(manager.isMuted).toBe(true);
    expect(manager.toggleMute()).toBe(false);
    expect(manager.isMuted).toBe(false);
  });

  it("clamps master and track volumes within 0 to 1", () => {
    const manager = new AmbientSoundscapeManager();
    manager.setMasterVolume(1.5);
    expect(manager.masterVolume).toBe(1.0);

    manager.setMasterVolume(-0.2);
    expect(manager.masterVolume).toBe(0.0);
  });
});
