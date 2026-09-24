export class FocusTimer extends EventTarget {
  constructor(minutes = 25) {
    super();
    this.focusMinutes = Math.max(5, Math.min(120, Number(minutes) || 25));
    this.shortBreakMinutes = 5;
    this.longBreakMinutes = 15;
    this.mode = "focus"; // "focus" | "shortBreak" | "longBreak"
    this.minutes = this.focusMinutes;
    this.remaining = this.minutes * 60;
    this.cycleRound = 1;
    this.completedRounds = 0;
    this.interval = null;
  }

  setMinutes(minutes) {
    this.focusMinutes = Math.max(5, Math.min(120, Number(minutes) || 25));
    if (this.mode === "focus") {
      this.minutes = this.focusMinutes;
      this.reset();
    }
  }

  setBreakDurations({ shortBreak = 5, longBreak = 15 } = {}) {
    this.shortBreakMinutes = Math.max(1, Math.min(30, Number(shortBreak) || 5));
    this.longBreakMinutes = Math.max(5, Math.min(60, Number(longBreak) || 15));
    if (this.mode === "shortBreak") {
      this.minutes = this.shortBreakMinutes;
      this.reset();
    } else if (this.mode === "longBreak") {
      this.minutes = this.longBreakMinutes;
      this.reset();
    }
  }

  setMode(mode, customMinutes = null) {
    const validModes = ["focus", "shortBreak", "longBreak"];
    this.mode = validModes.includes(mode) ? mode : "focus";

    if (this.mode === "focus") {
      this.minutes = Math.max(5, Math.min(120, Number(customMinutes) || this.focusMinutes));
    } else if (this.mode === "shortBreak") {
      this.minutes = Math.max(1, Math.min(30, Number(customMinutes) || this.shortBreakMinutes));
    } else if (this.mode === "longBreak") {
      this.minutes = Math.max(5, Math.min(60, Number(customMinutes) || this.longBreakMinutes));
    }

    this.reset();
    this.dispatchEvent(
      new CustomEvent("mode-change", {
        detail: {
          mode: this.mode,
          minutes: this.minutes,
          cycleRound: this.cycleRound,
          completedRounds: this.completedRounds,
        },
      }),
    );
  }

  advanceMode() {
    if (this.mode === "focus") {
      this.completedRounds++;
      if (this.completedRounds % 4 === 0) {
        this.setMode("longBreak");
      } else {
        this.setMode("shortBreak");
      }
    } else {
      this.cycleRound = (this.completedRounds % 4) + 1;
      this.setMode("focus");
    }
    return this.mode;
  }

  toggle() {
    if (this.interval) this.pause();
    else this.start();
  }

  start() {
    if (this.interval) return;
    const endAt = Date.now() + this.remaining * 1000;
    this.interval = window.setInterval(() => {
      this.remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      this.emitTick();
      if (this.remaining === 0) {
        this.pause();
        this.dispatchEvent(
          new CustomEvent("complete", {
            detail: {
              mode: this.mode,
              cycleRound: this.cycleRound,
              completedRounds: this.completedRounds,
            },
          }),
        );
      }
    }, 250);
    this.dispatchEvent(new CustomEvent("running", { detail: true }));
  }

  pause() {
    window.clearInterval(this.interval);
    this.interval = null;
    this.dispatchEvent(new CustomEvent("running", { detail: false }));
  }

  reset() {
    this.pause();
    this.remaining = this.minutes * 60;
    this.emitTick();
  }

  emitTick() {
    this.dispatchEvent(new CustomEvent("tick", { detail: this.remaining }));
  }
}
