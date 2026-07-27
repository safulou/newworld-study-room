export class FocusTimer extends EventTarget {
  constructor(minutes) {
    super();
    this.minutes = minutes;
    this.remaining = minutes * 60;
    this.interval = null;
  }

  setMinutes(minutes) {
    this.minutes = Math.max(5, Math.min(120, Number(minutes) || 25));
    this.reset();
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
        this.dispatchEvent(new Event("complete"));
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
