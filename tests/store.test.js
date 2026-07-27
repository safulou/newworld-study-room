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
    first.update({ nickname: "Mina", roomName: "Room A" });

    const second = createStore({ roomId: "room-b", includeStarterTips: false });
    expect(second.get().nickname).toBe("Mina");
    expect(second.get().roomName).toBe("Midnight Study Room");
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
});
