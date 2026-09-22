/**
 * Companion Sound Synthesizer
 * Pure Web Audio API procedural sound effects for doll interactions.
 * Zero external audio dependencies.
 */

export class CompanionSoundManager {
  constructor(volume = 0.4) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.muted = false;
    this.ctx = null;
  }

  ensureContext() {
    if (this.muted) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.ctx) {
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  /**
   * Play a gentle, sparkling chime when the companion doll is tapped
   */
  playTapChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 1046.5, delay: 0.0, dur: 0.28 }, // C6
      { freq: 1318.51, delay: 0.04, dur: 0.32 }, // E6
      { freq: 1567.98, delay: 0.08, dur: 0.45 }, // G6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peakGain = 0.18 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play a celebratory arpeggio fanfare when pomodoro focus finishes
   */
  playCelebrationFanfare() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, delay: 0.0, dur: 0.2 }, // C5
      { freq: 659.25, delay: 0.1, dur: 0.2 }, // E5
      { freq: 783.99, delay: 0.2, dur: 0.25 }, // G5
      { freq: 1046.5, delay: 0.32, dur: 0.6 }, // C6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peakGain = 0.25 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }
}
