const TEMPO = 76;
const BEAT_SECONDS = 60 / TEMPO;

// A short original Web Audio performance of Beethoven's public-domain melody.
const MELODY = [
  ["E5", 0.5],
  ["D#5", 0.5],
  ["E5", 0.5],
  ["D#5", 0.5],
  ["E5", 0.5],
  ["B4", 0.5],
  ["D5", 0.5],
  ["C5", 0.5],
  ["A4", 1.5],
  ["R", 0.5],
  ["C4", 0.5],
  ["E4", 0.5],
  ["A4", 0.5],
  ["B4", 1.5],
  ["R", 0.5],
  ["E4", 0.5],
  ["G#4", 0.5],
  ["B4", 0.5],
  ["C5", 1.5],
  ["R", 0.5],
  ["E4", 0.5],
  ["E5", 0.5],
  ["D#5", 0.5],
  ["E5", 0.5],
  ["D#5", 0.5],
  ["E5", 0.5],
  ["B4", 0.5],
  ["D5", 0.5],
  ["C5", 0.5],
  ["A4", 1.5],
  ["R", 0.5],
  ["C4", 0.5],
  ["E4", 0.5],
  ["A4", 0.5],
  ["B4", 1.5],
  ["R", 0.5],
  ["E4", 0.5],
  ["C5", 0.5],
  ["B4", 0.5],
  ["A4", 2],
  ["R", 1],
];

const NOTE_INDEX = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };

function frequency(note) {
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) return 0;
  const midi = (Number(match[2]) + 1) * 12 + NOTE_INDEX[match[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

export class BackgroundMusic extends EventTarget {
  constructor(volume = 28) {
    super();
    this.volume = Math.max(0, Math.min(100, Number(volume) || 0));
    this.context = null;
    this.master = null;
    this.running = false;
    this.loopTimer = null;
    this.voices = new Set();
  }

  async toggle() {
    if (this.running) this.pause();
    else await this.start();
  }

  async start() {
    if (!this.context) this.createAudioGraph();
    await this.context.resume();
    if (this.running) return;
    this.running = true;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(this.volume / 250, this.context.currentTime, 0.06);
    this.schedulePhrase();
    this.dispatchEvent(new CustomEvent("running", { detail: true }));
  }

  pause() {
    if (!this.context || !this.running) return;
    this.running = false;
    window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.04);
    this.voices.forEach((voice) => {
      try {
        voice.stop(this.context.currentTime + 0.12);
      } catch {
        /* already stopped */
      }
    });
    this.voices.clear();
    this.dispatchEvent(new CustomEvent("running", { detail: false }));
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(100, Number(value) || 0));
    if (this.context && this.running) {
      this.master.gain.setTargetAtTime(this.volume / 250, this.context.currentTime, 0.05);
    }
  }

  createAudioGraph() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error("目前瀏覽器不支援背景音樂。 ");
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
  }

  schedulePhrase() {
    if (!this.running) return;
    let cursor = this.context.currentTime + 0.08;
    MELODY.forEach(([note, beats]) => {
      const duration = beats * BEAT_SECONDS;
      if (note !== "R") this.scheduleNote(frequency(note), cursor, duration);
      cursor += duration;
    });
    const delay = Math.max(100, (cursor - this.context.currentTime - 0.12) * 1000);
    this.loopTimer = window.setTimeout(() => this.schedulePhrase(), delay);
  }

  scheduleNote(pitch, start, duration) {
    const envelope = this.context.createGain();
    const tone = this.context.createBiquadFilter();
    const fundamental = this.context.createOscillator();
    const harmonic = this.context.createOscillator();
    const harmonicGain = this.context.createGain();

    tone.type = "lowpass";
    tone.frequency.value = 2400;
    tone.Q.value = 0.7;
    fundamental.type = "triangle";
    fundamental.frequency.value = pitch;
    harmonic.type = "sine";
    harmonic.frequency.value = pitch * 2;
    harmonicGain.gain.value = 0.12;

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(0.18, start + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.055, start + Math.min(0.22, duration * 0.5));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration + 0.28);

    fundamental.connect(tone);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(tone);
    tone.connect(envelope);
    envelope.connect(this.master);

    const end = start + duration + 0.32;
    [fundamental, harmonic].forEach((voice) => {
      this.voices.add(voice);
      voice.start(start);
      voice.stop(end);
      voice.addEventListener("ended", () => this.voices.delete(voice), { once: true });
    });
  }

  destroy() {
    this.pause();
    this.context?.close();
  }
}
