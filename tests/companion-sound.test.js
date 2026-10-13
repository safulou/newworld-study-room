import { describe, it, expect, beforeEach, vi } from "vitest";
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
    expect(() => manager.playCupClink()).not.toThrow();
    expect(() => manager.playDeskKnock()).not.toThrow();
    expect(() => manager.playWindDownChime()).not.toThrow();
    expect(() => manager.playGreetingWave()).not.toThrow();
    expect(() => manager.playAffirmativeNod()).not.toThrow();
    expect(() => manager.playStarWishChime()).not.toThrow();
    expect(() => manager.playDeliveryChime()).not.toThrow();
    expect(() => manager.playAcousticListenChime()).not.toThrow();
    expect(() => manager.playStargazeChime()).not.toThrow();
    expect(() => manager.playClockworkTick({ isTock: false, mode: "wood", volume: 0.5 })).not.toThrow();
    expect(() => manager.playClockworkTick({ isTock: true, mode: "crisp", volume: 0.3 })).not.toThrow();
    expect(() => manager.playClockworkTick({ isTock: false, mode: "wood", volume: 0 })).not.toThrow();
  });

  it("plays ethereal crystalline arpeggio in playStarWishChime when AudioContext is present", () => {
    const createdOscillators = [];
    const mockCtx = {
      currentTime: 10,
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
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playStarWishChime();
    // 4 notes: D6, F#6, A6, D7
    expect(createdOscillators).toHaveLength(4);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1174.66, 10);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(1479.98, 10.08);
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(1760.0, 10.16);
    expect(createdOscillators[3].frequency.setValueAtTime).toHaveBeenCalledWith(2349.32, 10.24);
  });

  it("synthesizes pure fifth harmonic interval in playAcousticListenChime", () => {
    const createdOscillators = [];
    const mockCtx = {
      currentTime: 25,
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
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playAcousticListenChime();
    // 2 notes: E6 (1318.51Hz) and B6 (1975.53Hz)
    expect(createdOscillators).toHaveLength(2);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1318.51, 25);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(1975.53, 25.09);
  });

  it("synthesizes celestial pentatonic harp cascade in playStargazeChime", () => {
    const createdOscillators = [];
    const mockCtx = {
      currentTime: 40,
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
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playStargazeChime();
    // 5 notes: F#5, G#5, A#5, C#6, D#6
    expect(createdOscillators).toHaveLength(5);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(739.99, 40);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(830.61, 40.07);
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(932.33, 40.14);
    expect(createdOscillators[3].frequency.setValueAtTime).toHaveBeenCalledWith(1108.73, 40.21);
    expect(createdOscillators[4].frequency.setValueAtTime).toHaveBeenCalledWith(1244.51, 40.28);
  });

  it("synthesizes organic paper leafing rustle in playPageTurnRustle", () => {
    expect(() => manager.playPageTurnRustle()).not.toThrow();

    const mockBufferSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockFilter = {
      type: "",
      Q: { setValueAtTime: vi.fn() },
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 50,
      sampleRate: 44100,
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(100)),
      })),
      createBufferSource: vi.fn(() => mockBufferSource),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playPageTurnRustle();
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockBufferSource.start).toHaveBeenCalledWith(50);
  });
});
