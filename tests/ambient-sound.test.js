import { describe, it, expect, vi } from "vitest";
import {
  AmbientSoundscapeManager,
  AMBIENT_SOUND_TYPES,
  SOUNDSCAPE_PRESETS,
  encodeSoundscapeCode,
  decodeSoundscapeCode,
  ACOUSTIC_PRESETS,
  createProceduralImpulseResponse,
} from "../src/services/ambient-sound.js";

describe("AmbientSoundscapeManager", () => {
  it("exposes valid ambient sound types including binaural beats and ASMR", () => {
    expect(AMBIENT_SOUND_TYPES).toContain("rain");
    expect(AMBIENT_SOUND_TYPES).toContain("wind");
    expect(AMBIENT_SOUND_TYPES).toContain("campfire");
    expect(AMBIENT_SOUND_TYPES).toContain("brown_noise");
    expect(AMBIENT_SOUND_TYPES).toContain("pink_noise");
    expect(AMBIENT_SOUND_TYPES).toContain("ocean_waves");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_theta");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_alpha");
    expect(AMBIENT_SOUND_TYPES).toContain("binaural_gamma");
    expect(AMBIENT_SOUND_TYPES).toContain("keyboard");
    expect(AMBIENT_SOUND_TYPES).toContain("pencil");
    expect(AMBIENT_SOUND_TYPES).toContain("vinyl");
  });

  it("exposes soundscape presets", () => {
    expect(SOUNDSCAPE_PRESETS.cozy_fireplace).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.forest_breeze).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.deep_flow).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.vinyl_cafe).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.ocean_tide).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.zen_meditation).toBeDefined();
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

  it("encodes and decodes soundscape preset codes safely", () => {
    const original = {
      name: "林中夜讀",
      tracks: { rain: 45, campfire: 35, ocean_waves: 0 },
      pans: { rain: -0.6, campfire: 0.6 },
    };

    const code = encodeSoundscapeCode(original);
    expect(code).toBeDefined();
    expect(code.startsWith("sc_")).toBe(true);

    const decoded = decodeSoundscapeCode(code);
    expect(decoded).not.toBeNull();
    expect(decoded.name).toBe("林中夜讀");
    expect(decoded.tracks.rain).toBe(45);
    expect(decoded.tracks.campfire).toBe(35);
    expect(decoded.pans.rain).toBe(-0.6);
    expect(decoded.pans.campfire).toBe(0.6);
    expect(decoded.tracks.ocean_waves).toBeUndefined(); // filtered 0 volume
  });

  it("gracefully handles invalid, corrupted or empty soundscape codes", () => {
    expect(encodeSoundscapeCode(null)).toBe("");
    expect(encodeSoundscapeCode({})).toBe("");
    expect(decodeSoundscapeCode("")).toBeNull();
    expect(decodeSoundscapeCode("invalid_garbage_base64!!!")).toBeNull();
    expect(decodeSoundscapeCode("sc_eyJuYW1lIjoiIn0")).toBeNull(); // no tracks
  });

  it("supports tuning binaural beat brainwave frequencies and Theta wave", () => {
    const manager = new AmbientSoundscapeManager();
    const thetaFreq = manager.getBinauralBeatFrequency("binaural_theta");
    expect(thetaFreq).toEqual({ base: 196, diff: 6 });

    const updated = manager.setBinauralBeatFrequency("binaural_theta", 205, 7);
    expect(updated).toBe(true);
    expect(manager.getBinauralBeatFrequency("binaural_theta")).toEqual({ base: 205, diff: 7 });

    // Invalid track name
    expect(manager.setBinauralBeatFrequency("non_existent", 200, 10)).toBe(false);
    expect(manager.getBinauralBeatFrequency("non_existent")).toBeNull();
  });

  it("exposes acoustic presets and generates procedural impulse responses", () => {
    expect(ACOUSTIC_PRESETS.bypass).toBeDefined();
    expect(ACOUSTIC_PRESETS.cabin).toBeDefined();
    expect(ACOUSTIC_PRESETS.library).toBeDefined();
    expect(ACOUSTIC_PRESETS.cathedral).toBeDefined();

    // Mock audio context
    const mockCtx = {
      sampleRate: 44100,
      createBuffer: (channels, length, sampleRate) => ({
        numberOfChannels: channels,
        length,
        sampleRate,
        getChannelData: () => new Float32Array(length),
      }),
    };
    const impulse = createProceduralImpulseResponse(mockCtx, 0.5, 2.0);
    expect(impulse).not.toBeNull();
    expect(impulse.length).toBe(22050);

    expect(createProceduralImpulseResponse(null)).toBeNull();
  });

  it("controls master EQ and reverb wet/dry mix and applies presets", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getMasterEQ()).toEqual({ bass: 0, mid: 0, treble: 0 });
    expect(manager.getMasterReverb().wet).toBe(0.0);

    manager.setMasterEQ({ bass: 3.5, mid: -1.0, treble: 4.0 });
    expect(manager.getMasterEQ()).toEqual({ bass: 3.5, mid: -1.0, treble: 4.0 });

    // Clamping to -12 ~ +12 dB
    manager.setMasterEQ({ bass: 20, mid: -25, treble: 0 });
    expect(manager.getMasterEQ()).toEqual({ bass: 12, mid: -12, treble: 0 });

    // Reverb wet clamping
    manager.setMasterReverb({ wet: 0.9, duration: 1.5, decay: 2.0 });
    expect(manager.getMasterReverb().wet).toBe(0.7);

    // Apply preset
    expect(manager.applyAcousticPreset("cabin")).toBe(true);
    expect(manager.getMasterEQ()).toEqual(ACOUSTIC_PRESETS.cabin.eq);
    expect(manager.getMasterReverb().preset).toBe("cabin");
    expect(manager.getMasterReverb().wet).toBe(ACOUSTIC_PRESETS.cabin.reverb.wet);

    expect(manager.applyAcousticPreset("invalid_preset")).toBe(false);
  });

  it("applies master soundscape presets including acoustic EQ and reverb", () => {
    expect(SOUNDSCAPE_PRESETS.cathedral_study).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.cathedral_study.acoustic).toBe("cathedral");
    expect(SOUNDSCAPE_PRESETS.blizzard_cabin).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.blizzard_cabin.acoustic).toBe("cabin");

    const manager = new AmbientSoundscapeManager();
    manager.applyPreset("cathedral_study");
    expect(manager.getMasterEQ()).toEqual({ bass: 1, mid: 2, treble: 3 });
    expect(manager.getMasterReverb().preset).toBe("cathedral");
  });

  it("encodes and decodes soundscape codes with EQ and reverb preserving backward compatibility", () => {
    // 1. With EQ and Reverb
    const preset = {
      name: "大教堂古典",
      tracks: { pencil: 0.3, rain: 0.2 },
      pans: { pencil: 0.35, rain: -0.5 },
      eq: { bass: 2, mid: 1, treble: 3 },
      reverb: { preset: "cathedral", wet: 0.28 },
      orbitingBreeze: true,
    };
    const code = encodeSoundscapeCode(preset);
    expect(code.startsWith("sc_")).toBe(true);

    const decoded = decodeSoundscapeCode(code);
    expect(decoded.name).toBe("大教堂古典");
    expect(decoded.tracks.pencil).toBe(30);
    expect(decoded.tracks.rain).toBe(20);
    expect(decoded.pans.pencil).toBe(0.35);
    expect(decoded.pans.rain).toBe(-0.5);
    expect(decoded.eq).toEqual({ bass: 2, mid: 1, treble: 3 });
    expect(decoded.reverb).toEqual({ preset: "cathedral", wet: 0.28 });
    expect(decoded.orbitingBreeze).toBe(true);

    // 2. Legacy code without EQ/Reverb/Breeze
    const legacyPreset = {
      name: "傳統音景",
      tracks: { wind: 0.4 },
      pans: { wind: -0.2 },
    };
    const legacyCode = encodeSoundscapeCode(legacyPreset);
    const legacyDecoded = decodeSoundscapeCode(legacyCode);
    expect(legacyDecoded.name).toBe("傳統音景");
    expect(legacyDecoded.tracks.wind).toBe(40);
    expect(legacyDecoded.eq).toBeNull();
    expect(legacyDecoded.reverb).toBeNull();
    expect(legacyDecoded.orbitingBreeze).toBe(false);
  });

  it("supports ducking and unducking master volume safely", () => {
    const manager = new AmbientSoundscapeManager();
    // Safe execution before audioCtx is created
    expect(() => manager.duck(0.2, 0.5)).not.toThrow();
    expect(() => manager.unduck(0.5)).not.toThrow();

    const mockCtx = {
      currentTime: 10,
      state: "running",
      resume: vi.fn().mockResolvedValue(),
      createGain: vi.fn().mockReturnValue({
        gain: {
          value: 0.5,
          setValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }),
      destination: {},
    };
    manager.audioCtx = mockCtx;
    manager.masterGain = mockCtx.createGain();
    manager.masterVolume = 0.6;

    manager.duck(0.25, 0.8);
    expect(manager.masterGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10);
    expect(manager.masterGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.15, 10.8);

    manager.unduck(0.8);
    expect(manager.masterGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.6, 10.8);
  });

  it("manages sleep timer lifecycle with callbacks and auto-fadeout", () => {
    vi.useFakeTimers();
    try {
      const manager = new AmbientSoundscapeManager();
      const tickSpy = vi.fn();
      const completeSpy = vi.fn();
      manager.onSleepTimerTick = tickSpy;
      manager.onSleepTimerComplete = completeSpy;

      expect(manager.isSleepTimerActive()).toBe(false);
      expect(manager.getSleepTimerRemaining()).toBe(0);

      // Setting 0 or negative does nothing
      expect(manager.setSleepTimer(0)).toBe(0);
      expect(manager.isSleepTimerActive()).toBe(false);

      // Set 1 minute (60 seconds)
      const remaining = manager.setSleepTimer(1);
      expect(remaining).toBe(60);
      expect(manager.isSleepTimerActive()).toBe(true);
      expect(manager.getSleepTimerRemaining()).toBe(60);
      expect(tickSpy).toHaveBeenCalledWith(60);

      // Advance by 1 second
      vi.advanceTimersByTime(1000);
      expect(manager.getSleepTimerRemaining()).toBe(59);
      expect(tickSpy).toHaveBeenCalledWith(59);

      // Clear timer
      manager.clearSleepTimer();
      expect(manager.isSleepTimerActive()).toBe(false);
      expect(manager.getSleepTimerRemaining()).toBe(0);
      expect(tickSpy).toHaveBeenCalledWith(0);

      // Start new timer with 2 seconds (0.0333 mins -> 2 sec)
      manager.sleepTimerRemainingSec = 2;
      manager.sleepTimerDurationSec = 2;
      manager.setSleepTimer(2 / 60);
      expect(manager.isSleepTimerActive()).toBe(true);

      const stopSpy = vi.spyOn(manager, "stopAll");

      // Advance 2 seconds to completion
      vi.advanceTimersByTime(2000);
      expect(stopSpy).toHaveBeenCalledWith(1.2);
      expect(completeSpy).toHaveBeenCalled();
      expect(manager.isSleepTimerActive()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("provides real-time acoustic visualizer analyser data safely", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getAnalyserData()).toBeNull();

    manager.analyser = {
      frequencyBinCount: 32,
      getByteFrequencyData: vi.fn((arr) => arr.fill(128)),
      getByteTimeDomainData: vi.fn((arr) => arr.fill(64)),
    };

    const data = manager.getAnalyserData();
    expect(data).not.toBeNull();
    expect(data.bufferLength).toBe(32);
    expect(data.freqData.length).toBe(32);
    expect(data.timeData.length).toBe(32);
    expect(data.freqData[0]).toBe(128);
    expect(data.timeData[0]).toBe(64);
  });

  it("controls orbiting breeze LFO modulation smoothly", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isOrbitingBreeze()).toBe(false);

    const mockOsc = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 10,
      createOscillator: vi.fn().mockReturnValue(mockOsc),
      createGain: vi.fn().mockReturnValue(mockGain),
    };
    manager.audioCtx = mockCtx;

    const mockTrack = {
      volume: 0.4,
      panner: {
        pan: {
          value: 0,
          setValueAtTime: vi.fn(),
        },
      },
    };
    manager.nodes.set("rain", mockTrack);

    // Enable orbiting breeze
    manager.setOrbitingBreeze(true, { speed: 0.05, depth: 0.7 });
    expect(manager.isOrbitingBreeze()).toBe(true);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();
    expect(mockOsc.connect).toHaveBeenCalledWith(mockGain);
    expect(mockGain.connect).toHaveBeenCalledWith(mockTrack.panner.pan);
    expect(mockOsc.start).toHaveBeenCalled();

    // Disable orbiting breeze
    manager.setOrbitingBreeze(false);
    expect(manager.isOrbitingBreeze()).toBe(false);
    expect(mockOsc.stop).toHaveBeenCalled();
    expect(mockOsc.disconnect).toHaveBeenCalled();
    expect(mockGain.disconnect).toHaveBeenCalled();
  });

  it("handles automatic atmosphere mode synchronization", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isAutoAtmosphereSync()).toBe(false);

    manager.setAutoAtmosphereSync(true);
    expect(manager.isAutoAtmosphereSync()).toBe(true);

    const mockCtx = {
      currentTime: 15,
    };
    manager.audioCtx = mockCtx;

    const trackGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    };
    manager.nodes.set("binaural_alpha", {
      volume: 0.4,
      gain: trackGain,
    });

    // In break mode: ducks binaural alpha
    manager.setAtmosphereMode("break");
    expect(trackGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.4 * 0.4, 16.2);

    // Also supports shortBreak and longBreak timer modes
    manager.setAtmosphereMode("shortBreak");
    expect(manager.atmosphereMode).toBe("break");
    manager.setAtmosphereMode("longBreak");
    expect(manager.atmosphereMode).toBe("break");

    // In focus mode: restores full immersion
    manager.setAtmosphereMode("focus");
    expect(trackGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.4, 16.2);
  });

  it("controls tidal surge state for ocean waves", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isTidalSurge()).toBe(true);

    manager.setTidalSurge(false);
    expect(manager.isTidalSurge()).toBe(false);

    manager.setTidalSurge(true);
    expect(manager.isTidalSurge()).toBe(true);
  });
});
