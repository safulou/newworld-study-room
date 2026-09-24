// Generative Lo-Fi Chord Synthesizer using pure Web Audio API (Zero audio dependencies)

const NOTE_FREQS = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

const CHORD_PROGRESSIONS = [
  // Progression 1: Fmaj7 -> Em7 -> Dm7 -> Cmaj7 (Nostalgic sunset walk)
  [
    { root: "F2", notes: ["F3", "A3", "C4", "E4"] },
    { root: "E2", notes: ["E3", "G3", "B3", "D4"] },
    { root: "D2", notes: ["D3", "F3", "A3", "C4"] },
    { root: "C2", notes: ["C3", "E3", "G3", "B3"] },
  ],
  // Progression 2: Cmaj7 -> Am7 -> Dm7 -> G7 (Cozy study cafe)
  [
    { root: "C2", notes: ["C3", "E3", "G3", "B3"] },
    { root: "A2", notes: ["A3", "C4", "E4", "G4"] },
    { root: "D2", notes: ["D3", "F3", "A3", "C4"] },
    { root: "G2", notes: ["G3", "B3", "D4", "F4"] },
  ],
  // Progression 3: Dm9 -> G13 -> Cmaj9 -> A7b13 (Midnight jazz flow)
  [
    { root: "D2", notes: ["D3", "F3", "A3", "C4", "E4"] },
    { root: "G2", notes: ["G3", "B3", "E4", "F4"] },
    { root: "C2", notes: ["C3", "E3", "G3", "B3", "D4"] },
    { root: "A2", notes: ["A3", "C#4", "G4", "F4"] },
  ],
];

export class LofiGenerator extends EventTarget {
  constructor(volume = 0.4) {
    super();
    this.audioCtx = null;
    this.masterGain = null;
    this.filterNode = null;
    this.lfoNode = null;
    this.volume = volume;
    this.running = false;
    this.timerId = null;
    this.progressionIndex = 0;
    this.stepIndex = 0;
    this.bpm = 70;
  }

  initAudio() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioCtx = new AudioContextClass();

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // Warm vintage lowpass filter
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.setValueAtTime(1400, this.audioCtx.currentTime);
    this.filterNode.Q.setValueAtTime(1.2, this.audioCtx.currentTime);

    // Subtle tape flutter LFO
    try {
      this.lfoNode = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      this.lfoNode.frequency.setValueAtTime(0.35, this.audioCtx.currentTime); // 0.35 Hz subtle drift
      lfoGain.gain.setValueAtTime(45, this.audioCtx.currentTime);
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      this.lfoNode.start();
    } catch {
      // Ignore if LFO setup fails in test env
    }

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
  }

  async start() {
    if (this.running) return;
    this.initAudio();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }
    this.running = true;
    this.progressionIndex = Math.floor(Math.random() * CHORD_PROGRESSIONS.length);
    this.stepIndex = 0;
    this.playNextBar();
    this.scheduleLoop();
    this.dispatchEvent(new CustomEvent("running", { detail: true }));
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.dispatchEvent(new CustomEvent("running", { detail: false }));
  }

  toggle() {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
    return this.running;
  }

  scheduleLoop() {
    if (!this.running) return;
    const barDurationMs = (60 / this.bpm) * 4 * 1000;
    this.timerId = window.setTimeout(() => {
      if (!this.running) return;
      this.playNextBar();
      this.scheduleLoop();
    }, barDurationMs);
  }

  playNextBar() {
    if (!this.audioCtx || !this.filterNode) return;
    const progression = CHORD_PROGRESSIONS[this.progressionIndex];
    const chord = progression[this.stepIndex];

    const now = this.audioCtx.currentTime;
    const barDuration = (60 / this.bpm) * 4;

    // Play bass root note
    if (chord.root && NOTE_FREQS[chord.root]) {
      this.playTone(NOTE_FREQS[chord.root], now, barDuration * 0.9, 0.28, "triangle");
    }

    // Play chord tones with subtle arpeggiation (strum)
    const strumSpread = 0.045; // 45ms between notes
    chord.notes.forEach((noteName, i) => {
      const freq = NOTE_FREQS[noteName];
      if (!freq) return;
      const noteTime = now + i * strumSpread + (Math.random() * 0.015 - 0.007);
      const noteDuration = barDuration * 0.85;
      this.playElectricPianoNote(freq, noteTime, noteDuration, 0.16);
    });

    // Advance step
    this.stepIndex = (this.stepIndex + 1) % progression.length;
    if (this.stepIndex === 0 && Math.random() < 0.4) {
      // 40% chance to switch progression for variety
      this.progressionIndex = (this.progressionIndex + 1) % CHORD_PROGRESSIONS.length;
    }
  }

  playTone(freq, startTime, duration, gainLevel, type = "sine") {
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(gainLevel * 0.4, startTime + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    } catch {
      // Ignore scheduling errors
    }
  }

  playElectricPianoNote(freq, startTime, duration, gainLevel) {
    try {
      // Fundamental oscillator (sine with warm second harmonic)
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, startTime);

      // Octave harmonic for bell chime
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const osc2Gain = this.audioCtx.createGain();
      osc2Gain.gain.setValueAtTime(0.25, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(gainLevel * 0.35, startTime + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(osc2Gain);
      osc2Gain.connect(gain);
      gain.connect(this.filterNode);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.1);
      osc2.stop(startTime + duration + 0.1);
    } catch {
      // Ignore
    }
  }

  destroy() {
    this.stop();
    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
      } catch {
        // Ignore
      }
    }
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
