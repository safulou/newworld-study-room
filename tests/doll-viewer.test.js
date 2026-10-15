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
      traverse: vi.fn((fn) => fakeChildren.forEach(fn)),
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

    // Test co_focus
    fakeViewer.setAffinityAura("co_focus");
    expect(fakeViewer.currentAura).toBe("co_focus");
    expect(fakeAuraGroup.visible).toBe(true);

    // Reset back to none
    fakeViewer.setAffinityAura("none");
    expect(fakeAuraGroup.visible).toBe(false);
  });

  it("triggers wave, nod, and cheer micro-emotes", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
    };
    fakeViewer.triggerWave = DollViewer.prototype.triggerWave.bind(fakeViewer);
    fakeViewer.triggerNod = DollViewer.prototype.triggerNod.bind(fakeViewer);
    fakeViewer.triggerCheer = DollViewer.prototype.triggerCheer.bind(fakeViewer);

    fakeViewer.triggerWave({ side: "left", duration: 1500 });
    expect(fakeViewer.currentEmote).not.toBeNull();
    expect(fakeViewer.currentEmote.type).toBe("wave");
    expect(fakeViewer.currentEmote.side).toBe("left");
    expect(fakeViewer.currentEmote.duration).toBe(1500);
    expect(fakeViewer.lastFaceMode).toBeNull();

    fakeViewer.triggerNod({ duration: 900 });
    expect(fakeViewer.currentEmote.type).toBe("nod");
    expect(fakeViewer.currentEmote.duration).toBe(900);
    expect(fakeViewer.lastFaceMode).toBeNull();

    fakeViewer.triggerCheer({ duration: 1200 });
    expect(fakeViewer.currentEmote.type).toBe("cheer");
    expect(fakeViewer.currentEmote.duration).toBe(1200);
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("transitions atmosphere lighting for focus, shortBreak, and longBreak", () => {
    const fakeViewer = {
      keyLight: { color: { setHex: vi.fn() } },
      hemiLight: { color: { setHex: vi.fn() }, groundColor: { setHex: vi.fn() } },
      rimLight: { color: { setHex: vi.fn() } },
    };
    fakeViewer.setAtmosphereLighting = DollViewer.prototype.setAtmosphereLighting.bind(fakeViewer);

    // Focus mode
    fakeViewer.setAtmosphereLighting("focus");
    expect(fakeViewer.keyLight.color.setHex).toHaveBeenCalledWith(0xffd79a);
    expect(fakeViewer.hemiLight.color.setHex).toHaveBeenCalledWith(0xffe0a3);
    expect(fakeViewer.hemiLight.groundColor.setHex).toHaveBeenCalledWith(0x172437);
    expect(fakeViewer.rimLight.color.setHex).toHaveBeenCalledWith(0x69c8bd);

    // Short break mode
    fakeViewer.setAtmosphereLighting("shortBreak");
    expect(fakeViewer.keyLight.color.setHex).toHaveBeenCalledWith(0xa7f3d0);
    expect(fakeViewer.hemiLight.color.setHex).toHaveBeenCalledWith(0x6ee7b7);
    expect(fakeViewer.hemiLight.groundColor.setHex).toHaveBeenCalledWith(0x064e3b);
    expect(fakeViewer.rimLight.color.setHex).toHaveBeenCalledWith(0x34d399);

    // Long break mode
    fakeViewer.setAtmosphereLighting("longBreak");
    expect(fakeViewer.keyLight.color.setHex).toHaveBeenCalledWith(0xfbcfe8);
    expect(fakeViewer.hemiLight.color.setHex).toHaveBeenCalledWith(0xf472b6);
    expect(fakeViewer.hemiLight.groundColor.setHex).toHaveBeenCalledWith(0x3b0764);
    expect(fakeViewer.rimLight.color.setHex).toHaveBeenCalledWith(0xfbbf24);
  });

  it("calculates acoustic gaze yaw and tilt with clamping", () => {
    const fakeViewer = {
      acousticGazeYaw: 0,
      acousticGazeTilt: 0,
    };
    fakeViewer.setAcousticGaze = DollViewer.prototype.setAcousticGaze.bind(fakeViewer);

    // Center
    fakeViewer.setAcousticGaze(0);
    expect(fakeViewer.acousticGazeYaw).toBeCloseTo(0);
    expect(fakeViewer.acousticGazeTilt).toBeCloseTo(0);

    // Left emitter (-0.8 pan) -> doll turns left (-yaw is positive), tilts head
    fakeViewer.setAcousticGaze(-0.8);
    expect(fakeViewer.acousticGazeYaw).toBeCloseTo(0.28);
    expect(fakeViewer.acousticGazeTilt).toBeCloseTo(-0.096);

    // Clamping beyond boundary (> 1 or < -1)
    fakeViewer.setAcousticGaze(2.5);
    expect(fakeViewer.acousticGazeYaw).toBeCloseTo(-0.35);
    expect(fakeViewer.acousticGazeTilt).toBeCloseTo(0.12);

    fakeViewer.setAcousticGaze(-5);
    expect(fakeViewer.acousticGazeYaw).toBeCloseTo(0.35);
    expect(fakeViewer.acousticGazeTilt).toBeCloseTo(-0.12);
  });

  it("constructs golden_botanist laurel aura meshes", () => {
    const fakeChildren = [];
    const fakeAuraGroup = {
      visible: false,
      children: fakeChildren,
      add: vi.fn((mesh) => fakeChildren.push(mesh)),
      remove: vi.fn(),
      traverse: vi.fn((fn) => fakeChildren.forEach(fn)),
    };
    const fakeViewer = {
      auraGroup: fakeAuraGroup,
      currentAura: "none",
    };
    fakeViewer.setAffinityAura = DollViewer.prototype.setAffinityAura.bind(fakeViewer);

    expect(AFFINITY_AURAS.golden_botanist).toBeDefined();
    expect(AFFINITY_AURAS.golden_botanist.label).toBe("金色桂冠");

    fakeViewer.setAffinityAura("golden_botanist");
    expect(fakeViewer.currentAura).toBe("golden_botanist");
    expect(fakeAuraGroup.visible).toBe(true);
    // 1 torus ring + 8 octahedron leaves = 9 meshes
    expect(fakeAuraGroup.add).toHaveBeenCalledTimes(9);
    expect(fakeAuraGroup.traverse).toHaveBeenCalled();
  });

  it("triggers wish micro-emote with starlight duration and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
    };
    fakeViewer.triggerWish = DollViewer.prototype.triggerWish.bind(fakeViewer);

    fakeViewer.triggerWish({ duration: 2500 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("wish");
    expect(fakeViewer.currentEmote.duration).toBe(2500);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("sets and clamps focus progress smoothly between 0 and 1", () => {
    const fakeViewer = { focusProgress: 0 };
    fakeViewer.setFocusProgress = DollViewer.prototype.setFocusProgress.bind(fakeViewer);

    fakeViewer.setFocusProgress(0.72);
    expect(fakeViewer.focusProgress).toBeCloseTo(0.72);

    fakeViewer.setFocusProgress(1.85);
    expect(fakeViewer.focusProgress).toBe(1.0);

    fakeViewer.setFocusProgress(-0.5);
    expect(fakeViewer.focusProgress).toBe(0.0);
  });

  it("triggers listen micro-emote with direction, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
    };
    fakeViewer.triggerListen = DollViewer.prototype.triggerListen.bind(fakeViewer);

    fakeViewer.triggerListen({ duration: 3000, direction: -0.75 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("listen");
    expect(fakeViewer.currentEmote.duration).toBe(3000);
    expect(fakeViewer.currentEmote.direction).toBeCloseTo(-0.75);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();

    // Clamps direction beyond [-1, 1]
    fakeViewer.triggerListen({ direction: 4.2 });
    expect(fakeViewer.currentEmote.direction).toBe(1.0);
  });

  it("manages accessories visibility including telescope and lantern", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ glasses: true, telescope: true, lantern: true });
    expect(fakeViewer.glassesGroup.visible).toBe(true);
    expect(fakeViewer.crownGroup.visible).toBe(false);
    expect(fakeViewer.telescopeGroup.visible).toBe(true);
    expect(fakeViewer.lanternGroup.visible).toBe(true);
    expect(fakeViewer.lanternLight.intensity).toBeGreaterThan(0);

    fakeViewer.setAccessories({ telescope: false, lantern: false });
    expect(fakeViewer.telescopeGroup.visible).toBe(false);
    expect(fakeViewer.lanternGroup.visible).toBe(false);
    expect(fakeViewer.lanternLight.intensity).toBe(0);
  });

  it("triggers stargaze micro-emote with duration and bounce, detecting telescope", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      telescopeGroup: { visible: false },
    };
    fakeViewer.triggerStargaze = DollViewer.prototype.triggerStargaze.bind(fakeViewer);

    fakeViewer.triggerStargaze({ duration: 3200 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("stargaze");
    expect(fakeViewer.currentEmote.duration).toBe(3200);
    expect(fakeViewer.currentEmote.hasTelescope).toBe(false);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();

    // With visible telescope
    fakeViewer.telescopeGroup.visible = true;
    fakeViewer.triggerStargaze({ duration: 4000 });
    expect(fakeViewer.currentEmote.hasTelescope).toBe(true);
    expect(fakeViewer.currentEmote.duration).toBe(4000);
  });

  it("triggers pageturn micro-emote with duration, page pivot setup, and bounce", () => {
    const fakePivot = { visible: false, rotation: { z: 0 } };
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      studyBook: { visible: false },
      turningPagePivot: fakePivot,
    };
    fakeViewer.triggerPageTurn = DollViewer.prototype.triggerPageTurn.bind(fakeViewer);

    fakeViewer.triggerPageTurn({ duration: 1250 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("pageturn");
    expect(fakeViewer.currentEmote.duration).toBe(1250);
    expect(fakeViewer.studyBook.visible).toBe(true);
    expect(fakePivot.visible).toBe(true);
    expect(fakePivot.rotation.z).toBeCloseTo(-0.18);
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("triggers coffeesip micro-emote with mug visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      coffeeGroup: { visible: false },
    };
    fakeViewer.triggerCoffeeSip = DollViewer.prototype.triggerCoffeeSip.bind(fakeViewer);

    fakeViewer.triggerCoffeeSip({ duration: 1800 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("coffeesip");
    expect(fakeViewer.currentEmote.duration).toBe(1800);
    expect(fakeViewer.coffeeGroup.visible).toBe(true);
    expect(fakeViewer.tempCoffeeVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("triggers petcat micro-emote with kitten visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      catGroup: { visible: false },
    };
    fakeViewer.triggerPetCat = DollViewer.prototype.triggerPetCat.bind(fakeViewer);

    fakeViewer.triggerPetCat({ duration: 2600 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("petcat");
    expect(fakeViewer.currentEmote.duration).toBe(2600);
    expect(fakeViewer.catGroup.visible).toBe(true);
    expect(fakeViewer.tempCatVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("triggers blowcandle micro-emote with candlestick visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      candlestickGroup: { visible: false },
    };
    fakeViewer.triggerBlowCandle = DollViewer.prototype.triggerBlowCandle.bind(fakeViewer);

    fakeViewer.triggerBlowCandle({ duration: 2400 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("blowcandle");
    expect(fakeViewer.currentEmote.duration).toBe(2400);
    expect(fakeViewer.candlestickGroup.visible).toBe(true);
    expect(fakeViewer.tempCandleVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("triggers windchime micro-emote with windchimeGroup visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      windchimeGroup: { visible: false },
    };
    fakeViewer.triggerWindChime = DollViewer.prototype.triggerWindChime.bind(fakeViewer);

    fakeViewer.triggerWindChime({ duration: 2500 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("windchime");
    expect(fakeViewer.currentEmote.duration).toBe(2500);
    expect(fakeViewer.windchimeGroup.visible).toBe(true);
    expect(fakeViewer.tempChimeVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates windchimeGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ windchime: true });
    expect(fakeViewer.windchimeGroup.visible).toBe(true);
    expect(fakeViewer.accessories.windchime).toBe(true);

    fakeViewer.setAccessories({ windchime: false });
    expect(fakeViewer.windchimeGroup.visible).toBe(false);
    expect(fakeViewer.accessories.windchime).toBe(false);
  });

  it("triggers hourglass micro-emote with hourglassGroup visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      hourglassGroup: { visible: false },
    };
    fakeViewer.triggerFlipHourglass = DollViewer.prototype.triggerFlipHourglass.bind(fakeViewer);

    fakeViewer.triggerFlipHourglass({ duration: 2400 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("hourglass");
    expect(fakeViewer.currentEmote.duration).toBe(2400);
    expect(fakeViewer.hourglassGroup.visible).toBe(true);
    expect(fakeViewer.tempHourglassVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates hourglassGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ hourglass: true });
    expect(fakeViewer.hourglassGroup.visible).toBe(true);
    expect(fakeViewer.accessories.hourglass).toBe(true);

    fakeViewer.setAccessories({ hourglass: false });
    expect(fakeViewer.hourglassGroup.visible).toBe(false);
    expect(fakeViewer.accessories.hourglass).toBe(false);
  });

  it("triggers magnifier micro-emote with magnifierGroup visibility setup, duration, and bounce", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      magnifierGroup: { visible: false },
    };
    fakeViewer.triggerInspectCuriosity = DollViewer.prototype.triggerInspectCuriosity.bind(fakeViewer);

    fakeViewer.triggerInspectCuriosity({ duration: 2600 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("magnifier");
    expect(fakeViewer.currentEmote.duration).toBe(2600);
    expect(fakeViewer.magnifierGroup.visible).toBe(true);
    expect(fakeViewer.tempMagnifierVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates magnifierGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
      magnifierGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ magnifier: true });
    expect(fakeViewer.magnifierGroup.visible).toBe(true);
    expect(fakeViewer.accessories.magnifier).toBe(true);

    fakeViewer.setAccessories({ magnifier: false });
    expect(fakeViewer.magnifierGroup.visible).toBe(false);
    expect(fakeViewer.accessories.magnifier).toBe(false);
  });

  it("triggers quill handwriting emote with bounce and duration", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      quillGroup: { visible: false },
    };
    fakeViewer.triggerQuillWriting = DollViewer.prototype.triggerQuillWriting.bind(fakeViewer);

    fakeViewer.triggerQuillWriting({ duration: 2800 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("quill");
    expect(fakeViewer.currentEmote.duration).toBe(2800);
    expect(fakeViewer.quillGroup.visible).toBe(true);
    expect(fakeViewer.tempQuillVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates quillGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
      magnifierGroup: { visible: false },
      quillGroup: { visible: false },
      musicBoxGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ quill: true });
    expect(fakeViewer.quillGroup.visible).toBe(true);
    expect(fakeViewer.accessories.quill).toBe(true);

    fakeViewer.setAccessories({ quill: false });
    expect(fakeViewer.quillGroup.visible).toBe(false);
    expect(fakeViewer.accessories.quill).toBe(false);
  });

  it("triggers music box wind-up emote with bounce and duration", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      musicBoxGroup: { visible: false },
    };
    fakeViewer.triggerMusicBoxWindup = DollViewer.prototype.triggerMusicBoxWindup.bind(fakeViewer);

    fakeViewer.triggerMusicBoxWindup({ duration: 3000 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("musicbox");
    expect(fakeViewer.currentEmote.duration).toBe(3000);
    expect(fakeViewer.musicBoxGroup.visible).toBe(true);
    expect(fakeViewer.tempMusicBoxVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates musicBoxGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
      magnifierGroup: { visible: false },
      quillGroup: { visible: false },
      musicBoxGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ musicBox: true });
    expect(fakeViewer.musicBoxGroup.visible).toBe(true);
    expect(fakeViewer.accessories.musicBox).toBe(true);

    fakeViewer.setAccessories({ musicBox: false });
    expect(fakeViewer.musicBoxGroup.visible).toBe(false);
    expect(fakeViewer.accessories.musicBox).toBe(false);
  });

  it("triggers typewriter typing emote with bounce and duration", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      typewriterGroup: { visible: false },
    };
    fakeViewer.triggerTypewriterTyping = DollViewer.prototype.triggerTypewriterTyping.bind(fakeViewer);

    fakeViewer.triggerTypewriterTyping({ duration: 3000 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("typewriter");
    expect(fakeViewer.currentEmote.duration).toBe(3000);
    expect(fakeViewer.typewriterGroup.visible).toBe(true);
    expect(fakeViewer.tempTypewriterVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates typewriterGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
      magnifierGroup: { visible: false },
      quillGroup: { visible: false },
      musicBoxGroup: { visible: false },
      typewriterGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ typewriter: true });
    expect(fakeViewer.typewriterGroup.visible).toBe(true);
    expect(fakeViewer.accessories.typewriter).toBe(true);

    fakeViewer.setAccessories({ typewriter: false });
    expect(fakeViewer.typewriterGroup.visible).toBe(false);
    expect(fakeViewer.accessories.typewriter).toBe(false);
  });

  it("triggers vinyl needle drop emote with bounce and duration", () => {
    const fakeViewer = {
      currentEmote: null,
      lastFaceMode: "open",
      triggerBounce: vi.fn(),
      gramophoneGroup: { visible: false },
    };
    fakeViewer.triggerVinylRecord = DollViewer.prototype.triggerVinylRecord.bind(fakeViewer);

    fakeViewer.triggerVinylRecord({ duration: 3000 });
    expect(fakeViewer.currentEmote).toBeDefined();
    expect(fakeViewer.currentEmote.type).toBe("gramophone");
    expect(fakeViewer.currentEmote.duration).toBe(3000);
    expect(fakeViewer.gramophoneGroup.visible).toBe(true);
    expect(fakeViewer.tempGramophoneVisible).toBe(true);
    expect(fakeViewer.lastFaceMode).toBeNull();
    expect(fakeViewer.triggerBounce).toHaveBeenCalled();
  });

  it("updates gramophoneGroup visibility in setAccessories", () => {
    const fakeViewer = {
      glassesGroup: { visible: false },
      crownGroup: { visible: false },
      coffeeGroup: { visible: false },
      catGroup: { visible: false },
      telescopeGroup: { visible: false },
      lanternGroup: { visible: false },
      lanternLight: { intensity: 0 },
      candlestickGroup: { visible: false },
      candleLight: { intensity: 0 },
      windchimeGroup: { visible: false },
      hourglassGroup: { visible: false },
      magnifierGroup: { visible: false },
      quillGroup: { visible: false },
      musicBoxGroup: { visible: false },
      typewriterGroup: { visible: false },
      gramophoneGroup: { visible: false },
    };
    fakeViewer.setAccessories = DollViewer.prototype.setAccessories.bind(fakeViewer);

    fakeViewer.setAccessories({ gramophone: true });
    expect(fakeViewer.gramophoneGroup.visible).toBe(true);
    expect(fakeViewer.accessories.gramophone).toBe(true);

    fakeViewer.setAccessories({ gramophone: false });
    expect(fakeViewer.gramophoneGroup.visible).toBe(false);
    expect(fakeViewer.accessories.gramophone).toBe(false);
  });
});
