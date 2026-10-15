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

  it("synthesizes warm liquid intake and teacup clink in playCoffeeSip", () => {
    expect(() => manager.playCoffeeSip()).not.toThrow();

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
    const createdOscillators = [];
    const mockCtx = {
      currentTime: 60,
      sampleRate: 44100,
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(100)),
      })),
      createBufferSource: vi.fn(() => mockBufferSource),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playCoffeeSip();
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockBufferSource.start).toHaveBeenCalledWith(60);
    expect(createdOscillators.length).toBe(3); // G5, G6, D7 porcelain clink
  });

  it("synthesizes pure crystalline dewdrop in playDewDropSound", () => {
    expect(() => manager.playDewDropSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 70,
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playDewDropSound();
    expect(createdOscillators.length).toBe(2); // droplet burst + water body resonance
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1180, 70);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(440, 70);
  });

  it("synthesizes procedural kitten purring in playKittenPurr", () => {
    expect(() => manager.playKittenPurr(2.0)).not.toThrow();

    const createdOscillators = [];
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 80,
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => mockFilter),
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playKittenPurr(2.5);
    // carrier (32Hz) + tremolo LFO (24Hz) + breath LFO (0.6Hz)
    expect(createdOscillators.length).toBe(3);
    expect(createdOscillators[0].type).toBe("triangle");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(32, 80);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(24, 80);
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(0.6, 80);
    expect(mockFilter.type).toBe("lowpass");
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(160, 80);
  });

  it("synthesizes ethereal crystal arpeggio in playButterflyFlutterSound", () => {
    expect(() => manager.playButterflyFlutterSound()).not.toThrow();

    const createdOscillators = [];
    const mockCtx = {
      currentTime: 90,
      createGain: vi.fn(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playButterflyFlutterSound();
    // 3 crystal notes: 680, 1020, 1360
    expect(createdOscillators.length).toBe(3);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(680, 90);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(1020, 90 + 0.045);
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(1360, 90 + 0.09);
  });

  it("synthesizes soft swept bandpass exhale in playBreezeBreath", () => {
    expect(() => manager.playBreezeBreath()).not.toThrow();

    const mockBufferSource = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 100,
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

    manager.playBreezeBreath(0.9);
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(420, 100);
    expect(mockBufferSource.start).toHaveBeenCalledWith(100);
  });

  it("synthesizes high-frequency plant mist spritz in playWaterMistSound", () => {
    expect(() => manager.playWaterMistSound()).not.toThrow();

    const mockBufferSource = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    const mockFilter = {
      type: "",
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 110,
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

    manager.playWaterMistSound(0.5);
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(4200, 110);
    expect(mockBufferSource.start).toHaveBeenCalledWith(110);
  });

  it("synthesizes multi-tone pentatonic chime bell overtones in playWindChimeSound", () => {
    expect(() => manager.playWindChimeSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 120,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playWindChimeSound();
    // 1 clapper osc + 4 pairs of chime & shimmer oscs = 9 oscillators
    expect(createdOscillators.length).toBe(9);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(createdOscillators[0].type).toBe("sine");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(380, 120);
  });

  it("synthesizes botanical leaf friction rustle in playLeafFrictionSound", () => {
    expect(() => manager.playLeafFrictionSound()).not.toThrow();

    const mockBufferSource = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    const mockFilter = {
      type: "",
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 130,
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

    manager.playLeafFrictionSound(0.25);
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(850, 130);
    expect(mockBufferSource.start).toHaveBeenCalledWith(130);
  });

  it("synthesizes granular sand trickle in playHourglassSandSound", () => {
    expect(() => manager.playHourglassSandSound()).not.toThrow();

    const mockBufferSource = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    const mockFilters = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 140,
      sampleRate: 44100,
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(100)),
      })),
      createBufferSource: vi.fn(() => mockBufferSource),
      createBiquadFilter: vi.fn(() => {
        const filter = {
          type: "",
          frequency: { setValueAtTime: vi.fn() },
          Q: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
        };
        mockFilters.push(filter);
        return filter;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playHourglassSandSound(2.0);
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockFilters).toHaveLength(2); // Low bandpass & high bandpass
    expect(mockFilters[0].type).toBe("bandpass");
    expect(mockFilters[0].frequency.setValueAtTime).toHaveBeenCalledWith(1600, 140);
    expect(mockFilters[1].frequency.setValueAtTime).toHaveBeenCalledWith(3200, 140);
    expect(mockBufferSource.start).toHaveBeenCalledWith(140);
  });

  it("synthesizes morning mountain warbler chirps in playSongbirdWarbleSound", () => {
    expect(() => manager.playSongbirdWarbleSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 150,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playSongbirdWarbleSound();
    expect(createdOscillators).toHaveLength(2); // 2 chirps
    expect(createdOscillators[0].type).toBe("sine");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(2600, 150);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(2900, 150.16);
  });

  it("synthesizes vintage magnifying glass brass tap and lens shimmer in playMagnifierInspectSound", () => {
    expect(() => manager.playMagnifierInspectSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 160,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playMagnifierInspectSound(1.8);
    // 2 brass chimes (triangle) + 2 optical lens tones (sine) = 4 oscillators
    expect(createdOscillators).toHaveLength(4);
    expect(createdOscillators[0].type).toBe("triangle");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(587.33, 160);
    expect(createdOscillators[2].type).toBe("sine");
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(1760.0, 160.12);
  });

  it("synthesizes organic springy mushroom cap bounce in playMushroomBounceSound", () => {
    expect(() => manager.playMushroomBounceSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 170,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playMushroomBounceSound();
    expect(createdOscillators).toHaveLength(2); // 2 bouncy harmonic impulses
    expect(createdOscillators[0].type).toBe("sine");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(320, 170);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(460, 170.07);
  });

  it("synthesizes inkwell glass ping and fluid pop in playQuillDipSound", () => {
    expect(() => manager.playQuillDipSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 180,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playQuillDipSound();
    // 2 glass notes + 1 fluid pop
    expect(createdOscillators).toHaveLength(3);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1479.98, 180);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(2217.46, 180);
    expect(createdOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(540, 180.03);
  });

  it("synthesizes multi-stroke parchment scratch noise bursts in playQuillWritingSound", () => {
    expect(() => manager.playQuillWritingSound()).not.toThrow();

    const mockBufferSource = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { value: 0 },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 190,
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

    manager.playQuillWritingSound(2.4);
    // 4 strokes
    expect(mockCtx.createBufferSource).toHaveBeenCalledTimes(4);
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.Q.value).toBe(3.2);
  });

  it("synthesizes ratchet mechanical winding clicks in playMusicBoxCrankSound", () => {
    expect(() => manager.playMusicBoxCrankSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn() },
      Q: { value: 0 },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 200,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      createBiquadFilter: vi.fn(() => mockFilter),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playMusicBoxCrankSound(1.0);
    // 5 ratchet clicks
    expect(createdOscillators).toHaveLength(5);
    expect(createdOscillators[0].type).toBe("square");
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.Q.value).toBe(4.0);
  });

  it("synthesizes resonant metallic tines with inharmonic overtones in playMusicBoxChime", () => {
    expect(() => manager.playMusicBoxChime()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 210,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playMusicBoxChime();
    // Default 5 notes * 2 (fundamental + overtone) = 10 oscillators
    expect(createdOscillators).toHaveLength(10);
    expect(createdOscillators[0].type).toBe("sine");
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1318.51, 210);
    // Overtone ~ 1318.51 * 2.756
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(1318.51 * 2.756, 1),
      210,
    );
  });

  it("synthesizes organic dual-pulse cicada chirp in playCicadaShortChirp", () => {
    expect(() => manager.playCicadaShortChirp()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn() },
      Q: { value: 0 },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 220,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      createBiquadFilter: vi.fn(() => mockFilter),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playCicadaShortChirp();
    // 2 pulses * 2 oscillators (carrier + tremolo) = 4 oscillators
    expect(createdOscillators).toHaveLength(4);
    expect(createdOscillators[0].type).toBe("sawtooth");
    expect(createdOscillators[1].type).toBe("sine");
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.Q.value).toBe(5.8);
  });

  it("synthesizes multi-strike mechanical clacks in playTypewriterClackSound", () => {
    expect(() => manager.playTypewriterClackSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 240,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playTypewriterClackSound(4);
    // 4 key strikes * 2 oscillators (impact click + platen thump) = 8 oscillators
    expect(createdOscillators).toHaveLength(8);
    expect(createdOscillators[0].type).toBe("triangle");
    expect(createdOscillators[1].type).toBe("sine");
  });

  it("synthesizes carriage return bell chime in playTypewriterBellSound", () => {
    expect(() => manager.playTypewriterBellSound()).not.toThrow();

    const createdOscillators = [];
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockCtx = {
      currentTime: 250,
      createOscillator: vi.fn(() => {
        const osc = {
          type: "",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playTypewriterBellSound();
    expect(createdOscillators).toHaveLength(2);
    expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(2960, 250);
    expect(createdOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(5880, 250);
  });

  it("synthesizes organic swept bandpass breeze in playSeasonalWindGustSound", () => {
    expect(() => manager.playSeasonalWindGustSound()).not.toThrow();

    const mockSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      Q: { value: 0 },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const channelData = new Float32Array(44100 * 2);
    const mockBuffer = {
      getChannelData: vi.fn(() => channelData),
    };
    const mockCtx = {
      currentTime: 260,
      sampleRate: 44100,
      createBuffer: vi.fn(() => mockBuffer),
      createBufferSource: vi.fn(() => mockSource),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playSeasonalWindGustSound(2.0);
    expect(mockCtx.createBuffer).toHaveBeenCalledWith(1, 44100 * 2, 44100);
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.Q.value).toBe(2.2);
    expect(mockSource.start).toHaveBeenCalledWith(260);
  });

  it("synthesizes stylus thud and vinyl groove crackle in playVinylNeedleDropSound", () => {
    expect(() => manager.playVinylNeedleDropSound()).not.toThrow();

    const mockOsc = {
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockSource = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockFilter = {
      type: "",
      frequency: { setValueAtTime: vi.fn() },
      Q: { value: 0 },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const channelData = new Float32Array(44100 * 2);
    const mockBuffer = {
      getChannelData: vi.fn(() => channelData),
    };
    const mockCtx = {
      currentTime: 300,
      sampleRate: 44100,
      createOscillator: vi.fn(() => mockOsc),
      createBuffer: vi.fn(() => mockBuffer),
      createBufferSource: vi.fn(() => mockSource),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
      destination: {},
    };
    manager.ensureContext = () => mockCtx;

    manager.playVinylNeedleDropSound(2.0);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockOsc.frequency.setValueAtTime).toHaveBeenCalledWith(72, 300);
    expect(mockCtx.createBufferSource).toHaveBeenCalled();
    expect(mockFilter.type).toBe("bandpass");
    expect(mockFilter.frequency.setValueAtTime).toHaveBeenCalledWith(950, 300);
    expect(mockSource.start).toHaveBeenCalledWith(300);
  });
});
