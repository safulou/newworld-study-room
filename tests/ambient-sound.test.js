import { describe, it, expect, vi } from "vitest";
import {
  AmbientSoundscapeManager,
  AMBIENT_SOUND_TYPES,
  SOUNDSCAPE_PRESETS,
  encodeSoundscapeCode,
  decodeSoundscapeCode,
  ACOUSTIC_PRESETS,
  DISTANCE_MODELS,
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
    expect(AMBIENT_SOUND_TYPES).toContain("crickets");
  });

  it("exposes soundscape presets", () => {
    expect(SOUNDSCAPE_PRESETS.cozy_fireplace).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.forest_breeze).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.deep_flow).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.vinyl_cafe).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.ocean_tide).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.zen_meditation).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.study_library).toBeDefined();
    expect(SOUNDSCAPE_PRESETS.summer_night).toBeDefined();
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

  it("applies spatial soundstage scenarios and manages track coordinates", () => {
    const manager = new AmbientSoundscapeManager();
    const scenarios = manager.getSpatialScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(5);

    const scenarioIds = scenarios.map((s) => s.id);
    expect(scenarioIds).toContain("cabin_realism");
    expect(scenarioIds).toContain("forest_walk");
    expect(scenarioIds).toContain("ocean_breeze");
    expect(scenarioIds).toContain("campfire_night");
    expect(scenarioIds).toContain("centered");

    expect(manager.applySpatialScenario("forest_walk")).toBe(true);
    expect(manager.getTrackPan("wind")).toBe(-0.6);
    expect(manager.getTrackPan("campfire")).toBe(0.7);

    // Track coordinates
    const coords = manager.setTrackCoordinates("rain", { x: -0.4, y: 0.8 });
    expect(coords.x).toBe(-0.4);
    expect(coords.y).toBe(0.8);
    expect(manager.getTrackCoordinates("rain")).toEqual({ x: -0.4, y: 0.8 });
    expect(manager.getTrackPan("rain")).toBe(-0.4);

    // Clamps out of bounds coordinates
    manager.setTrackCoordinates("ocean_waves", { x: 2.5, y: -0.5 });
    expect(manager.getTrackCoordinates("ocean_waves")).toEqual({ x: 1, y: 0 });

    const allCoords = manager.getAllTrackCoordinates();
    expect(allCoords.rain).toEqual({ x: -0.4, y: 0.8 });
    expect(allCoords.ocean_waves).toEqual({ x: 1, y: 0 });
  });

  it("calculates dominant track pan weighted by volume", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getDominantTrackPan()).toBe(0);

    // Rain on left (-0.6, vol 0.8) and Wind on right (0.2, vol 0.2)
    manager.nodes.set("rain", { volume: 0.8 });
    manager.trackVolumes.rain = 0.8;
    manager.trackPans.rain = -0.6;

    manager.nodes.set("wind", { volume: 0.2 });
    manager.trackVolumes.wind = 0.2;
    manager.trackPans.wind = 0.2;

    // (-0.6 * 0.8 + 0.2 * 0.2) / (0.8 + 0.2) = (-0.48 + 0.04) / 1.0 = -0.44
    expect(manager.getDominantTrackPan()).toBeCloseTo(-0.44);
  });

  it("encodes and decodes 2D soundstage coordinates in soundscape share code", () => {
    const preset = {
      name: "立體松林",
      tracks: { rain: 60, wind: 40 },
      pans: { rain: -0.5, wind: 0.5 },
      coordinates: {
        rain: [-0.5, 0.75],
        wind: [0.5, 0.3],
      },
    };

    const code = encodeSoundscapeCode(preset);
    expect(code.startsWith("sc_")).toBe(true);

    const decoded = decodeSoundscapeCode(code);
    expect(decoded.name).toBe("立體松林");
    expect(decoded.tracks.rain).toBe(60);
    expect(decoded.pans.rain).toBe(-0.5);
    expect(decoded.coordinates).toBeDefined();
    expect(decoded.coordinates.rain).toEqual({ x: -0.5, y: 0.75 });
    expect(decoded.coordinates.wind).toEqual({ x: 0.5, y: 0.3 });
  });

  it("calculates acoustic distance air absorption cutoff and dynamically adjusts lowpass filter", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isDistanceDamping()).toBe(true);

    // At y = 1 (close to listener): full spectrum (20,000 Hz)
    expect(manager.calculateDistanceCutoff(1.0)).toBe(20000);
    // At y = 0 (far away): atmospheric air damping (2,600 Hz)
    expect(manager.calculateDistanceCutoff(0.0)).toBe(2600);
    // At y = 0.5: intermediate cutoff (11,300 Hz)
    expect(manager.calculateDistanceCutoff(0.5)).toBe(11300);

    // When distance damping is disabled: always 20000 Hz
    manager.setDistanceDamping(false);
    expect(manager.isDistanceDamping()).toBe(false);
    expect(manager.calculateDistanceCutoff(0.1)).toBe(20000);
    manager.setDistanceDamping(true);

    // Update track with distance filter
    const mockFilter = {
      frequency: {
        setValueAtTime: vi.fn(),
      },
    };
    manager.audioCtx = { currentTime: 25 };
    manager.nodes.set("campfire", {
      distanceFilter: mockFilter,
    });

    manager.setTrackCoordinates("campfire", { x: 0.5, y: 0.2 });
    // y = 0.2 -> 2600 + 0.2 * 17400 = 6080 Hz
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(6080, 25);
  });

  it("synthesizes night crickets ASMR stridulation pulse bursts safely", () => {
    const manager = new AmbientSoundscapeManager();
    // Safe execution before audioCtx is active
    expect(() => manager.playCricketChirpBurst()).not.toThrow();

    const createdOscillators = [];
    const mockCtx = {
      currentTime: 30,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "sine",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: "bandpass",
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
    };
    manager.ensureContext = () => mockCtx;

    const mockGain = { connect: vi.fn() };
    manager.playCricketChirpBurst(mockGain);
    expect(createdOscillators.length).toBeGreaterThanOrEqual(3);
    expect(createdOscillators[0].type).toBe("sine");
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
  });

  it("manages soundstage compass rotation and computes effective pan and psychoacoustic pinna shadow cutoff", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getStageRotation()).toBe(0);

    // Initial position: center
    manager.setTrackPan("rain", 0);
    manager.trackCoordinates["rain"] = { x: 0, y: 0.5 };
    expect(manager.getEffectiveTrackPan("rain")).toBe(0);
    expect(manager.calculateEffectiveCutoff("rain", 0.5)).toBe(11300);

    // Rotate soundstage by +90 degrees (+PI/2, East)
    manager.setStageRotation(Math.PI / 2);
    expect(manager.getStageRotation()).toBeCloseTo(Math.PI / 2);

    // Track at 0 base angle + PI/2 = PI/2, sin(PI/2) = 1.0 (Right side)
    expect(manager.getEffectiveTrackPan("rain")).toBeCloseTo(1.0);
    // cos(PI/2) is ~0, not negative yet
    expect(manager.calculateEffectiveCutoff("rain", 0.5)).toBe(11300);

    // Rotate soundstage to South (PI, 180 degrees)
    manager.setStageRotation(Math.PI);
    // Track at 0 base angle + PI = PI. cos(PI) = -1 < 0 (behind listener).
    // Cutoff should be attenuated by pinna shadow to at most 5800 Hz.
    expect(manager.calculateEffectiveCutoff("rain", 0.5)).toBeLessThanOrEqual(5800);

    // Mock active audioCtx node update
    const mockPanner = { pan: { setValueAtTime: vi.fn() } };
    const mockFilter = { frequency: { setValueAtTime: vi.fn() } };
    manager.audioCtx = { currentTime: 42 };
    manager.nodes.set("rain", {
      panner: mockPanner,
      distanceFilter: mockFilter,
    });

    manager.setStageRotation(0);
    expect(mockPanner.pan.setValueAtTime).toHaveBeenCalledWith(0, 42);
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(11300, 42);
  });

  it("toggles and configures binaural crossfeed routing network", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.isBinauralCrossfeed()).toBe(false);

    expect(manager.setBinauralCrossfeed(true)).toBe(true);
    expect(manager.isBinauralCrossfeed()).toBe(true);

    const mockSplitter = { connect: vi.fn(), disconnect: vi.fn() };
    const mockMerger = { connect: vi.fn(), disconnect: vi.fn() };
    const mockDelay = { delayTime: { value: 0 }, connect: vi.fn() };
    const mockFilter = { type: "", frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() };
    const mockGain = { gain: { value: 1 }, connect: vi.fn() };

    const mockCtx = {
      destination: {},
      createChannelSplitter: vi.fn(() => mockSplitter),
      createChannelMerger: vi.fn(() => mockMerger),
      createDelay: vi.fn(() => mockDelay),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
    };
    manager.audioCtx = mockCtx;
    const mockSumGain = { disconnect: vi.fn(), connect: vi.fn() };
    manager.masterSumGain = mockSumGain;

    manager.setBinauralCrossfeed(true);
    expect(mockCtx.createChannelSplitter).toHaveBeenCalledWith(2);
    expect(mockCtx.createChannelMerger).toHaveBeenCalledWith(2);
    expect(mockDelay.delayTime.value).toBeCloseTo(0.00032);
    expect(mockFilter.frequency.value).toBe(720);
    expect(mockMerger.connect).toHaveBeenCalledWith(mockCtx.destination);

    // Disable crossfeed
    manager.setBinauralCrossfeed(false);
    expect(manager.isBinauralCrossfeed()).toBe(false);
    expect(mockSumGain.connect).toHaveBeenCalledWith(mockCtx.destination);
  });

  it("configures and updates stereo width via Mid-Side matrix", () => {
    const manager = new AmbientSoundscapeManager();
    expect(manager.getStereoWidth()).toBe(1.0);

    // Clamping bounds
    manager.setStereoWidth(2.5);
    expect(manager.getStereoWidth()).toBe(2.0);

    manager.setStereoWidth(-0.5);
    expect(manager.getStereoWidth()).toBe(0.0);

    manager.setStereoWidth(1.4);
    expect(manager.getStereoWidth()).toBe(1.4);

    const mockSplitter = { connect: vi.fn(), disconnect: vi.fn() };
    const mockMerger = { connect: vi.fn(), disconnect: vi.fn() };
    const createdGains = [];
    const mockCtx = {
      currentTime: 50,
      destination: {},
      createChannelSplitter: vi.fn(() => mockSplitter),
      createChannelMerger: vi.fn(() => mockMerger),
      createGain: vi.fn(() => {
        const g = {
          gain: { value: 1, setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn(),
        };
        createdGains.push(g);
        return g;
      }),
    };
    manager.audioCtx = mockCtx;
    const mockSumGain = { disconnect: vi.fn(), connect: vi.fn() };
    manager.masterSumGain = mockSumGain;

    // Set width to 1.5 (cd = 1.25, cc = -0.25)
    manager.setStereoWidth(1.5);
    expect(mockCtx.createChannelSplitter).toHaveBeenCalledWith(2);
    expect(mockCtx.createChannelMerger).toHaveBeenCalledWith(2);
    // 4 gains: LL, LR, RL, RR
    expect(createdGains.length).toBe(4);
    expect(createdGains[0].gain.value).toBe(1.25); // LL
    expect(createdGains[1].gain.value).toBe(-0.25); // LR
    expect(createdGains[2].gain.value).toBe(-0.25); // RL
    expect(createdGains[3].gain.value).toBe(1.25); // RR
    expect(mockMerger.connect).toHaveBeenCalledWith(mockCtx.destination);

    // Dynamic runtime update without reconnecting when nodes exist
    manager.setStereoWidth(0.0); // Mono (cd = 0.5, cc = 0.5)
    expect(createdGains[0].gain.setValueAtTime).toHaveBeenCalledWith(0.5, 50);
    expect(createdGains[1].gain.setValueAtTime).toHaveBeenCalledWith(0.5, 50);
  });

  describe("Distance Attenuation Models", () => {
    it("exports DISTANCE_MODELS with intimate, realistic, and deep_space", () => {
      expect(DISTANCE_MODELS.intimate).toBeDefined();
      expect(DISTANCE_MODELS.realistic).toBeDefined();
      expect(DISTANCE_MODELS.deep_space).toBeDefined();
      expect(DISTANCE_MODELS.intimate.minCutoff).toBe(4800);
      expect(DISTANCE_MODELS.realistic.minCutoff).toBe(2600);
      expect(DISTANCE_MODELS.deep_space.minCutoff).toBe(1600);
    });

    it("defaults to realistic model and allows setting valid models", () => {
      const manager = new AmbientSoundscapeManager();
      expect(manager.getDistanceModel()).toBe("realistic");

      manager.setDistanceModel("intimate");
      expect(manager.getDistanceModel()).toBe("intimate");

      manager.setDistanceModel("deep_space");
      expect(manager.getDistanceModel()).toBe("deep_space");

      // Invalid model should be ignored
      manager.setDistanceModel("invalid_model");
      expect(manager.getDistanceModel()).toBe("deep_space");
    });

    it("computes calculateDistanceCutoff properly based on active model", () => {
      const manager = new AmbientSoundscapeManager();
      // Realistic: 2600 + y * 17400
      expect(manager.calculateDistanceCutoff(0)).toBe(2600);
      expect(manager.calculateDistanceCutoff(1)).toBe(20000);
      expect(manager.calculateDistanceCutoff(0.5)).toBe(11300);

      // Intimate: 4800 + y * 15200
      manager.setDistanceModel("intimate");
      expect(manager.calculateDistanceCutoff(0)).toBe(4800);
      expect(manager.calculateDistanceCutoff(1)).toBe(20000);
      expect(manager.calculateDistanceCutoff(0.5)).toBe(12400);

      // Deep Space: 1600 + y * 18400
      manager.setDistanceModel("deep_space");
      expect(manager.calculateDistanceCutoff(0)).toBe(1600);
      expect(manager.calculateDistanceCutoff(1)).toBe(20000);
      expect(manager.calculateDistanceCutoff(0.5)).toBe(10800);

      // When distance damping is disabled
      manager.setDistanceDamping(false);
      expect(manager.calculateDistanceCutoff(0)).toBe(20000);
    });

    it("computes calculateDistanceGain properly based on active model", () => {
      const manager = new AmbientSoundscapeManager();
      // Realistic: min 0.35, max 1.0
      expect(manager.calculateDistanceGain(0)).toBe(0.35);
      expect(manager.calculateDistanceGain(1)).toBe(1.0);

      // Intimate: min 0.60, max 1.0
      manager.setDistanceModel("intimate");
      expect(manager.calculateDistanceGain(0)).toBe(0.6);
      expect(manager.calculateDistanceGain(1)).toBe(1.0);

      // Deep Space: min 0.15, max 1.0
      manager.setDistanceModel("deep_space");
      expect(manager.calculateDistanceGain(0)).toBe(0.15);
      expect(manager.calculateDistanceGain(1)).toBe(1.0);

      // When distance damping is disabled
      manager.setDistanceDamping(false);
      expect(manager.calculateDistanceGain(0)).toBe(1.0);
    });

    it("updates track distance filters when distance model is changed with active context", () => {
      const manager = new AmbientSoundscapeManager();
      const mockFilter = {
        frequency: { setValueAtTime: vi.fn() },
      };
      manager.nodes.set("rain", { distanceFilter: mockFilter });
      manager.audioCtx = { currentTime: 25 };
      manager.trackCoordinates = { rain: { x: 0, y: 0.5 } };

      manager.setDistanceModel("deep_space");
      expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(10800, 25);
    });
  });
});
