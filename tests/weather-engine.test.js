import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WeatherEngine } from "../src/services/weather-engine.js";

describe("WeatherEngine Service", () => {
  let canvas;
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      ellipse: vi.fn(),
      lineWidth: 1,
      lineCap: "round",
      strokeStyle: "",
      fillStyle: "",
    };

    canvas = {
      width: 88,
      height: 96,
      getContext: vi.fn().mockReturnValue(mockCtx),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with mode 'none' and empty particles", () => {
    const engine = new WeatherEngine(canvas);
    expect(engine.mode).toBe("none");
    expect(engine.particles).toHaveLength(0);
  });

  it("switches to 'rain' mode and populates raindrops", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("rain");
    expect(engine.mode).toBe("rain");
    expect(engine.particles.length).toBe(28);
    expect(engine.animationFrame).toBeDefined();

    // Verify renderFrame runs without error
    engine.renderFrame();
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();

    engine.stop();
    expect(engine.animationFrame).toBeNull();
  });

  it("switches to 'snow' mode and animates snowflakes", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("snow");
    expect(engine.mode).toBe("snow");
    expect(engine.particles.length).toBe(24);

    engine.renderFrame();
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    engine.stop();
  });

  it("switches to 'leaves' mode and draws falling leaves", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("leaves");
    expect(engine.mode).toBe("leaves");
    expect(engine.particles.length).toBe(16);

    engine.renderFrame();
    expect(mockCtx.ellipse).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    engine.stop();
  });

  it("switches to 'clear' mode and draws celestial dust", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("clear");
    expect(engine.mode).toBe("clear");
    expect(engine.particles.length).toBe(12);

    engine.renderFrame();
    expect(mockCtx.arc).toHaveBeenCalled();
    expect(mockCtx.fill).toHaveBeenCalled();
    engine.stop();
  });

  it("supports dynamic wind breeze tilting and drift", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("rain");
    engine.setWind(1.5);
    expect(engine.targetWind).toBe(1.5);

    // Call renderFrame multiple times to test interpolation
    engine.renderFrame();
    expect(engine.wind).toBeGreaterThan(0);

    engine.setWind(-3.0); // should clamp to -2
    expect(engine.targetWind).toBe(-2);
    engine.stop();
  });

  it("supports intensity adjustments (gentle, normal, stormy)", () => {
    const engine = new WeatherEngine(canvas);
    engine.setMode("rain");
    expect(engine.particles.length).toBe(28);

    engine.setIntensity("gentle");
    expect(engine.intensity).toBe("gentle");
    expect(engine.particles.length).toBe(17);

    engine.setIntensity("stormy");
    expect(engine.intensity).toBe("stormy");
    expect(engine.particles.length).toBe(45);

    engine.setIntensity("invalid_level");
    expect(engine.intensity).toBe("normal");
    expect(engine.particles.length).toBe(28);
    engine.stop();
  });

  it("falls back gracefully when canvas getContext is unavailable", () => {
    const engine = new WeatherEngine(null);
    expect(() => engine.setMode("rain")).not.toThrow();
    expect(() => engine.setWind(1)).not.toThrow();
    expect(() => engine.setIntensity("gentle")).not.toThrow();
    expect(() => engine.renderFrame()).not.toThrow();
    expect(() => engine.stop()).not.toThrow();
    expect(() => engine.dispose()).not.toThrow();
  });
});
