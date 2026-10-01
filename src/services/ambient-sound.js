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
  "pink_noise",
  "ocean_waves",
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
    pans: { rain: -0.65, campfire: 0.65 },
  },
  forest_breeze: {
    id: "forest_breeze",
    name: "林間微風",
    icon: "wind",
    tracks: { wind: 0.35, brown_noise: 0.25 },
    pans: { wind: -0.45, brown_noise: 0.45 },
  },
  deep_flow: {
    id: "deep_flow",
    name: "深度心流",
    icon: "sparkles",
    tracks: { binaural_alpha: 0.22, rain: 0.2 },
    pans: { binaural_alpha: 0, rain: -0.35 },
  },
  ocean_tide: {
    id: "ocean_tide",
    name: "潮汐漫步",
    icon: "waves",
    tracks: { ocean_waves: 0.38, pink_noise: 0.22 },
    pans: { ocean_waves: 0.15, pink_noise: -0.35 },
  },
  study_library: {
    id: "study_library",
    name: "圖書館自習",
    icon: "book-open",
    tracks: { keyboard: 0.28, pencil: 0.25, rain: 0.15 },
    pans: { keyboard: -0.45, pencil: 0.45, rain: -0.65 },
  },
};

export const SPATIAL_SCENARIOS = {
  cabin_realism: {
    id: "cabin_realism",
    name: "小木屋真實音場",
    pans: {
      rain: -0.7,
      wind: -0.45,
      campfire: 0.65,
      keyboard: -0.3,
      pencil: 0.3,
      brown_noise: 0.4,
      pink_noise: -0.25,
      ocean_waves: 0.25,
      binaural_alpha: 0,
      binaural_gamma: 0,
    },
  },
  centered: {
    id: "centered",
    name: "全軌道居中平衡",
    pans: {
      rain: 0,
      wind: 0,
      campfire: 0,
      keyboard: 0,
      pencil: 0,
      brown_noise: 0,
      pink_noise: 0,
      ocean_waves: 0,
      binaural_alpha: 0,
      binaural_gamma: 0,
    },
  },
};

