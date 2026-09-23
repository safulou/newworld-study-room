import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationManager } from "../src/services/notification-manager.js";

describe("NotificationManager", () => {
  let manager;
  const originalNotification = globalThis.Notification;

  beforeEach(() => {
    manager = new NotificationManager({ baseTitle: "Study Cabin" });
  });

  afterEach(() => {
    globalThis.Notification = originalNotification;
    vi.restoreAllMocks();
  });

  it("formats tab title for idle state", () => {
    const title = manager.formatTabTitle();
    expect(title).toBe("Study Cabin");
  });

  it("formats tab title for running state", () => {
    const title = manager.formatTabTitle({ remaining: 1455, isRunning: true });
    expect(title).toBe("[🍅 24:15] 專注中 · Study Cabin");
  });

  it("formats tab title for paused state", () => {
    const title = manager.formatTabTitle({ remaining: 1200, isRunning: false, totalSeconds: 1500 });
    expect(title).toBe("[⏸️ 20:00] 暫停中 · Study Cabin");
  });

  it("formats tab title for completed state", () => {
    const title = manager.formatTabTitle({ isCompleted: true });
    expect(title).toBe("[🎉 專注完成！] 輪次結束 · Study Cabin");
  });

  it("detects unsupported notification environment", () => {
    delete globalThis.Notification;
    expect(manager.isSupported()).toBe(false);
    expect(manager.getPermission()).toBe("unsupported");
  });

  it("sends focus complete notification when permission is granted", () => {
    const notificationConstructor = vi.fn();
    globalThis.Notification = notificationConstructor;
    globalThis.Notification.permission = "granted";

    manager.notifyFocusComplete({ taskTitle: "讀完第 3 章" });
    expect(notificationConstructor).toHaveBeenCalledWith(
      "🍅 專注時間結束！",
      expect.objectContaining({
        body: expect.stringContaining("讀完第 3 章"),
        tag: "pomodoro-complete",
      }),
    );
  });

  it("does not send notification when permission is denied or default", () => {
    const notificationConstructor = vi.fn();
    globalThis.Notification = notificationConstructor;
    globalThis.Notification.permission = "denied";

    const result = manager.notifyFocusComplete();
    expect(result).toBeNull();
    expect(notificationConstructor).not.toHaveBeenCalled();
  });

  it("sends tip notification when page is hidden", () => {
    const notificationConstructor = vi.fn();
    globalThis.Notification = notificationConstructor;
    globalThis.Notification.permission = "granted";
    Object.defineProperty(document, "hidden", { value: true, configurable: true });

    manager.notifyTip({ author: "Alice", text: "加油！" });
    expect(notificationConstructor).toHaveBeenCalledWith(
      "💌 Alice 送來了一張 Tip",
      expect.objectContaining({
        body: "加油！",
        tag: "p2p-tip",
      }),
    );
  });
});
