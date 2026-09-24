/**
 * Ambient Soundscapes Synthesizer
 * Pure Web Audio API procedural generation for rain, wind, campfire, brown noise,
 * and scientific binaural beats (Alpha & Gamma flow waves).
 * Requires 0 external audio assets.
 */

export const AMBIENT_SOUND_TYPES = [
  "rain",
  "wind",
  "campfire",
  "brown_noise",
  "binaural_alpha",
  "binaural_gamma",
  "keyboard",
  "pencil",
];

export const SOUNDSCAPE_PRESETS = {
  cozy_fireplace: {
    id: "cozy_fireplace",
    name: "雨夜壁爐",
    icon: "flame",
    tracks: { rain: 0.35, campfire: 0.3 },
  },
  forest_breeze: {
    id: "forest_breeze",
    name: "林間微風",
    icon: "wind",
    tracks: { wind: 0.35, brown_noise: 0.25 },
  },
  deep_flow: {
    id: "deep_flow",
    name: "深度心流",
    icon: "sparkles",
    tracks: { binaural_alpha: 0.22, rain: 0.2 },
  },
  study_library: {
    id: "study_library",
    name: "圖書館自習",
    icon: "book-open",
    tracks: { keyboard: 0.28, pencil: 0.25, rain: 0.15 },
  },
};

export class AmbientSoundscapeManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.nodes = new Map();
    this.isMuted = false;
    this.masterVolume = 0.5;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  createNoiseBuffer(seconds = 5) {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      // Pink / Brown noise synthesis
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  startTrack(name, volume = 0.3) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (this.nodes.has(name)) return true;

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(volume, ctx.currentTime);
    trackGain.connect(this.masterGain);

    // Procedural Binaural Beat Synthesis (Alpha 10Hz or Gamma 40Hz)
    if (name === "binaural_alpha" || name === "binaural_gamma") {
      const baseFreq = name === "binaural_alpha" ? 210 : 200;
      const diffFreq = name === "binaural_alpha" ? 10 : 40;

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = "sine";
      oscR.type = "sine";
      oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscR.frequency.setValueAtTime(baseFreq + diffFreq, ctx.currentTime);

      if (ctx.createStereoPanner) {
        const panL = ctx.createStereoPanner();
        const panR = ctx.createStereoPanner();
        panL.pan.setValueAtTime(-1, ctx.currentTime);
        panR.pan.setValueAtTime(1, ctx.currentTime);
        oscL.connect(panL);
        oscR.connect(panR);
        panL.connect(trackGain);
        panR.connect(trackGain);
      } else {
        oscL.connect(trackGain);
        oscR.connect(trackGain);
      }

      oscL.start();
      oscR.start();

      this.nodes.set(name, {
        sources: [oscL, oscR],
        gain: trackGain,
        volume,
      });
      return true;
    }

    // Procedural ASMR Mechanical Keyboard Typing Track
    if (name === "keyboard") {
      let active = true;
      const playKey = () => {
        if (!active) return;
        this.playSingleKeyPress(trackGain);
        const isPause = Math.random() < 0.12;
        const delay = isPause ? 600 + Math.random() * 500 : 90 + Math.random() * 140;
        timerId = window.setTimeout(playKey, delay);
      };
      let timerId = window.setTimeout(playKey, 120);

      this.nodes.set(name, {
        timerId,
        stopTimer: () => {
          active = false;
          window.clearTimeout(timerId);
        },
        gain: trackGain,
        volume,
      });
      return true;
    }

    // Procedural ASMR Pencil Sketching / Writing Track
    if (name === "pencil") {
      const noiseBuffer = this.createNoiseBuffer(3);
      if (!noiseBuffer) return false;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.setValueAtTime(2200, ctx.currentTime);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.6, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);

      const strokeGain = ctx.createGain();
      strokeGain.gain.setValueAtTime(0.5, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(strokeGain.gain);

      noiseSource.connect(hpFilter);
      hpFilter.connect(strokeGain);
      strokeGain.connect(trackGain);

      noiseSource.start();
      lfo.start();

      this.nodes.set(name, {
        source: noiseSource,
        lfo,
        filter: hpFilter,
        gain: trackGain,
        volume,
      });
      return true;
    }

    // Procedural Noise-based Ambient Sound Synthesis
    const noiseBuffer = this.createNoiseBuffer(4);
    if (!noiseBuffer) return false;

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();

    switch (name) {
      case "rain":
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        break;
      case "wind":
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        filter.Q.setValueAtTime(2.0, ctx.currentTime);
        break;
      case "campfire":
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        break;
      case "brown_noise":
      default:
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, ctx.currentTime);
        break;
    }

    noiseSource.connect(filter);
    filter.connect(trackGain);
    noiseSource.start();

    this.nodes.set(name, {
      source: noiseSource,
      filter,
      gain: trackGain,
      volume,
    });
    return true;
  }

  stopTrack(name) {
    const track = this.nodes.get(name);
    if (!track) return false;

    try {
      if (track.stopTimer) {
        track.stopTimer();
      }
      if (track.lfo) {
        track.lfo.stop();
        track.lfo.disconnect();
      }
      if (track.source) {
        track.source.stop();
        track.source.disconnect();
      }
      if (track.sources) {
        track.sources.forEach((s) => {
          s.stop();
          s.disconnect();
        });
      }
      if (track.filter) track.filter.disconnect();
      if (track.gain) track.gain.disconnect();
    } catch {}

    this.nodes.delete(name);
    return true;
  }

  playSingleKeyPress(targetGain = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const clickFilter = ctx.createBiquadFilter();

      const freq = 1200 + Math.random() * 800;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      clickFilter.type = "bandpass";
      clickFilter.frequency.setValueAtTime(1400, now);
      clickFilter.Q.setValueAtTime(1.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(clickFilter);
      clickFilter.connect(gain);
      gain.connect(targetGain || this.masterGain);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  setTrackVolume(name, volume) {
    const track = this.nodes.get(name);
    if (!track || !this.audioCtx) return false;
    track.volume = Math.max(0, Math.min(1, volume));
    track.gain.gain.setValueAtTime(track.volume, this.audioCtx.currentTime);
    return true;
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  getActiveTracks() {
    return Array.from(this.nodes.keys());
  }

  applyPreset(presetId) {
    const preset = SOUNDSCAPE_PRESETS[presetId];
    if (!preset) return [];

    this.stopAll();
    for (const [trackName, vol] of Object.entries(preset.tracks)) {
      this.startTrack(trackName, vol);
    }
    return this.getActiveTracks();
  }

  stopAll() {
    for (const name of Array.from(this.nodes.keys())) {
      this.stopTrack(name);
    }
  }
}
