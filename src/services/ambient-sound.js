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
  "vinyl",
  "binaural_theta",
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
  zen_meditation: {
    id: "zen_meditation",
    name: "禪修冥想",
    icon: "moon",
    tracks: { binaural_theta: 0.25, ocean_waves: 0.2 },
    pans: { binaural_theta: 0, ocean_waves: -0.25 },
  },
  study_library: {
    id: "study_library",
    name: "圖書館自習",
    icon: "book-open",
    tracks: { keyboard: 0.28, pencil: 0.25, rain: 0.15 },
    pans: { keyboard: -0.45, pencil: 0.45, rain: -0.65 },
  },
  cathedral_study: {
    id: "cathedral_study",
    name: "大教堂古典研讀",
    icon: "sparkles",
    tracks: { pencil: 0.28, rain: 0.18, binaural_alpha: 0.2 },
    pans: { pencil: 0.35, rain: -0.5, binaural_alpha: 0 },
    acoustic: "cathedral",
    eq: { bass: 1, mid: 2, treble: 3 },
    reverb: { preset: "cathedral", wet: 0.3 },
  },
  blizzard_cabin: {
    id: "blizzard_cabin",
    name: "暴風雪暖爐小木屋",
    icon: "flame",
    tracks: { wind: 0.38, campfire: 0.32, pink_noise: 0.2 },
    pans: { wind: -0.65, campfire: 0.6, pink_noise: 0 },
    acoustic: "cabin",
    eq: { bass: 3, mid: 0, treble: -1 },
    reverb: { preset: "cabin", wet: 0.35 },
  },
  vinyl_cafe: {
    id: "vinyl_cafe",
    name: "黑膠咖啡館",
    icon: "disc",
    tracks: { vinyl: 0.38, keyboard: 0.22, rain: 0.26 },
    pans: { vinyl: -0.2, keyboard: 0.5, rain: -0.65 },
    acoustic: "cabin",
    eq: { bass: 2, mid: 1, treble: -1 },
    reverb: { preset: "cabin", wet: 0.22 },
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
      vinyl: -0.25,
      binaural_theta: 0,
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
      vinyl: 0,
      binaural_theta: 0,
      binaural_alpha: 0,
      binaural_gamma: 0,
    },
  },
};

export const ACOUSTIC_PRESETS = {
  bypass: {
    id: "bypass",
    name: "原音純淨",
    icon: "sliders",
    eq: { bass: 0, mid: 0, treble: 0 },
    reverb: { wet: 0.0, duration: 1.0, decay: 2.0 },
  },
  cabin: {
    id: "cabin",
    name: "原木小木屋",
    icon: "home",
    eq: { bass: 2.5, mid: 1.0, treble: -1.5 },
    reverb: { wet: 0.22, duration: 1.2, decay: 2.4 },
  },
  library: {
    id: "library",
    name: "寂靜圖書館",
    icon: "book-open",
    eq: { bass: -2.0, mid: 0.5, treble: 2.0 },
    reverb: { wet: 0.12, duration: 0.7, decay: 3.2 },
  },
  cathedral: {
    id: "cathedral",
    name: "星空大廳",
    icon: "sparkles",
    eq: { bass: 1.5, mid: 1.5, treble: 2.5 },
    reverb: { wet: 0.38, duration: 2.6, decay: 1.8 },
  },
};

export function createProceduralImpulseResponse(ctx, duration = 1.2, decay = 2.2) {
  if (!ctx || !ctx.createBuffer) return null;
  const sampleRate = ctx.sampleRate || 44100;
  const length = Math.max(1, Math.round(sampleRate * Math.max(0.1, duration)));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const envelope = Math.pow(1 - i / length, Math.max(0.5, decay));
    left[i] = (Math.random() * 2 - 1) * envelope;
    right[i] = (Math.random() * 2 - 1) * envelope;
  }
  return impulse;
}

