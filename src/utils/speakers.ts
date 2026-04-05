// How many samples to batch before posting to the worklet. Posting every
// single sample individually would be too much MessagePort overhead.
// 128 matches the AudioWorklet render quantum size.
const BATCH_SIZE = 128;

export default class Speakers {
  onBufferUnderrun?: () => void;
  audioCtx: AudioContext | null;
  node: AudioWorkletNode | null;
  gainNode: GainNode | null;
  batchL: Float32Array;
  batchR: Float32Array;
  batchPos: number;
  _resumeOnInteraction: (() => void) | null;
  volume: number;

  constructor({
    onBufferUnderrun,
    volume = 1.0,
  }: { onBufferUnderrun?: () => void; volume?: number } = {}) {
    this.onBufferUnderrun = onBufferUnderrun;
    this.audioCtx = null;
    this.node = null;
    this.gainNode = null;
    this.batchL = new Float32Array(BATCH_SIZE);
    this.batchR = new Float32Array(BATCH_SIZE);
    this.batchPos = 0;
    this._resumeOnInteraction = null;
    this.volume = volume;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.01);
    }
  }

  pause() {
    if (this.audioCtx && this.audioCtx.state === "running") {
      this.audioCtx.suspend();
    }
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  getSampleRate() {
    if (!window.AudioContext) {
      return 44100;
    }
    const myCtx = new window.AudioContext();
    const sampleRate = myCtx.sampleRate;
    myCtx.close();
    return sampleRate;
  }

  // start() is async because audioWorklet.addModule() returns a promise.
  // Callers may fire-and-forget — the node will be null until the worklet
  // loads, and writeSample() silently drops samples during that brief window.
  async start() {
    if (!window.AudioContext) {
      return;
    }
    this.audioCtx = new window.AudioContext();

    // Use chrome.runtime.getURL if available (in extension), otherwise fallback to relative path
    const workletUrl =
      typeof chrome !== "undefined" && chrome.runtime?.getURL
        ? chrome.runtime.getURL("audio-processor.js")
        : "audio-processor.js";

    try {
      await this.audioCtx.audioWorklet.addModule(workletUrl);
    } catch (e) {
      console.error("Failed to load audio worklet", e);
      return;
    }

    this.node = new AudioWorkletNode(this.audioCtx, "nes-audio-processor", {
      outputChannelCount: [2],
    });

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = this.volume;

    this.node.port.onmessage = (e) => {
      if (e.data.type === "underrun" && this.onBufferUnderrun) {
        this.onBufferUnderrun();
      }
    };

    this.node.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    // Chrome and other browsers require a user gesture before AudioContext can
    // start. If suspended, resume on the first user interaction.
    // See https://github.com/bfirsh/jsnes/issues/368
    if (this.audioCtx.state === "suspended") {
      this._resumeOnInteraction = () => {
        if (this.audioCtx) {
          this.audioCtx.resume();
        }
        this._removeResumeListeners();
      };
      document.addEventListener("keydown", this._resumeOnInteraction);
      document.addEventListener("mousedown", this._resumeOnInteraction);
      document.addEventListener("touchstart", this._resumeOnInteraction);
    }
  }

  _removeResumeListeners() {
    if (this._resumeOnInteraction) {
      document.removeEventListener("keydown", this._resumeOnInteraction);
      document.removeEventListener("mousedown", this._resumeOnInteraction);
      document.removeEventListener("touchstart", this._resumeOnInteraction);
      this._resumeOnInteraction = null;
    }
  }

  stop() {
    this._removeResumeListeners();
    if (this.node) {
      try {
        this.node.disconnect();
      } catch (e) {
        console.error("Failed to disconnect AudioWorkletNode", e);
      }
      this.node = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {
        console.error("Failed to disconnect GainNode", e);
      }
      this.gainNode = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch((e) => console.error(e));
      this.audioCtx = null;
    }
    this.batchPos = 0;
  }

  writeSample = (left: number, right: number) => {
    if (!this.node) return;

    this.batchL[this.batchPos] = left;
    this.batchR[this.batchPos] = right;
    this.batchPos++;

    if (this.batchPos >= BATCH_SIZE) {
      this.node.port.postMessage({
        type: "samples",
        left: this.batchL.slice(),
        right: this.batchR.slice(),
      });
      this.batchPos = 0;
    }
  };

  // Flush any remaining batched samples to the worklet. Called after each
  // frame to ensure partial batches are sent promptly.
  flush() {
    if (this.batchPos > 0 && this.node) {
      this.node.port.postMessage({
        type: "samples",
        left: this.batchL.slice(0, this.batchPos),
        right: this.batchR.slice(0, this.batchPos),
      });
      this.batchPos = 0;
    }
  }
}
