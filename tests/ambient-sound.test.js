import { describe, it, expect } from "vitest";
import { AmbientSoundscapeManager, AMBIENT_SOUND_TYPES, SOUNDSCAPE_PRESETS } from "../src/services/ambient-sound.js";

describe("AmbientSoundscapeManager", () => {
  it("exposes valid ambient sound types including binaural beats and ASMR", () => {
    expect(AMBIENT_SOUND_TYPES).toContain("rain");
    expect(AMBIENT_SOUND_TYPES).toContain("wind");
    expect(AMBIENT_SOUND_TYPES).toContain("campfire");
    expect(AMBIENT_SOUND_TYPES).toContain("brown_noise");
    expect(AMBIENT_SOUND_TYPES).toContain("pink_noise");
    expect(AMBIENT_SOUND_TYPES).toContain("ocean_waves");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_alpha");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_gamma");
    expect(AMBIENT_SOUND_TYPES).toContain("keyboard");
    expect(AMBIENT_SOUND_TYPES).toContain("pencil");
  });

  it("exposes soundscape presets", () => {
    expect(SOUNDSCAPE_PRESETS.cozy_fireplace).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.forest_breeze).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.deep_flow).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.ocean_tide).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.study_library).toBeDefined();
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

  it("manages individual track volumes with clamping and presets", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getTrackVolume("rain")).toBe(0.3);

    manager.setTrackVolume("rain", 0.85);
    expect(manager.getTrackVolume("rain")).toBe(0.85);

    manager.setTrackVolume("wind", 1.5);
    expect(manager.getTrackVolume("wind")).toBe(1.0);

    manager.setTrackVolume("campfire", -0.5);
    expect(manager.getTrackVolume("campfire")).toBe(0.0);
  });

  it("applies and retrieves custom track mixes", () => {
    const manager = new AmbientSoundscapeManager();
    const mix = { rain: 0.65, campfire: 0.45 };
    manager.applyTrackMix(mix);

    expect(manager.getTrackVolume("rain")).toBe(0.65);
    expect(manager.getTrackVolume("campfire")).toBe(0.45);
    expect(manager.applyTrackMix(null)).toEqual([]);
  });

  it("manages track stereo panning with clamping (-1 to 1) and spatial scenarios", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getTrackPan("rain")).toBe(0);

    manager.setTrackPan("rain", -0.75);
    expect(manager.getTrackPan("rain")).toBe(-0.75);

    // Clamping bounds
    manager.setTrackPan("wind", -2.5);
    expect(manager.getTrackPan("wind")).toBe(-1.0);

    manager.setTrackPan("campfire", 1.8);
    expect(manager.getTrackPan("campfire")).toBe(1.0);

    manager.applySpatialScenario("cabin_realism");
    expect(manager.getTrackPan("rain")).toBe(-0.7);
    expect(manager.getTrackPan("campfire")).toBe(0.65);

    manager.applySpatialScenario("centered");
    expect(manager.getTrackPan("rain")).toBe(0);
    expect(manager.getTrackPan("campfire")).toBe(0);
  });

  it("supports smooth crossfade transitions when stopping and mixing tracks", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.stopTrack("non_existent", 0.5)).toBe(false);

    manager.applyTrackMix({ rain: 0.5, wind: 0.3 }, {}, 0.5);
    expect(manager.getTrackVolume("rain")).toBe(0.5);
    expect(manager.getTrackVolume("wind")).toBe(0.3);

    manager.stopAll(0.2);
    expect(manager.getActiveTracks().length).toBe(0);
  });
});
