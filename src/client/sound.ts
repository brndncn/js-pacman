const TARGET_FRAME_TIME = 16.5; // TODO pull this from constants

let muted = true;

interface EmulatorCore {
  sound_read(address: number): number;
}

class Voice {
  accumulator: number;
  gain: number;
  sampleIndex: number;
  tallyRate: number;
  prevSnippet: VoiceSnippet;
  constructor() {
    this.accumulator = 0;
    this.gain = 0;
    this.sampleIndex = 0;
    this.tallyRate = 16;
    this.prevSnippet = null;
  }
}

class VoiceSnippet {
  sampler: AudioBufferSourceNode;
  gainer: GainNode;
  ctx: AudioContext;
  constructor(audioCtx: AudioContext, master: AudioNode, voice: Voice) {
    this.ctx = audioCtx;
    this.sampler = audioCtx.createBufferSource();
    this.gainer = audioCtx.createGain();
    this.gainer.gain.value = voice.gain / 3;
    let sample = samples[voice.sampleIndex];
    let buffer = audioCtx.createBuffer(2, 735, 44100);
    let arr0 = buffer.getChannelData(0);
    let arr1 = buffer.getChannelData(1);
    let finalAccumVal = 0;
    let finalAccumSample = Math.floor(TARGET_FRAME_TIME * 44.1);
    for (let s = 0; s < buffer.length; s++) {
      voice.accumulator += voice.tallyRate * 96000 / 44100;
      while (voice.accumulator > 0xFFFFF) {
        voice.accumulator -= 0xFFFFF;
      }
      let index = Math.floor(voice.accumulator / (2**15));
      arr0[s] = sample[index];
      arr1[s] = sample[index];
      if (s == finalAccumSample) {
        finalAccumVal = voice.accumulator;
      }
    }
    voice.accumulator = finalAccumVal;
    this.sampler.buffer = buffer;
    if (voice.prevSnippet !== null) {
      voice.prevSnippet.stop();
    }
    this.sampler.connect(this.gainer);
    this.gainer.connect(audioCtx.destination);
    this.sampler.start();
    voice.prevSnippet = this;
  }
  stop(): void {
    this.sampler.stop();
    this.gainer.gain.value = 0;
  }
}
let audioCtx = new window.AudioContext();

let samples = {};
let voices: Voice[] = [];

for (let i = 0; i < 3; i++) {
  let voice = new Voice();
  voices.push(voice);
}

export function loadSamples(sampleRom: Uint8Array, startIndex: number): void {
  for (let s = 0; s < 8; s++) {
    let sample = [];
    for (let i = s * 32; i < (s + 1) * 32; i++) {
      sample.push(((sampleRom[i] & 0xF) / 8.0) - 1);
    }
    samples[s + startIndex] = sample;
    console.log(samples);
  }
}

export function updateSound(core: EmulatorCore): void {
  if (!muted) {
    let soundEnabled = (core.sound_read(0x50C0) & 0x1) !== 0x0;
    if (soundEnabled) {
      for (let i = 0; i < 3; i++) {
        let tallyRate = 0;
        let tallyRateEndAddr = 0x5054 + i * 0x5;
        for (let b = 0x0; b >= -0x4; b--) {
          tallyRate *= 16;
          if (b >= -0x3 || i == 0) {
            tallyRate += core.sound_read(b + tallyRateEndAddr) & 0xf;
          }
        }
        voices[i].tallyRate = tallyRate;
        voices[i].gain = (core.sound_read(0x5055 + 0x5 * i) & 0xf) / 15.0;
        voices[i].sampleIndex = core.sound_read(0x5045 + 0x5 * i) & 0xf;
        new VoiceSnippet(audioCtx, null, voices[i]);
      }
    }
  }
}

export function setMuted(mutedArg: boolean) {
  muted = mutedArg;
}
