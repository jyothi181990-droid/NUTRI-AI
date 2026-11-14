import { AmbienceMode } from '../types/nutrition';

/**
 * 100% Original Procedural Web Audio Engine
 * - Never autoplays before explicit user interaction
 * - Generates morning forest breeze, peaceful songbird chirps, and soft UI chimes
 * - Zero copyrighted recordings or external audio dependencies (works offline)
 */
class NutriSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private birdTimer: number | null = null;
  private isEnabled = false;
  private mode: AmbienceMode = 'forest_birds';
  private volume = 0.45;
  private sfxEnabled = true;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.value = 0.25;
      this.ambienceGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public configure(opts: {
    enabled: boolean;
    mode: AmbienceMode;
    volume: number;
    sfxEnabled: boolean;
  }) {
    const wasEnabled = this.isEnabled;
    const prevMode = this.mode;
    this.isEnabled = opts.enabled;
    this.mode = opts.mode;
    this.volume = Math.max(0, Math.min(1, opts.volume));
    this.sfxEnabled = opts.sfxEnabled;

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
    }

    if (!this.isEnabled || this.mode === 'silent') {
      this.stopAmbience();
      return;
    }

    // Only start audio after user toggled enabled=true
    if (!wasEnabled || prevMode !== this.mode) {
      this.startAmbience();
    }
  }

  private startAmbience() {
    this.stopAmbience();
    const ctx = this.ensureContext();
    if (!ctx || !this.ambienceGain) return;

    // Create soft pink-filtered forest wind / stream rustle buffer (4 seconds looping)
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = this.mode === 'forest_birds' ? 420 : 320;
    filter.Q.value = 0.7;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    noise.connect(filter);
    filter.connect(this.ambienceGain);
    noise.start();
    this.noiseSource = noise;

    if (this.mode === 'forest_birds') {
      this.scheduleNextBirdChirp();
    }
  }

  private scheduleNextBirdChirp() {
    if (!this.isEnabled || this.mode !== 'forest_birds') return;
    const delay = 1400 + Math.random() * 3600;
    this.birdTimer = window.setTimeout(() => {
      if (this.isEnabled && this.mode === 'forest_birds') {
        this.playBirdPhrase();
        this.scheduleNextBirdChirp();
      }
    }, delay);
  }

  private playBirdPhrase() {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = 2 + Math.floor(Math.random() * 3);
    const baseFreq = 2200 + Math.random() * 1400;

    // Stereo panner for natural forest spatial placement
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.random() * 1.4 - 0.7;
    panner.connect(this.masterGain);

    for (let i = 0; i < notes; i++) {
      const start = now + i * (0.11 + Math.random() * 0.07);
      const dur = 0.07 + Math.random() * 0.06;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';

      const f1 = baseFreq + (Math.random() - 0.3) * 500;
      const f2 = f1 + (Math.random() > 0.4 ? 420 : -320);

      osc.frequency.setValueAtTime(f1, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(800, f2), start + dur);

      env.gain.setValueAtTime(0.0001, start);
      env.gain.linearRampToValueAtTime(0.08, start + dur * 0.25);
      env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(env);
      env.connect(panner);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    }
  }

  public stopAmbience() {
    if (this.birdTimer !== null) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        // ignore already stopped
      }
      this.noiseSource = null;
    }
  }

  public playInteraction(kind: 'click' | 'success' | 'chime' = 'click') {
    if (!this.isEnabled || !this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    if (kind === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.06, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (kind === 'success') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        const t = now + idx * 0.07;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.07, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        o.connect(g);
        g.connect(this.masterGain!);
        o.start(t);
        o.stop(t + 0.26);
      });
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.14);
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.065, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }
}

export const soundEngine = new NutriSoundEngine();
