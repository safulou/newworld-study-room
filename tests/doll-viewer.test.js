import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DollViewer, drawDollFace } from "../src/services/doll-viewer.js";

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
});
