import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DollViewer, drawDollFace, AFFINITY_AURAS, getUnlockedAura } from "../src/services/doll-viewer.js";

describe("drawDollFace", () => {
  let context;

  beforeEach(() => {
    context = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "",
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders open face with default gaze coordinates", () => {
    drawDollFace(context, "open", 0, 0);

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 512, 512);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 512, 512);
    // Should draw pupils and catchlights
    expect(context.arc).toHaveBeenCalled();
    expect(context.fill).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
  });

  it("shifts gaze pupils and catchlights with lookYaw and lookPitch", () => {
    const fillStyles = [];
    Object.defineProperty(context, "fillStyle", {
      get() {
        return this._style || "";
      },
      set(val) {
        fillStyles.push(val);
        this._style = val;
      },
      configurable: true,
    });
    drawDollFace(context, "open", 0.3, -0.15);

    expect(context.arc).toHaveBeenCalled();
    // Catchlight colors should be set during render
    expect(fillStyles.some((s) => s.includes("rgba(255, 255, 255"))).toBe(true);
  });

  it("renders closed eyes when mode is closed", () => {
    drawDollFace(context, "closed");

    expect(context.arc).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
  });

  it("renders half-squinting dreamy eyes when mode is half", () => {
    drawDollFace(context, "half");

    expect(context.ellipse).toHaveBeenCalled();
    expect(context.fill).toHaveBeenCalled();
  });

  it("renders joy face with blushing cheeks and smile", () => {
    drawDollFace(context, "joy");

    expect(context.arc).toHaveBeenCalled();
    expect(context.fillStyle).toContain("rgba(240, 115, 130");
  });

  it("renders sleep face with gentle curve", () => {
    drawDollFace(context, "sleep");

    expect(context.arc).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
  });

  it("transitions timer states between focusing, resting, and idle", () => {
    const fakeViewer = {
      timerState: "idle",
      studyBook: { visible: false },
      celebrationStartTime: 0,
      triggerBounce: vi.fn(),
      arms: [{ rotation: { set: vi.fn() } }, { rotation: { set: vi.fn() } }],
      head: { rotation: { x: 0 } },
    };
    fakeViewer.setTimerState = DollViewer.prototype.setTimerState.bind(fakeViewer);

    fakeViewer.setTimerState("focusing");
    expect(fakeViewer.timerState).toBe("focusing");
    expect(fakeViewer.studyBook.visible).toBe(true);

    fakeViewer.setTimerState("resting");
    expect(fakeViewer.timerState).toBe("resting");
    expect(fakeViewer.studyBook.visible).toBe(false);

    fakeViewer.setTimerState("completed");
    expect(fakeViewer.timerState).toBe("completed");
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();

    fakeViewer.setTimerState("idle");
    expect(fakeViewer.timerState).toBe("idle");
    expect(fakeViewer.arms[0].rotation.set).toHaveBeenCalledWith(0, 0, -0.48);
  });

  it("calculates unlocked aura tiers based on affinity level", () => {
    expect(AFFINITY_AURAS.none.minLevel).toBe(1);
    expect(AFFINITY_AURAS.warm_glow.minLevel).toBe(3);
    expect(AFFINITY_AURAS.starlight.minLevel).toBe(5);
    expect(AFFINITY_AURAS.aurora.minLevel).toBe(7);
    expect(AFFINITY_AURAS.crown.minLevel).toBe(10);

    expect(getUnlockedAura(1)).toBe("none");
    expect(getUnlockedAura(2)).toBe("none");
    expect(getUnlockedAura(3)).toBe("warm_glow");
    expect(getUnlockedAura(4)).toBe("warm_glow");
    expect(getUnlockedAura(5)).toBe("starlight");
    expect(getUnlockedAura(6)).toBe("starlight");
    expect(getUnlockedAura(7)).toBe("aurora");
    expect(getUnlockedAura(9)).toBe("aurora");
    expect(getUnlockedAura(10)).toBe("crown");
  });

  it("sets affinity aura on viewer and updates aura group visibility", () => {
    const fakeChildren = [];
    const fakeAuraGroup = {
      visible: false,
      children: fakeChildren,
      add: vi.fn((mesh) => fakeChildren.push(mesh)),
      remove: vi.fn((mesh) => {
        const idx = fakeChildren.indexOf(mesh);
        if (idx !== -1) fakeChildren.splice(idx, 1);
      }),
    };
    const fakeViewer = {
      auraGroup: fakeAuraGroup,
      currentAura: "none",
    };
    fakeViewer.setAffinityAura = DollViewer.prototype.setAffinityAura.bind(fakeViewer);

    // Test none
    fakeViewer.setAffinityAura("none");
    expect(fakeViewer.currentAura).toBe("none");
    expect(fakeAuraGroup.visible).toBe(false);

    // Test warm_glow
    fakeViewer.setAffinityAura("warm_glow");
    expect(fakeViewer.currentAura).toBe("warm_glow");
    expect(fakeAuraGroup.visible).toBe(true);
    expect(fakeAuraGroup.add).toHaveBeenCalled();

    // Reset back to none
    fakeViewer.setAffinityAura("none");
    expect(fakeAuraGroup.visible).toBe(false);
  });
});
