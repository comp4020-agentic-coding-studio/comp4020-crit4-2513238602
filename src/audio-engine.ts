import type { SoundParameters } from "./music-mapping.ts";

interface Voice {
  oscillators: OscillatorNode[];
  gain: GainNode;
  filter: BiquadFilterNode;
  panner: StereoPannerNode;
  stopped: boolean;
}

const MAX_VOICES = 14;

export class RippleAudioEngine {
  private context: AudioContext | null = null;
  private input: GainNode | null = null;
  private voices = new Map<string, Voice>();
  private starting = new Set<string>();
  private pendingReleases = new Set<string>();

  get isSupported(): boolean {
    return "AudioContext" in window || "webkitAudioContext" in window;
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (!this.isSupported) return null;

    if (!this.context) {
      const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
      const context = new AudioContextConstructor({ latencyHint: "interactive" });
      const input = context.createGain();
      const dry = context.createGain();
      const echoSend = context.createGain();
      const delay = context.createDelay(0.8);
      const feedback = context.createGain();
      const echoFilter = context.createBiquadFilter();
      const compressor = context.createDynamicsCompressor();
      const master = context.createGain();

      input.gain.value = 0.82;
      dry.gain.value = 0.92;
      echoSend.gain.value = 0.16;
      delay.delayTime.value = 0.23;
      feedback.gain.value = 0.2;
      echoFilter.type = "lowpass";
      echoFilter.frequency.value = 1_800;
      compressor.threshold.value = -19;
      compressor.knee.value = 16;
      compressor.ratio.value = 7;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.2;
      master.gain.value = 0.64;

      input.connect(dry).connect(compressor);
      input.connect(echoSend).connect(delay).connect(echoFilter).connect(compressor);
      echoFilter.connect(feedback).connect(delay);
      compressor.connect(master).connect(context.destination);

      this.context = context;
      this.input = input;
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    return this.context;
  }

  async startVoice(id: string, parameters: SoundParameters): Promise<void> {
    if (this.voices.has(id) || this.starting.has(id)) return;
    this.pendingReleases.delete(id);
    this.starting.add(id);

    const context = await this.ensureContext();
    const input = this.input;
    this.starting.delete(id);
    if (!context || !input || this.voices.has(id)) return;

    while (this.voices.size >= MAX_VOICES) {
      const oldestId = this.voices.keys().next().value as string | undefined;
      if (!oldestId) break;
      this.stopVoice(oldestId, 0.025);
    }

    const now = context.currentTime;
    const fundamental = context.createOscillator();
    const shimmer = context.createOscillator();
    const fundamentalGain = context.createGain();
    const shimmerGain = context.createGain();
    const filter = context.createBiquadFilter();
    const voiceGain = context.createGain();
    const panner = context.createStereoPanner();

    fundamental.type = "sine";
    shimmer.type = "triangle";
    fundamental.frequency.setValueAtTime(parameters.frequency, now);
    shimmer.frequency.setValueAtTime(parameters.frequency * 2.01, now);
    fundamental.detune.value = -2;
    shimmer.detune.value = 3;
    fundamentalGain.gain.value = 0.82;
    shimmerGain.gain.value = 0.18;
    filter.type = "lowpass";
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(parameters.brightness, now);
    panner.pan.setValueAtTime(parameters.pan, now);

    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.exponentialRampToValueAtTime(parameters.gain, now + 0.018);
    voiceGain.gain.exponentialRampToValueAtTime(parameters.gain * 0.7, now + 0.34);

    fundamental.connect(fundamentalGain).connect(filter);
    shimmer.connect(shimmerGain).connect(filter);
    filter.connect(voiceGain).connect(panner).connect(input);

    const voice: Voice = {
      oscillators: [fundamental, shimmer],
      gain: voiceGain,
      filter,
      panner,
      stopped: false,
    };

    this.voices.set(id, voice);
    fundamental.start(now);
    shimmer.start(now);

    // A first tap can end while AudioContext.resume() is still pending. Let it
    // bloom into a short drop instead of losing the sound or leaking a voice.
    if (this.pendingReleases.delete(id)) {
      this.stopVoice(id, 0.28, 0.075);
    }
  }

  updateVoice(id: string, parameters: SoundParameters, movement = 0): void {
    const voice = this.voices.get(id);
    const context = this.context;
    if (!voice || !context || voice.stopped) return;

    const now = context.currentTime;
    const glide = 0.035;
    const boostedBrightness = Math.min(
      7_500,
      parameters.brightness + movement * 1_800,
    );

    voice.oscillators[0]?.frequency.setTargetAtTime(parameters.frequency, now, glide);
    voice.oscillators[1]?.frequency.setTargetAtTime(
      parameters.frequency * 2.01,
      now,
      glide,
    );
    voice.filter.frequency.setTargetAtTime(boostedBrightness, now, 0.025);
    voice.panner.pan.setTargetAtTime(parameters.pan, now, 0.025);
    voice.gain.gain.setTargetAtTime(
      parameters.gain * (0.7 + movement * 0.25),
      now,
      0.04,
    );
  }

  stopVoice(id: string, release = 0.24, delay = 0): void {
    const voice = this.voices.get(id);
    const context = this.context;
    if (!voice || !context) {
      if (this.starting.has(id)) this.pendingReleases.add(id);
      return;
    }
    if (voice.stopped) return;

    voice.stopped = true;
    this.voices.delete(id);
    const now = context.currentTime;
    const releaseStart = now + delay;
    const end = releaseStart + release;

    voice.gain.gain.cancelAndHoldAtTime(releaseStart);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, end);

    for (const oscillator of voice.oscillators) {
      oscillator.stop(end + 0.04);
    }
  }

  stopAll(): void {
    for (const id of this.starting) {
      this.pendingReleases.add(id);
    }
    for (const id of [...this.voices.keys()]) {
      this.stopVoice(id, 0.08);
    }
  }
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