export class AmbientSoundscapeManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.nodes = new Map();
    this.isMuted = false;
    this.masterVolume = 0.5;
    this.trackVolumes = {};
    this.trackPans = {};
    this.binauralFrequencies = {
      binaural_theta: { base: 196, diff: 6 },
      binaural_alpha: { base: 210, diff: 10 },
      binaural_gamma: { base: 220, diff: 40 },
    };
    this.masterEQ = { bass: 0, mid: 0, treble: 0 };
    this.masterReverb = { wet: 0.0, preset: "bypass", duration: 1.0, decay: 2.0 };
    this.eqBass = null;
    this.eqMid = null;
    this.eqTreble = null;
    this.dryGain = null;
    this.wetGain = null;
    this.convolver = null;
    this.analyser = null;
    this.orbitingBreeze = false;
    this.orbitBreezeOptions = { speed: 0.04, depth: 0.6 };
    this.orbitLfoMap = new Map();
    this.autoAtmosphereSync = false;
    this.atmosphereMode = "neutral";
    this.tidalSurge = true;
    this.sleepTimerRemainingSec = 0;
    this.sleepTimerDurationSec = 0;
    this.sleepTimerInterval = null;
    this.onSleepTimerTick = null;
    this.onSleepTimerComplete = null;
  }

  setBinauralBeatFrequency(name, baseFreq, diffFreq) {
    if (!this.binauralFrequencies[name]) return false;
    const clampedBase = Math.max(100, Math.min(400, Number(baseFreq) || 200));
    const clampedDiff = Math.max(1, Math.min(60, Number(diffFreq) || 10));
    this.binauralFrequencies[name] = { base: clampedBase, diff: clampedDiff };

    const track = this.nodes.get(name);
    if (track && track.sources && track.sources.length >= 2 && this.audioCtx) {
      const [oscL, oscR] = track.sources;
      const now = this.audioCtx.currentTime;
      if (oscL.frequency?.setTargetAtTime) {
        oscL.frequency.setTargetAtTime(clampedBase, now, 0.05);
        oscR.frequency.setTargetAtTime(clampedBase + clampedDiff, now, 0.05);
      } else {
        oscL.frequency.setValueAtTime(clampedBase, now);
        oscR.frequency.setValueAtTime(clampedBase + clampedDiff, now);
      }
    }
    return true;
  }

  getBinauralBeatFrequency(name) {
    return this.binauralFrequencies[name] ? { ...this.binauralFrequencies[name] } : null;
  }

  setupAcousticChain() {
    if (!this.audioCtx || !this.masterGain) return;
    try {
      if (
        this.audioCtx.createBiquadFilter &&
        this.audioCtx.createGain &&
        this.audioCtx.createConvolver &&
        this.audioCtx.destination
      ) {
        this.eqBass = this.audioCtx.createBiquadFilter();
        this.eqBass.type = "lowshelf";
        this.eqBass.frequency.value = 200;
        this.eqBass.gain.value = this.masterEQ.bass;

        this.eqMid = this.audioCtx.createBiquadFilter();
        this.eqMid.type = "peaking";
        this.eqMid.frequency.value = 1000;
        this.eqMid.Q.value = 1.0;
        this.eqMid.gain.value = this.masterEQ.mid;

        this.eqTreble = this.audioCtx.createBiquadFilter();
        this.eqTreble.type = "highshelf";
        this.eqTreble.frequency.value = 3200;
        this.eqTreble.gain.value = this.masterEQ.treble;

        this.dryGain = this.audioCtx.createGain();
        this.dryGain.gain.value = Math.max(0, 1 - this.masterReverb.wet);

        this.wetGain = this.audioCtx.createGain();
        this.wetGain.gain.value = Math.max(0, this.masterReverb.wet);

        this.convolver = this.audioCtx.createConvolver();
        if (this.masterReverb.wet > 0) {
          this.convolver.buffer = createProceduralImpulseResponse(
            this.audioCtx,
            this.masterReverb.duration,
            this.masterReverb.decay,
          );
        }

        this.masterGain.connect(this.eqBass);
        this.eqBass.connect(this.eqMid);
        this.eqMid.connect(this.eqTreble);

        // Dry path
        this.eqTreble.connect(this.dryGain);
        this.dryGain.connect(this.audioCtx.destination);

        // Reverb wet path
        this.eqTreble.connect(this.convolver);
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.audioCtx.destination);

        // Tap for real-time visualizer
        if (this.analyser && this.masterGain.connect) {
          try {
            this.masterGain.connect(this.analyser);
          } catch {}
        }
        return;
      }
    } catch {
      // Fallback on limitation
    }
    if (this.audioCtx.destination) {
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  setMasterEQ({ bass = 0, mid = 0, treble = 0 }) {
    this.masterEQ = {
      bass: Math.max(-12, Math.min(12, Number(bass) || 0)),
      mid: Math.max(-12, Math.min(12, Number(mid) || 0)),
      treble: Math.max(-12, Math.min(12, Number(treble) || 0)),
    };
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (this.eqBass?.gain) this.eqBass.gain.setValueAtTime(this.masterEQ.bass, now);
      if (this.eqMid?.gain) this.eqMid.gain.setValueAtTime(this.masterEQ.mid, now);
      if (this.eqTreble?.gain) this.eqTreble.gain.setValueAtTime(this.masterEQ.treble, now);
    }
    return { ...this.masterEQ };
  }

  getMasterEQ() {
    return { ...this.masterEQ };
  }

  setMasterReverb({ wet = 0, preset = "custom", duration = 1.2, decay = 2.2 }) {
    const clampedWet = Math.max(0, Math.min(0.7, Number(wet) || 0));
    this.masterReverb = {
      wet: clampedWet,
      preset: String(preset || "custom"),
      duration: Math.max(0.2, Math.min(4.0, Number(duration) || 1.2)),
      decay: Math.max(0.5, Math.min(5.0, Number(decay) || 2.2)),
    };
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (this.wetGain?.gain) this.wetGain.gain.setValueAtTime(clampedWet, now);
      if (this.dryGain?.gain) this.dryGain.gain.setValueAtTime(Math.max(0, 1 - clampedWet), now);
      if (this.convolver && clampedWet > 0) {
        try {
          this.convolver.buffer = createProceduralImpulseResponse(
            this.audioCtx,
            this.masterReverb.duration,
            this.masterReverb.decay,
          );
        } catch {}
      }
    }
    return { ...this.masterReverb };
  }

  getMasterReverb() {
    return { ...this.masterReverb };
  }

  applyAcousticPreset(presetKey) {
    const config = ACOUSTIC_PRESETS[presetKey];
    if (!config) return false;
    this.setMasterEQ(config.eq);
    this.setMasterReverb({
      wet: config.reverb.wet,
      preset: config.id,
      duration: config.reverb.duration,
      decay: config.reverb.decay,
    });
    return true;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
      if (this.audioCtx.createAnalyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
      }
      this.setupAcousticChain();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  getAnalyserData() {
    if (!this.analyser) return null;
    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);
    return { freqData, timeData, bufferLength };
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

  startTrack(name, volume = 0.3, pan = 0, fadeDuration = 0.8) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (this.nodes.has(name)) return true;

    const initialVolume = this.trackVolumes[name] !== undefined ? this.trackVolumes[name] : volume;
    this.trackVolumes[name] = initialVolume;
    const initialPan = this.trackPans[name] !== undefined ? this.trackPans[name] : pan;
    this.trackPans[name] = initialPan;

    const trackGain = ctx.createGain();
    const now = ctx.currentTime;
    if (fadeDuration > 0 && trackGain.gain.linearRampToValueAtTime) {
      trackGain.gain.setValueAtTime(0.0001, now);
      trackGain.gain.linearRampToValueAtTime(initialVolume, now + fadeDuration);
    } else {
      trackGain.gain.setValueAtTime(initialVolume, now);
    }

    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, initialPan)), ctx.currentTime);
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    // Procedural Binaural Beat Synthesis (Theta 6Hz, Alpha 10Hz, or Gamma 40Hz)
    if (name === "binaural_theta" || name === "binaural_alpha" || name === "binaural_gamma") {
      const freqConfig = this.binauralFrequencies[name] || {
        base: name === "binaural_theta" ? 196 : name === "binaural_alpha" ? 210 : 220,
        diff: name === "binaural_theta" ? 6 : name === "binaural_alpha" ? 10 : 40,
      };
      const baseFreq = freqConfig.base;
      const diffFreq = freqConfig.diff;

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

      this._registerTrack(name, {
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

      this._registerTrack(name, {
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

      this._registerTrack(name, {
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

    // Procedural Lo-Fi Vinyl Turntable (Hiss + Analog Groove Micro-Crackles)
    if (name === "vinyl") {
      // 1. Continuous Surface Friction Hiss & Turntable Contact
      const hissBuffer = this.createPinkNoiseBuffer(4);
      if (!hissBuffer) return false;
      const hissSource = ctx.createBufferSource();
      hissSource.buffer = hissBuffer;
      hissSource.loop = true;

      // Warm bandpass capturing vinyl needle contact
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = "bandpass";
      hissFilter.frequency.setValueAtTime(1600, ctx.currentTime);
      hissFilter.Q.setValueAtTime(1.1, ctx.currentTime);

      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.35, ctx.currentTime);

      hissSource.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(trackGain);
      hissSource.start();

      // 2. Procedural Dust Pops & Crackles Scheduler
      let active = true;
      let timerId = null;

      const scheduleCrackle = () => {
        if (!active) return;
        const now = ctx.currentTime;

        try {
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          const clickFilter = ctx.createBiquadFilter();

          clickFilter.type = "bandpass";
          clickFilter.frequency.setValueAtTime(2800 + Math.random() * 1800, now);
          clickFilter.Q.setValueAtTime(3.8, now);

          clickOsc.type = Math.random() < 0.5 ? "triangle" : "square";
          clickOsc.frequency.setValueAtTime(120 + Math.random() * 450, now);

          const clickVol = (0.08 + Math.random() * 0.16) * (Math.random() < 0.15 ? 1.8 : 1.0);
          clickGain.gain.setValueAtTime(0.0001, now);
          clickGain.gain.linearRampToValueAtTime(clickVol, now + 0.001);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          clickOsc.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(trackGain);

          clickOsc.start(now);
          clickOsc.stop(now + 0.025);
        } catch {}

        const isCluster = Math.random() < 0.22;
        const delay = isCluster ? 45 + Math.random() * 75 : 140 + Math.random() * 380;
        timerId = window.setTimeout(scheduleCrackle, delay);
      };

      timerId = window.setTimeout(scheduleCrackle, 80);

      this._registerTrack(name, {
        source: hissSource,
        filter: hissFilter,
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

      this._registerTrack(name, {
        source: pinkSource,
        filter: lpFilter,
        gain: trackGain,
        panner,
        volume,
        pan: initialPan,
      });
      return true;
    }

    // Procedural Ocean Waves with Dual-Harmonic Tidal Swell & Stereo Migration
    if (name === "ocean_waves") {
      const waveBuffer = this.createPinkNoiseBuffer(4);
      if (!waveBuffer) return false;
      const waveSource = ctx.createBufferSource();
      waveSource.buffer = waveBuffer;
      waveSource.loop = true;

      // 1. Deep Oceanic Body (lowpass filter)
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = "lowpass";
      waveFilter.frequency.setValueAtTime(360, ctx.currentTime);
      waveFilter.Q.setValueAtTime(2.2, ctx.currentTime);

      // Primary Tidal Swell LFO (0.05 Hz deep rhythmic breathing surge)
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.05, ctx.currentTime);

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

      // 2. Surf Spray & Whitecap Foam (bandpass froth layer)
      const foamFilter = ctx.createBiquadFilter();
      foamFilter.type = "bandpass";
      foamFilter.frequency.setValueAtTime(1600, ctx.currentTime);
      foamFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      const foamGain = ctx.createGain();
      foamGain.gain.setValueAtTime(0.12, ctx.currentTime);

      // Secondary Crest Froth LFO (0.11 Hz staggered wave crest breaker)
      const foamLfo = ctx.createOscillator();
      foamLfo.type = "triangle";
      foamLfo.frequency.setValueAtTime(0.11, ctx.currentTime);

      const foamLfoGain = ctx.createGain();
      foamLfoGain.gain.setValueAtTime(0.09, ctx.currentTime);
      foamLfo.connect(foamLfoGain);
      foamLfoGain.connect(foamGain.gain);

      waveSource.connect(foamFilter);
      foamFilter.connect(foamGain);
      foamGain.connect(trackGain);

      // 3. Binaural Tidal Swell Stereo Pan Migration
      let panLfo = null;
      if (this.tidalSurge && panner?.pan) {
        panLfo = ctx.createOscillator();
        panLfo.type = "sine";
        panLfo.frequency.setValueAtTime(0.05, ctx.currentTime);

        const panLfoGain = ctx.createGain();
        panLfoGain.gain.setValueAtTime(0.28, ctx.currentTime);

        panLfo.connect(panLfoGain);
        panLfoGain.connect(panner.pan);
        panLfo.start();
      }

      waveSource.start();
      lfo.start();
      foamLfo.start();

      const allLfos = [lfo, foamLfo];
      if (panLfo) allLfos.push(panLfo);

      this._registerTrack(name, {
        source: waveSource,
        lfo,
        lfos: allLfos,
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

    this._registerTrack(name, {
      source: noiseSource,
      filter,
      gain: trackGain,
      panner,
      volume,
      pan: initialPan,
    });
    return true;
  }

  _registerTrack(name, trackNode) {
    this.nodes.set(name, trackNode);
    if (this.orbitingBreeze) {
      this._attachOrbitLfo(name, trackNode);
    }
  }

  _attachOrbitLfo(trackName, trackNode) {
    if (!this.audioCtx || !trackNode || !trackNode.panner || !this.audioCtx.createOscillator) {
      return;
    }
    if (this.orbitLfoMap.has(trackName)) {
      return;
    }

    try {
      const lfo = this.audioCtx.createOscillator();
      lfo.type = "sine";
      const trackIndex = Array.from(this.nodes.keys()).indexOf(trackName);
      const freqOffset = 1 + (trackIndex % 5) * 0.15;
      const freq = (this.orbitBreezeOptions.speed || 0.04) * freqOffset;
      if (lfo.frequency?.setValueAtTime) {
        lfo.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      }

      const lfoGain = this.audioCtx.createGain();
      const depth = Math.max(0.1, Math.min(0.95, this.orbitBreezeOptions.depth || 0.6));
      if (lfoGain.gain?.setValueAtTime) {
        lfoGain.gain.setValueAtTime(depth, this.audioCtx.currentTime);
      }

      lfo.connect(lfoGain);
      if (trackNode.panner.pan && lfoGain.connect) {
        lfoGain.connect(trackNode.panner.pan);
      }
      if (lfo.start) lfo.start();

      this.orbitLfoMap.set(trackName, { lfo, lfoGain });
    } catch {}
  }

  _detachOrbitLfo(trackName) {
    const entry = this.orbitLfoMap.get(trackName);
    if (!entry) return;
    try {
      if (entry.lfo) {
        if (entry.lfo.stop) entry.lfo.stop();
        if (entry.lfo.disconnect) entry.lfo.disconnect();
      }
      if (entry.lfoGain && entry.lfoGain.disconnect) {
        entry.lfoGain.disconnect();
      }
    } catch {}
    this.orbitLfoMap.delete(trackName);

    const track = this.nodes.get(trackName);
    if (track && track.panner && this.audioCtx) {
      const staticPan = this.trackPans[trackName] !== undefined ? this.trackPans[trackName] : track.pan || 0;
      try {
        if (track.panner.pan?.setValueAtTime) {
          track.panner.pan.setValueAtTime(staticPan, this.audioCtx.currentTime);
        }
      } catch {}
    }
  }

  cleanupTrack(track) {
    if (!track) return;
    try {
      if (track.stopTimer) track.stopTimer();
      if (track.lfo) {
        try {
          track.lfo.stop();
          track.lfo.disconnect();
        } catch {}
      }
      if (track.lfos) {
        track.lfos.forEach((l) => {
          try {
            l.stop();
            l.disconnect();
          } catch {}
        });
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
  }

  stopTrack(name, fadeDuration = 0.8) {
    const track = this.nodes.get(name);
    if (!track) return false;

    this._detachOrbitLfo(name);
    this.nodes.delete(name);

    const ctx = this.audioCtx;
    if (ctx && track.gain && fadeDuration > 0 && track.gain.gain.linearRampToValueAtTime) {
      const now = ctx.currentTime;
      try {
        track.gain.gain.setValueAtTime(track.gain.gain.value, now);
        track.gain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      } catch {}
      window.setTimeout(
        () => {
          this.cleanupTrack(track);
        },
        fadeDuration * 1000 + 40,
      );
      return true;
    }

    this.cleanupTrack(track);
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

  setTrackVolume(name, volume, rampDuration = 0.3) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.trackVolumes[name] = clamped;
    const track = this.nodes.get(name);
    if (!track || !this.audioCtx) return true;
    track.volume = clamped;
    if (rampDuration > 0 && track.gain?.gain?.linearRampToValueAtTime) {
      try {
        const now = this.audioCtx.currentTime;
        track.gain.gain.setValueAtTime(track.gain.gain.value, now);
        track.gain.gain.linearRampToValueAtTime(clamped, now + rampDuration);
      } catch {
        track.gain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
      }
    } else if (track.gain?.gain) {
      track.gain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
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

  duck(targetRatio = 0.25, duration = 0.8) {
    if (!this.audioCtx || !this.masterGain || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    const target = Math.max(0, this.masterVolume * targetRatio);
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + Math.max(0.05, duration));
    } catch {}
  }

  unduck(duration = 0.8) {
    if (!this.audioCtx || !this.masterGain || this.isMuted) return;
    const now = this.audioCtx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, now + Math.max(0.05, duration));
    } catch {}
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

  applyTrackMix(tracksObj, pansObj = {}, crossfadeDuration = 0.8) {
    if (!tracksObj || typeof tracksObj !== "object") return [];
    const targetTracks = new Set(
      Object.entries(tracksObj)
        .filter(([, vol]) => Number.isFinite(Number(vol)) && Number(vol) > 0)
        .map(([name]) => name),
    );

    // Fade out tracks that are not part of the new mix
    for (const name of Array.from(this.nodes.keys())) {
      if (!targetTracks.has(name)) {
        this.stopTrack(name, crossfadeDuration);
      }
    }

    // Adjust or start tracks in the new mix
    for (const [trackName, vol] of Object.entries(tracksObj)) {
      const numVol = Number(vol);
      if (Number.isFinite(numVol) && numVol > 0) {
        const cleanVol = Math.max(0, Math.min(1, numVol > 1 ? numVol / 100 : numVol));
        this.trackVolumes[trackName] = cleanVol;
        if (pansObj && pansObj[trackName] !== undefined && Number.isFinite(Number(pansObj[trackName]))) {
          this.trackPans[trackName] = Math.max(-1, Math.min(1, Number(pansObj[trackName])));
        }
        if (this.nodes.has(trackName)) {
          this.setTrackVolume(trackName, cleanVol, crossfadeDuration);
          if (pansObj && pansObj[trackName] !== undefined) {
            this.setTrackPan(trackName, this.trackPans[trackName]);
          }
        } else {
          this.startTrack(trackName, cleanVol, this.trackPans[trackName] || 0, crossfadeDuration);
        }
      }
    }
    return this.getActiveTracks();
  }

  applyPreset(presetId) {
    const preset = SOUNDSCAPE_PRESETS[presetId];
    if (!preset) return [];

    if (preset.eq) {
      this.setMasterEQ(preset.eq);
    }
    if (preset.reverb) {
      this.setMasterReverb(preset.reverb);
    } else if (preset.acoustic) {
      this.applyAcousticPreset(preset.acoustic);
    }

    return this.applyTrackMix(preset.tracks, preset.pans);
  }

  stopAll(fadeDuration = 0.6) {
    for (const name of Array.from(this.nodes.keys())) {
      this.stopTrack(name, fadeDuration);
    }
  }

  /**
   * Set soundscape sleep timer with smooth auto-fadeout
   * @param {number} minutes - Duration in minutes (0 to cancel)
   * @returns {number} Initial remaining seconds
   */
  setSleepTimer(minutes) {
    this.clearSleepTimer();
    const mins = Math.max(0, Number(minutes) || 0);
    if (mins <= 0) return 0;

    this.sleepTimerDurationSec = Math.round(mins * 60);
    this.sleepTimerRemainingSec = this.sleepTimerDurationSec;

    this.sleepTimerInterval = setInterval(() => {
      if (this.sleepTimerRemainingSec > 0) {
        this.sleepTimerRemainingSec -= 1;
        this.onSleepTimerTick?.(this.sleepTimerRemainingSec);

        // Gentle volume fadeout during the final 60 seconds
        if (this.sleepTimerRemainingSec <= 60 && this.audioCtx && this.masterGain && !this.isMuted) {
          const fadeProgress = Math.max(0, this.sleepTimerRemainingSec / 60);
          const currentTargetVol = this.masterVolume * fadeProgress;
          const now = this.audioCtx.currentTime;
          try {
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, currentTargetVol), now + 0.95);
          } catch {}
        }

        if (this.sleepTimerRemainingSec <= 0) {
          this.clearSleepTimer();
          this.stopAll(1.2);
          if (this.audioCtx && this.masterGain) {
            setTimeout(() => {
              if (this.masterGain && !this.isMuted) {
                try {
                  this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
                } catch {}
              }
            }, 1400);
          }
          this.onSleepTimerComplete?.();
        }
      }
    }, 1000);

    this.onSleepTimerTick?.(this.sleepTimerRemainingSec);
    return this.sleepTimerRemainingSec;
  }

  /**
   * Cancel and clear the soundscape sleep timer
   */
  clearSleepTimer() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    const hadTimer = this.sleepTimerRemainingSec > 0;
    this.sleepTimerRemainingSec = 0;
    this.sleepTimerDurationSec = 0;
    if (hadTimer && this.audioCtx && this.masterGain && !this.isMuted) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
      } catch {}
    }
    this.onSleepTimerTick?.(0);
  }

  /**
   * Get remaining sleep timer seconds
   * @returns {number}
   */
  getSleepTimerRemaining() {
    return this.sleepTimerRemainingSec;
  }

  /**
   * Check whether sleep timer is currently running
   * @returns {boolean}
   */
  isSleepTimerActive() {
    return this.sleepTimerRemainingSec > 0;
  }

  setOrbitingBreeze(enabled, options = {}) {
    this.orbitingBreeze = Boolean(enabled);
    if (options.speed !== undefined) {
      this.orbitBreezeOptions.speed = Math.max(0.01, Math.min(0.2, Number(options.speed) || 0.04));
    }
    if (options.depth !== undefined) {
      this.orbitBreezeOptions.depth = Math.max(0.1, Math.min(0.95, Number(options.depth) || 0.6));
    }

    if (this.orbitingBreeze) {
      for (const [name, track] of this.nodes.entries()) {
        this._attachOrbitLfo(name, track);
      }
    } else {
      for (const name of Array.from(this.orbitLfoMap.keys())) {
        this._detachOrbitLfo(name);
      }
    }
    return this.orbitingBreeze;
  }

  isOrbitingBreeze() {
    return this.orbitingBreeze;
  }

  getOrbitBreezeOptions() {
    return { ...this.orbitBreezeOptions };
  }

  setAtmosphereMode(mode) {
    const normalizedMode = mode === "shortBreak" || mode === "longBreak" || mode === "break" ? "break" : mode;
    if (normalizedMode !== "focus" && normalizedMode !== "break" && normalizedMode !== "neutral") return false;
    this.atmosphereMode = normalizedMode;
    if (!this.autoAtmosphereSync || !this.audioCtx) return true;

    const now = this.audioCtx.currentTime;
    const rampTime = 1.2;

    for (const [name, track] of this.nodes.entries()) {
      if (!track || !track.gain) continue;
      const userVol = this.trackVolumes[name] !== undefined ? this.trackVolumes[name] : track.volume || 0.3;
      let targetVol = userVol;

      if (normalizedMode === "break") {
        if (name.startsWith("binaural_") || name === "brown_noise" || name === "pink_noise") {
          targetVol = userVol * 0.4;
        } else if (name === "rain" || name === "ocean_waves") {
          targetVol = userVol * 0.7;
        }
      } else if (mode === "focus") {
        targetVol = userVol;
      }

      try {
        if (track.gain.gain?.linearRampToValueAtTime) {
          track.gain.gain.linearRampToValueAtTime(targetVol, now + rampTime);
        } else if (track.gain.gain?.setValueAtTime) {
          track.gain.gain.setValueAtTime(targetVol, now);
        }
      } catch {}
    }
    return true;
  }

  setAutoAtmosphereSync(enabled) {
    this.autoAtmosphereSync = Boolean(enabled);
    return this.autoAtmosphereSync;
  }

  isAutoAtmosphereSync() {
    return this.autoAtmosphereSync;
  }

  setTidalSurge(enabled) {
    this.tidalSurge = Boolean(enabled);
    return this.tidalSurge;
  }

  isTidalSurge() {
    return this.tidalSurge;
  }
}

/**
 * Encode a soundscape preset ({ name, tracks, pans }) into a compact, URL-safe string
 * @param {Object} preset
 * @returns {string}
 */
export function encodeSoundscapeCode(preset) {
  if (!preset || typeof preset !== "object") return "";
  const name = String(preset.name || "自訂音景").slice(0, 30);
  const cleanTracks = {};
  const cleanPans = {};

  if (preset.tracks && typeof preset.tracks === "object") {
    AMBIENT_SOUND_TYPES.forEach((type) => {
      const vol = Number(preset.tracks[type]);
      if (Number.isFinite(vol) && vol > 0) {
        cleanTracks[type] = Math.max(0, Math.min(100, Math.round(vol <= 1 ? vol * 100 : vol)));
      }
    });
  }

  if (preset.pans && typeof preset.pans === "object") {
    AMBIENT_SOUND_TYPES.forEach((type) => {
      const pan = Number(preset.pans[type]);
      if (Number.isFinite(pan) && Math.abs(pan) > 0.01) {
        cleanPans[type] = Math.max(-1, Math.min(1, Math.round(pan * 100) / 100));
      }
    });
  }

  if (Object.keys(cleanTracks).length === 0) return "";

  const payload = { n: name, t: cleanTracks, p: cleanPans };
  if (preset.orbitingBreeze) {
    payload.ob = 1;
  }
  if (preset.eq && typeof preset.eq === "object") {
    payload.eq = {
      b: Math.max(-12, Math.min(12, Math.round(Number(preset.eq.bass) || 0))),
      m: Math.max(-12, Math.min(12, Math.round(Number(preset.eq.mid) || 0))),
      t: Math.max(-12, Math.min(12, Math.round(Number(preset.eq.treble) || 0))),
    };
  }
  if (preset.reverb && typeof preset.reverb === "object") {
    payload.rv = {
      p: String(preset.reverb.preset || "bypass").slice(0, 16),
      w: Math.max(0, Math.min(100, Math.round((Number(preset.reverb.wet) || 0) * 100))),
    };
  }

  try {
    const jsonStr = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(jsonStr);
    let binStr = "";
    bytes.forEach((b) => (binStr += String.fromCharCode(b)));
    return "sc_" + btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  } catch {
    return "";
  }
}

/**
 * Decode and validate a soundscape code into a clean preset object
 * @param {string} code
 * @returns {{ name: string, tracks: Object, pans: Object, eq?: Object, reverb?: Object, orbitingBreeze?: boolean } | null}
 */
export function decodeSoundscapeCode(code) {
  if (!code || typeof code !== "string") return null;
  const raw = code.trim().replace(/^sc_/, "").replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binStr = atob(raw);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object") return null;

    const name = String(parsed.n || parsed.name || "分享音景")
      .trim()
      .slice(0, 30);
    const tracks = {};
    const pans = {};

    const rawTracks = parsed.t || parsed.tracks || {};
    AMBIENT_SOUND_TYPES.forEach((type) => {
      if (rawTracks[type] !== undefined) {
        const val = Number(rawTracks[type]);
        if (Number.isFinite(val) && val > 0) {
          tracks[type] = Math.max(0, Math.min(100, Math.round(val)));
        }
      }
    });

    const rawPans = parsed.p || parsed.pans || {};
    AMBIENT_SOUND_TYPES.forEach((type) => {
      if (rawPans[type] !== undefined) {
        const val = Number(rawPans[type]);
        if (Number.isFinite(val)) {
          pans[type] = Math.max(-1, Math.min(1, Math.round(val * 100) / 100));
        }
      }
    });

    let eq = null;
    const rawEq = parsed.eq || parsed.e;
    if (rawEq && typeof rawEq === "object") {
      eq = {
        bass: Math.max(-12, Math.min(12, Math.round(Number(rawEq.b ?? rawEq.bass ?? 0)))),
        mid: Math.max(-12, Math.min(12, Math.round(Number(rawEq.m ?? rawEq.mid ?? 0)))),
        treble: Math.max(-12, Math.min(12, Math.round(Number(rawEq.t ?? rawEq.treble ?? 0)))),
      };
    }

    let reverb = null;
    const rawRv = parsed.rv || parsed.reverb;
    if (rawRv && typeof rawRv === "object") {
      const p = String(rawRv.p ?? rawRv.preset ?? "bypass");
      const w = Number(rawRv.w !== undefined ? rawRv.w / 100 : (rawRv.wet ?? 0));
      reverb = {
        preset: ["bypass", "cabin", "library", "cathedral"].includes(p) ? p : "custom",
        wet: Math.max(0, Math.min(1, Math.round(w * 100) / 100)),
      };
    }

    const orbitingBreeze = Boolean(parsed.ob || parsed.orbitingBreeze);

    if (Object.keys(tracks).length === 0) return null;
    return { name, tracks, pans, eq, reverb, orbitingBreeze };
  } catch {
    return null;
  }
}
