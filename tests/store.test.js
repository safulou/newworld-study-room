import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStore } from "../src/state/store.js";

const tip = {
  id: "tip-1",
  by: "Alice",
  text: "繼續加油",
  createdAt: 100,
  direction: "outgoing",
  delivery: "pending",
};

describe("room-scoped store", () => {
  beforeEach(() => localStorage.clear());

  it("keeps Tip history isolated between rooms", () => {
    const roomA = createStore({ roomId: "room-a", includeStarterTips: false });
    roomA.addTip(tip, "outgoing");

    const roomB = createStore({ roomId: "room-b", includeStarterTips: false });
    expect(roomB.get().tips).toEqual([]);
    expect(createStore({ roomId: "room-a", includeStarterTips: false }).get().tips).toHaveLength(1);
  });

  it("shares personal preferences without sharing room data", () => {
    const first = createStore({ roomId: "room-a", includeStarterTips: false });
    first.update({ nickname: "Mina", companionMode: "standee", plantType: "pine", roomName: "Room A" });

    const second = createStore({ roomId: "room-b", includeStarterTips: false });
    expect(second.get().nickname).toBe("Mina");
    expect(second.get().companionMode).toBe("standee");
    expect(second.get().plantType).toBe("pine");
    expect(second.get().roomName).toBe("Midnight Study Room");
  });

  it("falls back to a rose for an unknown plant type", () => {
    localStorage.setItem("newworld-study-room:profile:v3", JSON.stringify({ plantType: "unknown" }));
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().plantType).toBe("rose");
  });

  it("falls back to the doll for an unknown companion mode", () => {
    localStorage.setItem("newworld-study-room:profile:v3", JSON.stringify({ companionMode: "poster" }));
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().companionMode).toBe("doll");
  });

  it("validates and defaults heatmapTheme", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().heatmapTheme).toBe("emerald");
    store.update({ heatmapTheme: "cyber" });
    expect(store.get().heatmapTheme).toBe("cyber");
    store.update({ heatmapTheme: "invalid_theme" });
    expect(store.get().heatmapTheme).toBe("emerald");
  });

  it("persists outbox delivery state", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    store.addTip(tip, "outgoing");
    expect(store.getPendingTips()).toHaveLength(1);
    store.markTipDelivery(tip.id, "sent");
    expect(store.getPendingTips()).toHaveLength(0);
    expect(store.get().tips[0].delivery).toBe("sent");
  });

  it("keeps running and drops the photo when profile storage is full", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    store.update({ photo: "data:image/jpeg;base64,large", generation: "ready" });
    expect(store.get().photo).toBe("");
    expect(store.get().generation).toBe("error");
    write.mockRestore();
  });

  it("validates and defaults pomodoro break durations and chime preferences", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().shortBreakMinutes).toBe(5);
    expect(store.get().longBreakMinutes).toBe(15);
    expect(store.get().completionChime).toBe("fanfare");
    expect(store.get().syncWithHostTimer).toBe(false);

    store.update({
      shortBreakMinutes: 10,
      longBreakMinutes: 30,
      completionChime: "wind_chime",
      syncWithHostTimer: true,
    });
    expect(store.get().shortBreakMinutes).toBe(10);
    expect(store.get().longBreakMinutes).toBe(30);
    expect(store.get().completionChime).toBe("wind_chime");
    expect(store.get().syncWithHostTimer).toBe(true);

    // Clamping bounds
    store.update({
      shortBreakMinutes: -5,
      longBreakMinutes: 200,
      completionChime: "unknown_chime",
    });
    expect(store.get().shortBreakMinutes).toBe(1);
    expect(store.get().longBreakMinutes).toBe(60);
    expect(store.get().completionChime).toBe("fanfare");
  });

  it("validates and defaults focusCategory", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().focusCategory).toBe("dev");

    store.update({ focusCategory: "read" });
    expect(store.get().focusCategory).toBe("read");

    store.update({ focusCategory: "invalid_category" });
    expect(store.get().focusCategory).toBe("dev");
  });

  it("validates and sanitizes customPresets", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().customPresets).toEqual([]);

    store.update({
      customPresets: [
        { id: "preset-1", name: "  深夜寫碼  ", tracks: { rain: 0.8, cafe: 1.5, fireplace: -0.2 } },
        { id: "invalid-preset" }, // missing name or tracks
      ],
    });

    const presets = store.get().customPresets;
    expect(presets).toHaveLength(1);
    expect(presets[0].id).toBe("preset-1");
    expect(presets[0].name).toBe("深夜寫碼");
    expect(presets[0].tracks.rain).toBe(0.8);
    expect(presets[0].tracks.cafe).toBe(1); // clamped to 1
    expect(presets[0].tracks.fireplace).toBe(0); // clamped to 0
  });

  it("validates and sanitizes focusIntention and customPresets pans", () => {
    const store = createStore({ roomId: "room-a", includeStarterTips: false });
    expect(store.get().focusIntention).toBe("");

    store.update({ focusIntention: "  攻克使用者認證模組  " });
    expect(store.get().focusIntention).toBe("攻克使用者認證模組");

    store.update({
      customPresets: [
        {
          id: "spatial-1",
          name: "立體聲景",
          tracks: { rain: 0.5 },
          pans: { rain: -1.8, campfire: 0.7 },
        },
      ],
    });

    const preset = store.get().customPresets[0];
    expect(preset.pans.rain).toBe(-1); // clamped to -1
    expect(preset.pans.campfire).toBe(0.7);
  });
});
