import { describe, expect, it } from "vitest";
import { p2pInternals } from "../src/services/p2p-room.js";

describe("P2P protocol validation", () => {
  it("requires bounded Tip fields", () => {
    expect(p2pInternals.isTip({ id: "1", by: "A", text: "加油", createdAt: 1 })).toBe(true);
    expect(p2pInternals.isTip({ id: "1", by: "A".repeat(19), text: "加油", createdAt: 1 })).toBe(false);
    expect(p2pInternals.isTip({ id: "1", by: "A", text: "x".repeat(73), createdAt: 1 })).toBe(false);
  });

  it("accepts only safe room identifiers and tokens", () => {
    const token = "a".repeat(32);
    expect(p2pInternals.safeHostId("room_123-abc")).toBe("room_123-abc");
    expect(p2pInternals.safeHostId("../room")).toBe("");
    expect(p2pInternals.safeRoomToken(token)).toBe(token);
    expect(p2pInternals.safeRoomToken("short")).toBe("");
  });
});
