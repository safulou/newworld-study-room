import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FocusPosterGenerator, PLANT_FLOWER_LANGUAGES, POSTER_THEMES } from "../src/services/poster-generator.js";

describe("FocusPosterGenerator", () => {
  let originalGetContext;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      scale: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetY: 0,
    });
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("exposes valid flower languages for all plants", () => {
    expect(PLANT_FLOWER_LANGUAGES.rose).toBeDefined();
    expect(PLANT_FLOWER_LANGUAGES.tulip).toBeDefined();
    expect(PLANT_FLOWER_LANGUAGES.cactus).toBeDefined();
    expect(PLANT_FLOWER_LANGUAGES.succulent).toBeDefined();
    expect(PLANT_FLOWER_LANGUAGES.pine).toBeDefined();
  });

  it("exposes all predefined poster ambience themes", () => {
    expect(POSTER_THEMES.midnight).toBeDefined();
    expect(POSTER_THEMES.aurora).toBeDefined();
    expect(POSTER_THEMES.sunset).toBeDefined();
    expect(POSTER_THEMES.forest).toBeDefined();
    expect(POSTER_THEMES.cyber).toBeDefined();

    Object.values(POSTER_THEMES).forEach((theme) => {
      expect(theme.name).toBeDefined();
      expect(theme.emoji).toBeDefined();
      expect(theme.bgGradient).toHaveLength(3);
      expect(theme.aura).toHaveLength(3);
      expect(theme.outerBorder).toBeDefined();
      expect(theme.accent).toBeDefined();
    });
  });

  it("generates cards with each supported theme without throwing", () => {
    const themes = ["midnight", "aurora", "sunset", "forest", "cyber", "unknown_fallback"];
    themes.forEach((theme) => {
      const canvas = FocusPosterGenerator.generate({
        date: "2026-10-02",
        todayMinutes: 90,
        totalHours: 15,
        streakDays: 5,
        theme,
      });
      expect(canvas).toBeDefined();
      expect(canvas.width).toBe(880);
      expect(canvas.height).toBe(1240);
    });
  });

  it("generates a 2x retina canvas without throwing", () => {
    const canvas = FocusPosterGenerator.generate({
      date: "2026-09-29",
      todayMinutes: 125,
      totalHours: 12,
      streakDays: 4,
      topCategory: "dev",
      harvestedPlant: "rose",
      nickname: "Arsen",
      quote: "今天又進步了一大步！",
    });

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(880);
    expect(canvas.height).toBe(1240);
  });

  it("safely handles copyToClipboard when clipboard API is missing or rejects", async () => {
    const canvas = document.createElement("canvas");
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });

    const result = await FocusPosterGenerator.copyToClipboard(canvas);
    expect(result).toBe(false);

    Object.defineProperty(navigator, "clipboard", { value: originalClipboard, configurable: true });
  });

  it("triggers download by clicking a link with dataURL", () => {
    const canvas = document.createElement("canvas");
    canvas.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,sample");
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    FocusPosterGenerator.download(canvas, "test.png");
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/png");
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("generates soundscape cards with each supported theme without throwing", () => {
    const themes = ["midnight", "aurora", "sunset", "forest", "cyber"];
    themes.forEach((theme) => {
      const canvas = FocusPosterGenerator.generateSoundscapeCard({
        name: "暴風雪小木屋",
        tracks: { wind: 0.6, campfire: 0.4 },
        pans: { wind: -0.3, campfire: 0.2 },
        eq: { bass: 2, mid: 0, treble: -1 },
        reverb: { preset: "cabin", wet: 0.3 },
        nickname: "Arsen",
        theme,
      });
      expect(canvas).toBeDefined();
      expect(canvas.width).toBe(880);
      expect(canvas.height).toBe(1240);
    });
  });

  it("generates soundscape card with embedded qrCanvas", () => {
    const mockQr = document.createElement("canvas");
    mockQr.width = 100;
    mockQr.height = 100;

    const canvas = FocusPosterGenerator.generateSoundscapeCard({
      name: "星空自習室",
      tracks: { rain: 0.5, ocean_waves: 0.3 },
      pans: { rain: 0 },
      eq: { bass: 0, mid: 1, treble: 2 },
      reverb: { preset: "cathedral", wet: 0.4 },
      nickname: "Momo",
      theme: "midnight",
      qrCanvas: mockQr,
    });

    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(880);
    expect(canvas.height).toBe(1240);
  });

  it("generates botanical pressed-flower bookmarks across themes", () => {
    const plants = ["rose", "tulip", "cactus", "succulent", "pine", "sunflower", "lavender"];
    plants.forEach((plantKey) => {
      const canvas = FocusPosterGenerator.generateBotanicalBookmark({
        plantKey,
        harvestCount: 5,
        nickname: "Arsen",
        firstHarvestDate: "2026-10-01",
        personalInscription: "寧靜致遠，生生不息。",
        theme: "forest",
      });
      expect(canvas).toBeDefined();
      expect(canvas.width).toBe(760);
      expect(canvas.height).toBe(1640);
    });
  });
});
