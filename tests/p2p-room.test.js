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

  it("defines standard list of peer reaction emojis", () => {
    expect(p2pInternals.REACTION_EMOJIS).toContain("💡");
    expect(p2pInternals.REACTION_EMOJIS).toContain("🔥");
    expect(p2pInternals.REACTION_EMOJIS).toContain("☕");
    expect(p2pInternals.REACTION_EMOJIS.length).toBeGreaterThanOrEqual(5);
  });

  it("validates timer-sync broadcast payload", () => {
    expect(
      p2pInternals.isTimerSync({
        type: "timer-sync",
        mode: "focus",
        remaining: 1200,
        isRunning: true,
        cycleRound: 2,
      }),
    ).toBe(true);

    // Invalid mode
    expect(
      p2pInternals.isTimerSync({
        type: "timer-sync",
        mode: "party",
        remaining: 1200,
        isRunning: true,
        cycleRound: 2,
      }),
    ).toBe(false);

    // Invalid cycleRound
    expect(
      p2pInternals.isTimerSync({
        type: "timer-sync",
        mode: "shortBreak",
        remaining: 300,
        isRunning: false,
        cycleRound: 5,
      }),
    ).toBe(false);
  });

  it("validates peer-interaction payload and actions", () => {
    expect(p2pInternals.INTERACTION_ACTIONS).toEqual(["clink", "knock"]);
    expect(
      p2pInternals.isInteraction({
        type: "peer-interaction",
        action: "clink",
        by: "小森",
      }),
    ).toBe(true);
    expect(
      p2pInternals.isInteraction({
        type: "peer-interaction",
        action: "knock",
        by: "旅人",
      }),
    ).toBe(true);
    expect(
      p2pInternals.isInteraction({
        type: "peer-interaction",
        action: "hug",
        by: "小森",
      }),
    ).toBe(false);
    expect(
      p2pInternals.isInteraction({
        type: "peer-interaction",
        action: "clink",
        by: "A".repeat(20),
      }),
    ).toBe(false);
  });

  it("validates peer-status payload with bounded length", () => {
    expect(p2pInternals.isPeerStatus).toBeDefined();
    expect(
      p2pInternals.isPeerStatus({
        type: "peer-status",
        by: "Arsen",
        status: "focusing",
        intention: "優化系統架構",
        weather: "snow",
        sprintPreset: "deep",
      }),
    ).toBe(true);

    expect(
      p2pInternals.isPeerStatus({
        type: "peer-status",
        by: "",
        status: "focusing",
      }),
    ).toBe(false);

    expect(
      p2pInternals.isPeerStatus({
        type: "peer-status",
        by: "A".repeat(20),
        status: "focusing",
      }),
    ).toBe(false);
  });

  it("validates soundscape-sync payload", () => {
    expect(p2pInternals.isSoundscapeSync).toBeDefined();
    expect(
      p2pInternals.isSoundscapeSync({
        type: "soundscape-sync",
        by: "HostArsen",
        tracks: { rain: 0.6, campfire: 0.3 },
        pans: { rain: -0.2 },
        eq: { bass: 2, mid: 0, treble: -1 },
        reverb: { preset: "cabin", wet: 0.2 },
      }),
    ).toBe(true);

    // Invalid type
    expect(
      p2pInternals.isSoundscapeSync({
        type: "invalid",
        by: "Host",
        tracks: {},
      }),
    ).toBe(false);

    // Missing tracks object
    expect(
      p2pInternals.isSoundscapeSync({
        type: "soundscape-sync",
        by: "Host",
        tracks: null,
      }),
    ).toBe(false);

    // Nickname too long
    expect(
      p2pInternals.isSoundscapeSync({
        type: "soundscape-sync",
        by: "A".repeat(20),
        tracks: {},
      }),
    ).toBe(false);
  });

  it("validates bookmark-gift payload", () => {
    expect(p2pInternals.isBookmarkGift).toBeDefined();
    expect(
      p2pInternals.isBookmarkGift({
        type: "bookmark-gift",
        bookmark: {
          plantKey: "rose",
          harvestCount: 5,
          senderNickname: "Arsen",
          personalInscription: "寧靜致遠",
          theme: "forest",
        },
      }),
    ).toBe(true);

    // Missing bookmark
    expect(
      p2pInternals.isBookmarkGift({
        type: "bookmark-gift",
      }),
    ).toBe(false);

    // Invalid type
    expect(
      p2pInternals.isBookmarkGift({
        type: "other",
        bookmark: { plantKey: "rose", senderNickname: "Arsen" },
      }),
    ).toBe(false);
  });
});
