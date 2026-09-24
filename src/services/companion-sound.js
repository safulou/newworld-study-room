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

  /**
   * Play a gentle soothing purr / chime when the doll is stroked / petted
   */
  playPettingPurr() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 698.46, delay: 0.0, dur: 0.18 }, // F5
      { freq: 880.0, delay: 0.06, dur: 0.22 }, // A5
      { freq: 1046.5, delay: 0.12, dur: 0.35 }, // C6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peakGain = 0.14 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play a sparkling harmonic tone for peer emoji reactions
   */
  playReactionChime(emoji = "🔥") {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqMap = {
      "💡": [880, 1174.66, 1760], // A5, D6, A6 (bright idea)
      "🔥": [587.33, 880, 1174.66], // D5, A5, D6 (warm energy)
      "☕": [523.25, 659.25, 783.99], // C5, E5, G5 (cozy chord)
      "✨": [1046.5, 1318.51, 1567.98, 2093], // C6, E6, G6, C7 (shimmering sparkle)
      "💯": [659.25, 880, 1318.51], // E5, A5, E6 (triumphant)
      "🌱": [440, 554.37, 659.25], // A4, C#5, E5 (pastoral sprout)
    };
    const freqs = freqMap[emoji] || [783.99, 1046.5, 1318.51];

    freqs.forEach((freq, idx) => {
      const delay = idx * 0.045;
      const dur = 0.24;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peakGain = 0.12 * this.volume;
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
   * Play an authentic hollow wooden fish (木魚) temple strike
   * Synthesizes rapid pitch drop and cavity resonance bandpass filtering.
   */
  playWoodenFish() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 0.16;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(860, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.028);
    osc.frequency.exponentialRampToValueAtTime(320, now + dur);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(560, now);
    filter.Q.setValueAtTime(4.2, now);

    const gain = ctx.createGain();
    const peakGain = 0.42 * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /**
   * Play a deep, resonant Tibetan Singing Bowl (西藏頌缽) meditative chime
   * Multi-frequency harmonic beating with a 3.8s peaceful reverberation envelope.
   */
  playSingingBowl() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 3.8;

    const partials = [
      { freq: 216.0, gainMult: 0.32 },
      { freq: 217.6, gainMult: 0.28 },
      { freq: 594.0, gainMult: 0.14 },
      { freq: 596.2, gainMult: 0.11 },
      { freq: 1040.0, gainMult: 0.05 },
      { freq: 1520.0, gainMult: 0.02 },
    ];

    partials.forEach(({ freq, gainMult }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const peakGain = gainMult * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur + 0.05);
    });
  }
}
