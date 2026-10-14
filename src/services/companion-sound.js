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

  /**
   * Play procedural celestial breeze wind chimes
   */
  playWindChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chimePitches = [1318.51, 1567.98, 1760.0, 2093.0, 2637.02]; // E6, G6, A6, C7, E7
    const delays = [0, 0.08, 0.19, 0.29, 0.42];

    chimePitches.forEach((freq, idx) => {
      const start = now + delays[idx];
      const dur = 2.4;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      const peakGain = 0.11 * this.volume;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  }

  /**
   * Play chosen focus completion bell/chime
   */
  playCompletionChime(type = "fanfare") {
    switch (type) {
      case "bowl":
        this.playSingingBowl();
        break;
      case "wooden_fish":
        this.playWoodenFish();
        setTimeout(() => this.playWoodenFish(), 180);
        setTimeout(() => this.playWoodenFish(), 360);
        break;
      case "wind_chime":
        this.playWindChime();
        break;
      case "fanfare":
      default:
        this.playCelebrationFanfare();
        break;
    }
  }

  /**
   * Play procedural sound cue for mindful breathing phases
   * @param {"inhale" | "hold" | "exhale" | "rest"} phase
   */
  playBreathingCue(phase = "inhale") {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    if (phase === "inhale") {
      // Gentle ascending swell
      const dur = 1.0;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.8);
      const peakGain = 0.16 * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } else if (phase === "hold") {
      // Gentle calm bell / harmonic tone
      const dur = 0.8;
      osc.frequency.setValueAtTime(392.0, now); // G4
      const peakGain = 0.14 * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } else if (phase === "exhale") {
      // Gentle descending release swell
      const dur = 1.2;
      osc.frequency.setValueAtTime(329.63, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.9);
      const peakGain = 0.15 * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } else {
      // Rest phase
      const dur = 0.7;
      osc.frequency.setValueAtTime(196.0, now); // G3
      const peakGain = 0.12 * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    }
  }

  /**
   * Play crystal ceramic/glass clink for peer toast reaction
   */
  playCupClink() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const frequencies = [2093, 4186, 6279];
    const weights = [1, 0.45, 0.18];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      const peak = 0.14 * weights[idx] * this.volume;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  /**
   * Play warm wooden table double-knock ASMR sound
   */
  playDeskKnock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0.0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(145, now + offset);
      osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.07);
      const peak = 0.22 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(peak, now + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  /**
   * Play gentle celestial crystal wind-down chime when focus approaches completion (last 3m/1m)
   */
  playWindDownChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 880.0, delay: 0.0, dur: 0.8 }, // A5
      { freq: 1108.73, delay: 0.12, dur: 0.9 }, // C#6
      { freq: 1318.51, delay: 0.24, dur: 1.2 }, // E6
    ];
    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);
      const peak = 0.08 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peak, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play an antique mechanical clockwork / wooden escapement tick
   * @param {Object} [options]
   * @param {boolean} [options.isTock=false] - Alternate between tick and tock
   * @param {string} [options.mode='wood'] - 'wood' (soft wooden click) or 'crisp' (antique gear watch escapement)
   * @param {number} [options.volume=1] - Volume multiplier (0~1)
   */
  playClockworkTick({ isTock = false, mode = "wood", volume = 1 } = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = Math.max(0, Math.min(1, volume)) * this.volume;
    if (masterGain <= 0.0001) return;

    if (mode === "crisp") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = isTock ? 2489 : 3136;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.015);

      const peak = 0.08 * masterGain;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.022);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = isTock ? 620 : 880;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.028);

      const peak = 0.12 * masterGain;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  /**
   * Play a bright, cheerful upward greeting chime for doll waving micro-emote
   */
  playGreetingWave() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 880.0, delay: 0.0, dur: 0.22 }, // A5
      { freq: 1174.66, delay: 0.07, dur: 0.35 }, // D6
      { freq: 1567.98, delay: 0.14, dur: 0.48 }, // G6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peak = 0.15 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peak, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play a warm marimba/wood double-tap tone for doll affirmative nod micro-emote
   */
  playAffirmativeNod() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 587.33, delay: 0.0, dur: 0.12 }, // D5
      { freq: 783.99, delay: 0.09, dur: 0.18 }, // G5
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + delay + dur);

      const peak = 0.14 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.03);
    });
  }

  /**
   * Play an ethereal, crystalline arpeggio shimmer for doll starlight wish micro-emote
   */
  playStarWishChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // D6, F#6, A6, D7 crystalline harmonic cascade
    const notes = [
      { freq: 1174.66, delay: 0.0, dur: 0.35 }, // D6
      { freq: 1479.98, delay: 0.08, dur: 0.42 }, // F#6
      { freq: 1760.0, delay: 0.16, dur: 0.55 }, // A6
      { freq: 2349.32, delay: 0.24, dur: 0.8 }, // D7
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peak = 0.16 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peak, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play an ethereal crystalline delivery chime when receiving/sending a gift or bookmark
   */
  playDeliveryChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 698.46, delay: 0.0, dur: 0.35 }, // F5
      { freq: 880.0, delay: 0.06, dur: 0.38 }, // A5
      { freq: 1046.5, delay: 0.12, dur: 0.45 }, // C6
      { freq: 1318.51, delay: 0.18, dur: 0.65 }, // E6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peak = 0.16 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play an airy resonant pure-fifth harmonic chime for acoustic listening / spatial orientation
   */
  playAcousticListenChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 1318.51, delay: 0.0, dur: 0.38 }, // E6
      { freq: 1975.53, delay: 0.09, dur: 0.65 }, // B6 (Pure fifth)
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peak = 0.14 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play a dreamy celestial harp arpeggio when stargazing at the night sky
   * Upward pentatonic harp cascade (F#5, G#5, A#5, C#6, D#6)
   */
  playStargazeChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 739.99, delay: 0.0, dur: 0.35 }, // F#5
      { freq: 830.61, delay: 0.07, dur: 0.38 }, // G#5
      { freq: 932.33, delay: 0.14, dur: 0.42 }, // A#5
      { freq: 1108.73, delay: 0.21, dur: 0.48 }, // C#6
      { freq: 1244.51, delay: 0.28, dur: 0.75 }, // D#6
    ];

    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      const peak = 0.15 * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play an organic ASMR book page turn and paper friction rustle sound
   * Dual bandpass-swept noise burst simulating book paper leafing through
   */
  playPageTurnRustle() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.32);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.Q.setValueAtTime(1.8, now);
    bandpass.frequency.setValueAtTime(1600, now);
    bandpass.frequency.exponentialRampToValueAtTime(3200, now + 0.16);
    bandpass.frequency.exponentialRampToValueAtTime(2100, now + 0.3);

    const gain = ctx.createGain();
    const peak = 0.16 * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.45), now + 0.12);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.8), now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.31);

    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.32);
  }

  /**
   * Play an authentic ASMR warm coffee/tea sip followed by a delicate porcelain clink
   * Phase 1: Soft liquid inhalation bandpass-swept noise
   * Phase 2: Gentle cup-on-saucer porcelain clink
   */
  playCoffeeSip() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Phase 1: Gentle warm liquid sip noise (0.24s)
    const sipDuration = 0.24;
    const bufferSize = Math.floor(ctx.sampleRate * sipDuration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const sipFilter = ctx.createBiquadFilter();
    sipFilter.type = "bandpass";
    sipFilter.Q.setValueAtTime(2.4, now);
    sipFilter.frequency.setValueAtTime(380, now);
    sipFilter.frequency.exponentialRampToValueAtTime(760, now + 0.14);
    sipFilter.frequency.exponentialRampToValueAtTime(450, now + sipDuration);

    const sipGain = ctx.createGain();
    const sipPeak = 0.12 * this.volume;
    sipGain.gain.setValueAtTime(0.0001, now);
    sipGain.gain.linearRampToValueAtTime(sipPeak, now + 0.05);
    sipGain.gain.exponentialRampToValueAtTime(0.0001, now + sipDuration);

    noiseSource.connect(sipFilter);
    sipFilter.connect(sipGain);
    sipGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + sipDuration + 0.02);

    // Phase 2: Delicate teacup porcelain clink on saucer
    const clinkDelay = 0.32;
    const clinkFreqs = [783.99, 1567.98, 2349.32]; // G5, G6, D7
    clinkFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + clinkDelay);
      const clinkPeak = (idx === 0 ? 0.09 : 0.04) * this.volume;
      const decay = idx === 0 ? 0.12 : 0.08;
      gain.gain.setValueAtTime(0.0001, now + clinkDelay);
      gain.gain.linearRampToValueAtTime(clinkPeak, now + clinkDelay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + clinkDelay + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + clinkDelay);
      osc.stop(now + clinkDelay + decay + 0.02);
    });
  }

  /**
   * Play a pure, crystalline morning dewdrop falling on a leaf / water surface (ASMR water drop)
   * Pitch glides quickly upward with deep hollow water resonance
   */
  playDewDropSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Upward pitch-gliding droplet burst
    const oscDrop = ctx.createOscillator();
    const gainDrop = ctx.createGain();
    oscDrop.type = "sine";
    oscDrop.frequency.setValueAtTime(1180, now);
    oscDrop.frequency.exponentialRampToValueAtTime(1920, now + 0.038);
    oscDrop.frequency.exponentialRampToValueAtTime(1450, now + 0.075);

    const dropPeak = 0.15 * this.volume;
    gainDrop.gain.setValueAtTime(0.0001, now);
    gainDrop.gain.linearRampToValueAtTime(dropPeak, now + 0.008);
    gainDrop.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    oscDrop.connect(gainDrop);
    gainDrop.connect(ctx.destination);
    oscDrop.start(now);
    oscDrop.stop(now + 0.09);

    // Deep sub-octave water body resonance
    const oscBody = ctx.createOscillator();
    const gainBody = ctx.createGain();
    oscBody.type = "sine";
    oscBody.frequency.setValueAtTime(440, now);
    oscBody.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    const bodyPeak = 0.07 * this.volume;
    gainBody.gain.setValueAtTime(0.0001, now);
    gainBody.gain.linearRampToValueAtTime(bodyPeak, now + 0.006);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    oscBody.connect(gainBody);
    gainBody.connect(ctx.destination);
    oscBody.start(now);
    oscBody.stop(now + 0.12);
  }

  /**
   * Play a procedural kitten purring sound (ASMR purr)
   * Deep sub-bass triangle wave at ~32Hz modulated by a 24Hz tremolo LFO and 0.6Hz breathing cycle
   * Filtered through a warm 160Hz lowpass filter to mimic cat chest vibration.
   */
  playKittenPurr(duration = 2.4) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.6, duration);

    // Carrier: Warm sub-bass triangle wave (32Hz)
    const carrier = ctx.createOscillator();
    carrier.type = "triangle";
    carrier.frequency.setValueAtTime(32, now);

    // Lowpass filter to muffle harsh harmonics and retain deep chest resonance
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(160, now);
    filter.Q.setValueAtTime(1.2, now);

    // Tremolo LFO for rapid throat motor flutter (~24Hz)
    const tremoloLFO = ctx.createOscillator();
    tremoloLFO.type = "sine";
    tremoloLFO.frequency.setValueAtTime(24, now);

    const tremoloGain = ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.45, now);

    // Respiration LFO for gentle inhale/exhale swell (~0.6Hz)
    const breathLFO = ctx.createOscillator();
    breathLFO.type = "sine";
    breathLFO.frequency.setValueAtTime(0.6, now);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.2, now);

    // Master purr gain with smooth fade-in and fade-out envelope
    const masterPurrGain = ctx.createGain();
    const peakGain = 0.28 * this.volume;
    masterPurrGain.gain.setValueAtTime(0.0001, now);
    masterPurrGain.gain.linearRampToValueAtTime(peakGain, now + 0.3);
    masterPurrGain.gain.setValueAtTime(peakGain, now + dur - 0.4);
    masterPurrGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // Wire up modulation: Carrier -> Filter -> masterPurrGain -> Destination
    tremoloLFO.connect(tremoloGain);
    breathLFO.connect(breathGain);
    tremoloGain.connect(masterPurrGain.gain);
    breathGain.connect(masterPurrGain.gain);

    carrier.connect(filter);
    filter.connect(masterPurrGain);
    masterPurrGain.connect(ctx.destination);

    carrier.start(now);
    tremoloLFO.start(now);
    breathLFO.start(now);

    carrier.stop(now + dur + 0.05);
    tremoloLFO.stop(now + dur + 0.05);
    breathLFO.stop(now + dur + 0.05);
  }

  /**
   * Play an ethereal micro-arpeggio chime when a butterfly flutters off a bloom
   * Delicate crystal notes in ascending triad (680Hz -> 1020Hz -> 1360Hz) with rapid sparkling decay
   */
  playButterflyFlutterSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [680, 1020, 1360];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const startTime = now + idx * 0.045;
      const decay = 0.22;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + decay);

      const notePeak = (0.12 / (idx + 1)) * this.volume;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(notePeak, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + decay + 0.02);
    });
  }

  /**
   * Play a gentle human breath / soft breeze exhale sound (blowing candle)
   * Swept bandpass white noise (420Hz -> 820Hz -> 380Hz) with smooth organic breath envelope
   */
  playBreezeBreath(duration = 0.85) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.3, duration);

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(2.2, now);
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(820, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(380, now + dur);

    const gain = ctx.createGain();
    const peak = 0.22 * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + dur + 0.05);
  }

  /**
   * Play a delicate botanical water mist spritz sound (ASMR plant misting)
   * High-frequency airy bandpass noise (4.2kHz -> 6.8kHz) with gentle dual-pulse mist envelope
   */
  playWaterMistSound(duration = 0.45) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.2, duration);

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(1.8, now);
    filter.frequency.setValueAtTime(4200, now);
    filter.frequency.linearRampToValueAtTime(6800, now + dur * 0.3);
    filter.frequency.exponentialRampToValueAtTime(3200, now + dur);

    const gain = ctx.createGain();
    const peak = 0.18 * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + dur + 0.05);
  }

  /**
   * Play an ethereal Japanese glass/brass wind chime ASMR sound
   * Synthesizes crystalline bell overtones (pentatonic scale C7, E7, G7, B7) + soft bamboo clapper transient
   */
  playWindChimeSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Soft wooden clapper transient tap
    const clapperOsc = ctx.createOscillator();
    const clapperGain = ctx.createGain();
    clapperOsc.type = "sine";
    clapperOsc.frequency.setValueAtTime(380, now);
    clapperOsc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
    clapperGain.gain.setValueAtTime(0.0001, now);
    clapperGain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.003);
    clapperGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    clapperOsc.connect(clapperGain);
    clapperGain.connect(ctx.destination);
    clapperOsc.start(now);
    clapperOsc.stop(now + 0.06);

    // 2. Chime bell notes with crystal decay
    const notes = [
      { freq: 2093.0, delay: 0.002, dur: 2.1, gain: 0.12 }, // C7
      { freq: 2637.02, delay: 0.016, dur: 1.9, gain: 0.1 }, // E7
      { freq: 3135.96, delay: 0.034, dur: 2.3, gain: 0.09 }, // G7
      { freq: 3951.07, delay: 0.052, dur: 1.7, gain: 0.07 }, // B7
    ];

    notes.forEach(({ freq, delay, dur, gain: noteVol }) => {
      // Main pure sine bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + delay);

      // Micro inharmonic shimmer overtone (+1.4Hz slight detune)
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(freq * 1.002, now + delay);

      const peak = noteVol * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(peak, now + delay + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur);

      shimmerGain.gain.setValueAtTime(0.0001, now + delay);
      shimmerGain.gain.linearRampToValueAtTime(peak * 0.4, now + delay + 0.006);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + dur * 0.8);

      osc.connect(gain);
      shimmerOsc.connect(shimmerGain);
      gain.connect(ctx.destination);
      shimmerGain.connect(ctx.destination);

      osc.start(now + delay);
      shimmerOsc.start(now + delay);
      osc.stop(now + delay + dur + 0.05);
      shimmerOsc.stop(now + delay + dur + 0.05);
    });
  }

  /**
   * Play gentle botanical leaf/petal friction rustle ASMR
   * Soft swept bandpass noise (850Hz -> 1450Hz -> 720Hz) simulating touching real foliage
   */
  playLeafFrictionSound(duration = 0.22) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.12, duration);

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.28;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(3.2, now);
    filter.frequency.setValueAtTime(850, now);
    filter.frequency.linearRampToValueAtTime(1450, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(720, now + dur);

    const gain = ctx.createGain();
    const peak = 0.14 * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + dur + 0.04);
  }

  /**
   * Play procedural antique hourglass fine sand trickling ASMR
   * Granular dual-bandpass noise with subtle micro-tremolo simulating falling silica grains
   */
  playHourglassSandSound(duration = 2.4) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.8, duration);

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Dual bandpass filter for granular silica sliding + glass micro-clicks
    const filterLow = ctx.createBiquadFilter();
    filterLow.type = "bandpass";
    filterLow.frequency.setValueAtTime(1600, now);
    filterLow.Q.setValueAtTime(2.4, now);

    const filterHigh = ctx.createBiquadFilter();
    filterHigh.type = "bandpass";
    filterHigh.frequency.setValueAtTime(3200, now);
    filterHigh.Q.setValueAtTime(3.8, now);

    const gainNode = ctx.createGain();
    const peak = 0.13 * this.volume;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peak, now + 0.12);
    gainNode.gain.setValueAtTime(peak, now + dur - 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noiseSource.connect(filterLow);
    noiseSource.connect(filterHigh);
    filterLow.connect(gainNode);
    filterHigh.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + dur + 0.05);
  }

  /**
   * Play procedural morning songbird warble chirp ASMR
   * Double-chirp FM sweep with gentle mountain warbler vibrato
   */
  playSongbirdWarbleSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chirps = [
      { startOffset: 0.0, dur: 0.14, startFreq: 2600, peakFreq: 3800, endFreq: 2900, peakGain: 0.12 },
      { startOffset: 0.16, dur: 0.22, startFreq: 2900, peakFreq: 4400, endFreq: 3200, peakGain: 0.15 },
    ];

    chirps.forEach(({ startOffset, dur, startFreq, peakFreq, endFreq, peakGain }) => {
      const start = now + startOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, start);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, start + dur * 0.45);
      osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);

      const targetGain = peakGain * this.volume;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(targetGain, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  }

  /**
   * Play procedural optical lens shimmer and brass tap ASMR for vintage magnifying glass inspection
   * Combines warm brass handle resonance with luminous refractive glass glisten
   */
  playMagnifierInspectSound(duration = 1.6) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.8, Math.min(3.0, Number(duration) || 1.6));

    // 1. Brass handle gentle pickup tap (D5 & A5 dual metallic pulse)
    const brassChimes = [
      { freq: 587.33, delay: 0.0, pulseDur: 0.28, gain: 0.12 },
      { freq: 880.0, delay: 0.02, pulseDur: 0.32, gain: 0.09 },
    ];
    brassChimes.forEach(({ freq, delay, pulseDur, gain: chGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);

      const targetGain = chGain * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(targetGain, now + delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + pulseDur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + pulseDur + 0.02);
    });

    // 2. Optical lens crystalline refractive shimmer (high dual-sine refraction glisten)
    const lensTones = [
      { startFreq: 1760.0, endFreq: 2093.0, delay: 0.12, toneDur: dur * 0.7, gain: 0.08 },
      { startFreq: 2637.0, endFreq: 3136.0, delay: 0.22, toneDur: dur * 0.8, gain: 0.06 },
    ];
    lensTones.forEach(({ startFreq, endFreq, delay, toneDur, gain: tGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + toneDur * 0.4);

      const targetGain = tGain * this.volume;
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(targetGain, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + toneDur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + toneDur + 0.03);
    });
  }

  /**
   * Play procedural springy mushroom bounce ASMR
   * Double-pitch swept bubble sine wave synthesizing tactile organic cap rebound
   */
  playMushroomBounceSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bounces = [
      { startOffset: 0.0, dur: 0.16, startFreq: 320, peakFreq: 640, endFreq: 420, peakGain: 0.18 },
      { startOffset: 0.07, dur: 0.14, startFreq: 460, peakFreq: 760, endFreq: 520, peakGain: 0.12 },
    ];

    bounces.forEach(({ startOffset, dur, startFreq, peakFreq, endFreq, peakGain }) => {
      const start = now + startOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, start);
      osc.frequency.exponentialRampToValueAtTime(peakFreq, start + dur * 0.35);
      osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);

      const targetGain = peakGain * this.volume;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(targetGain, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  }

  /**
   * Play procedural inkwell dip sound
   * Glass rim tap with viscous fluid surface tension release
   */
  playQuillDipSound() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Crystal inkwell rim tap (dual harmonic ping)
    const glassNotes = [
      { freq: 1479.98, dur: 0.18, gain: 0.12 }, // F#6
      { freq: 2217.46, dur: 0.22, gain: 0.08 }, // C#7
    ];
    glassNotes.forEach(({ freq, dur, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const targetGain = gain * this.volume;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(targetGain, now + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    });

    // 2. Viscous ink surface droplet pop
    const fluidOsc = ctx.createOscillator();
    const fluidGain = ctx.createGain();
    fluidOsc.type = "sine";
    fluidOsc.frequency.setValueAtTime(540, now + 0.03);
    fluidOsc.frequency.exponentialRampToValueAtTime(360, now + 0.11);

    const fluidTarget = 0.09 * this.volume;
    fluidGain.gain.setValueAtTime(0.0001, now + 0.03);
    fluidGain.gain.linearRampToValueAtTime(fluidTarget, now + 0.045);
    fluidGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    fluidOsc.connect(fluidGain);
    fluidGain.connect(ctx.destination);
    fluidOsc.start(now + 0.03);
    fluidOsc.stop(now + 0.14);
  }

  /**
   * Play procedural antique quill pen handwriting cursive scratch ASMR
   * Multi-stroke bandpass filtered noise bursts simulating nib friction on dry parchment
   * @param {number} duration - Total writing duration in seconds
   */
  playQuillWritingSound(duration = 2.0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.6, Math.min(4.0, Number(duration) || 2.0));

    // Synthesize 3-4 natural writing strokes across the duration
    const strokeCount = 4;
    const strokeInterval = dur / strokeCount;

    for (let i = 0; i < strokeCount; i++) {
      const strokeStart = now + i * strokeInterval + (i === 0 ? 0.08 : 0);
      const strokeDur = strokeInterval * 0.72;

      // Noise source for parchment scratch
      const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * strokeDur));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Dynamic sweep bandpass filter (1600Hz -> 2600Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      const startCutoff = 1700 + Math.random() * 400;
      const endCutoff = 2300 + Math.random() * 500;
      filter.frequency.setValueAtTime(startCutoff, strokeStart);
      filter.frequency.exponentialRampToValueAtTime(endCutoff, strokeStart + strokeDur);
      filter.Q.value = 3.2;

      const gain = ctx.createGain();
      const strokePeak = (0.09 + Math.random() * 0.04) * this.volume;
      gain.gain.setValueAtTime(0.0001, strokeStart);
      gain.gain.linearRampToValueAtTime(strokePeak, strokeStart + strokeDur * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, strokeStart + strokeDur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(strokeStart);
      noise.stop(strokeStart + strokeDur + 0.02);
    }
  }
}