export class AmbientSoundscapeManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.nodes = new Map();
    this.isMuted = false;
    this.masterVolume = 0.5;
    this.trackVolumes = {};
    this.trackPans = {};
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

  createPinkNoiseBuffer(seconds = 4) {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  startTrack(name, volume = 0.3, pan = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (this.nodes.has(name)) return true;

    const initialVolume = this.trackVolumes[name] !== undefined ? this.trackVolumes[name] : volume;
    this.trackVolumes[name] = initialVolume;
    const initialPan = this.trackPans[name] !== undefined ? this.trackPans[name] : pan;
    this.trackPans[name] = initialPan;

    const trackGain = ctx.createGain();
    trackGain.gain.setValueAtTime(initialVolume, ctx.currentTime);

    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, initialPan)), ctx.currentTime);
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

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
        panner,
        volume,
        pan: initialPan,
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
        panner,
        volume,
        pan: initialPan,
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
        panner,
        volume,
        pan: initialPan,
      });
      return true;
    }

    // Procedural Pink Noise (1/f Power Spectrum)
    if (name === "pink_noise") {
      const pinkBuffer = this.createPinkNoiseBuffer(4);
      if (!pinkBuffer) return false;
      const pinkSource = ctx.createBufferSource();
      pinkSource.buffer = pinkBuffer;
      pinkSource.loop = true;

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(3200, ctx.currentTime);

      pinkSource.connect(lpFilter);
      lpFilter.connect(trackGain);
      pinkSource.start();

      this.nodes.set(name, {
        source: pinkSource,
        filter: lpFilter,
        gain: trackGain,
        panner,
        volume,
        pan: initialPan,
      });
      return true;
    }

    // Procedural Ocean Waves with Ultra-Low Frequency Tidal LFO Modulation
    if (name === "ocean_waves") {
      const waveBuffer = this.createPinkNoiseBuffer(4);
      if (!waveBuffer) return false;
      const waveSource = ctx.createBufferSource();
      waveSource.buffer = waveBuffer;
      waveSource.loop = true;

      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = "lowpass";
      waveFilter.frequency.setValueAtTime(360, ctx.currentTime);
      waveFilter.Q.setValueAtTime(2.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

      const lfoFilterGain = ctx.createGain();
      lfoFilterGain.gain.setValueAtTime(300, ctx.currentTime);
      lfo.connect(lfoFilterGain);
      lfoFilterGain.connect(waveFilter.frequency);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.55, ctx.currentTime);
      const lfoVolumeGain = ctx.createGain();
      lfoVolumeGain.gain.setValueAtTime(0.35, ctx.currentTime);
      lfo.connect(lfoVolumeGain);
      lfoVolumeGain.connect(waveGain.gain);

      waveSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(trackGain);

      waveSource.start();
      lfo.start();

      this.nodes.set(name, {
        source: waveSource,
        lfo,
        filter: waveFilter,
        gain: trackGain,
        panner,
        volume,
        pan: initialPan,
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
      panner,
      volume,
      pan: initialPan,
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
      if (track.panner) track.panner.disconnect();
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
    const clamped = Math.max(0, Math.min(1, volume));
    this.trackVolumes[name] = clamped;
    const track = this.nodes.get(name);
    if (!track || !this.audioCtx) return true;
    track.volume = clamped;
    track.gain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    return true;
  }

  getTrackVolume(name) {
    if (this.trackVolumes[name] !== undefined) {
      return this.trackVolumes[name];
    }
    const track = this.nodes.get(name);
    return track ? track.volume : 0.3;
  }

  setTrackPan(name, pan) {
    const clamped = Math.max(-1, Math.min(1, Number(pan) || 0));
    this.trackPans[name] = clamped;
    const track = this.nodes.get(name);
    if (!track || !this.audioCtx || !track.panner) return true;
    track.pan = clamped;
    track.panner.pan.setValueAtTime(clamped, this.audioCtx.currentTime);
    return true;
  }

  getTrackPan(name) {
    if (this.trackPans[name] !== undefined) {
      return this.trackPans[name];
    }
    const track = this.nodes.get(name);
    return track && track.panner ? track.panner.pan.value : 0;
  }

  getCurrentTrackPans() {
    const pans = {};
    for (const name of this.getActiveTracks()) {
      pans[name] = this.getTrackPan(name);
    }
    return pans;
  }

  applySpatialScenario(scenarioKey = "cabin_realism") {
    const scenario = SPATIAL_SCENARIOS[scenarioKey];
    if (!scenario) return;
    for (const [name, panVal] of Object.entries(scenario.pans)) {
      this.setTrackPan(name, panVal);
    }
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

  getCurrentTrackMix() {
    const mix = {};
    for (const name of this.getActiveTracks()) {
      mix[name] = this.getTrackVolume(name);
    }
    return mix;
  }

  applyTrackMix(tracksObj, pansObj = {}) {
    if (!tracksObj || typeof tracksObj !== "object") return [];
    this.stopAll();
    for (const [trackName, vol] of Object.entries(tracksObj)) {
      const numVol = Number(vol);
      if (Number.isFinite(numVol) && numVol > 0) {
        this.trackVolumes[trackName] = Math.max(0, Math.min(1, numVol));
        if (pansObj && pansObj[trackName] !== undefined && Number.isFinite(Number(pansObj[trackName]))) {
          this.trackPans[trackName] = Math.max(-1, Math.min(1, Number(pansObj[trackName])));
        }
        this.startTrack(trackName, this.trackVolumes[trackName], this.trackPans[trackName] || 0);
      }
    }
    return this.getActiveTracks();
  }

  applyPreset(presetId) {
    const preset = SOUNDSCAPE_PRESETS[presetId];
    if (!preset) return [];

    return this.applyTrackMix(preset.tracks, preset.pans);
  }

  stopAll() {
    for (const name of Array.from(this.nodes.keys())) {
      this.stopTrack(name);
    }
  }
}
