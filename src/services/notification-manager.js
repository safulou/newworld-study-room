export class NotificationManager {
  constructor({ baseTitle = "NewWorld Study Room" } = {}) {
    this.baseTitle = baseTitle;
  }

  isSupported() {
    return typeof window !== "undefined" && "Notification" in window;
  }

  getPermission() {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isSupported()) return "unsupported";
    try {
      return await Notification.requestPermission();
    } catch {
      return "denied";
    }
  }

  formatTabTitle({ remaining, isRunning, isCompleted, totalSeconds = 1500 } = {}) {
    if (isCompleted) {
      return `[🎉 專注完成！] 輪次結束 · ${this.baseTitle}`;
    }
    if (isRunning && typeof remaining === "number") {
      const mins = Math.floor(remaining / 60)
        .toString()
        .padStart(2, "0");
      const secs = Math.floor(remaining % 60)
        .toString()
        .padStart(2, "0");
      return `[🍅 ${mins}:${secs}] 專注中 · ${this.baseTitle}`;
    }
    if (!isRunning && typeof remaining === "number" && remaining < totalSeconds && remaining > 0) {
      const mins = Math.floor(remaining / 60)
        .toString()
        .padStart(2, "0");
      const secs = Math.floor(remaining % 60)
        .toString()
        .padStart(2, "0");
      return `[⏸️ ${mins}:${secs}] 暫停中 · ${this.baseTitle}`;
    }
    return this.baseTitle;
  }

  updateTitle(options = {}) {
    if (typeof document === "undefined") return;
    document.title = this.formatTabTitle(options);
  }

  notifyFocusComplete({ plantLabel = "", taskTitle = "" } = {}) {
    if (!this.isSupported() || this.getPermission() !== "granted") return null;
    let body = "太棒了！輪次結束，伴讀玩偶提醒您起來喝杯水、伸伸懶腰吧 ☕";
    if (taskTitle) {
      body = `太棒了！已推進「${taskTitle}」。伴讀玩偶提醒您起來喝杯水 ☕`;
    } else if (plantLabel) {
      body = `太棒了！您的${plantLabel}已成長綻放。起來喝杯水、活動筋骨吧 ☕`;
    }
    try {
      const notification = new Notification("🍅 專注時間結束！", {
        body,
        icon: "./icon-192.svg",
        tag: "pomodoro-complete",
      });
      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        notification.close();
      };
      return notification;
    } catch {
      return null;
    }
  }

  notifyTip({ author = "同房夥伴", text = "" } = {}) {
    if (!this.isSupported() || this.getPermission() !== "granted") return null;
    if (typeof document !== "undefined" && !document.hidden) return null;
    try {
      const notification = new Notification(`💌 ${author} 送來了一張 Tip`, {
        body: text || "有一張新紙條飄進小木屋了！",
        icon: "./icon-192.svg",
        tag: "p2p-tip",
      });
      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        notification.close();
      };
      return notification;
    } catch {
      return null;
    }
  }
}
