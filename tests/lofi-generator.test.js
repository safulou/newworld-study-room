import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LofiGenerator } from "../src/services/lofi-generator.js";

describe("LofiGenerator", () => {
  let generator;

  beforeEach(() => {
    generator = new LofiGenerator(0.5);
  });

  afterEach(() => {
    generator.destroy();
    vi.restoreAllMocks();
  });

  it("initializes in stopped state", () => {
    expect(generator.running).toBe(false);
    expect(generator.volume).toBe(0.5);
  });

  it("updates volume within [0, 1] range", () => {
    generator.setVolume(0.8);
    expect(generator.volume).toBe(0.8);

    generator.setVolume(1.5);
    expect(generator.volume).toBe(1.0);

    generator.setVolume(-0.2);
    expect(generator.volume).toBe(0.0);
  });

  it("toggles play and stop state", async () => {
    // Mock web audio context if running in node / jsdom
    const mockCtx = {
      state: "running",
      currentTime: 0,
      createGain: () => ({
        gain: {
          setValueAtTime: vi.fn(),
          setTargetAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
      createBiquadFilter: () => ({
        type: "lowpass",
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      }),
      createOscillator: () => ({
        type: "sine",
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      destination: {},
      resume: vi.fn().mockResolvedValue(),
      close: vi.fn().mockResolvedValue(),
    };

    class MockAudioContext {
      constructor() {
        return mockCtx;
      }
    }
    window.AudioContext = MockAudioContext;

    await generator.start();
    expect(generator.running).toBe(true);

    generator.stop();
    expect(generator.running).toBe(false);
  });
});
