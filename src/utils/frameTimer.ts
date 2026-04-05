const FPS = 60.098;

export interface FrameTimerOptions {
  onGenerateFrame: () => void;
  onWriteFrame: () => void;
}

export default class FrameTimer {
  onGenerateFrame: () => void;
  onWriteFrame: () => void;
  running: boolean;
  interval: number;
  lastFrameTime: number | false;
  _requestID?: number;

  constructor(options: FrameTimerOptions) {
    this.onGenerateFrame = options.onGenerateFrame;
    this.onWriteFrame = options.onWriteFrame;
    this.running = true;
    this.interval = 1e3 / FPS;
    this.lastFrameTime = false;
  }

  start() {
    if (this.running && this._requestID) return;
    this.running = true;
    this.requestAnimationFrame();
  }

  stop() {
    if (this._requestID) {
      window.cancelAnimationFrame(this._requestID);
      this._requestID = undefined;
    }
    this.running = false;
    this.lastFrameTime = false;
  }

  requestAnimationFrame() {
    this._requestID = window.requestAnimationFrame(this.onAnimationFrame);
  }

  generateFrame() {
    this.onGenerateFrame();
    if (typeof this.lastFrameTime === "number") {
      this.lastFrameTime += this.interval;
    }
  }

  onAnimationFrame = (time: number) => {
    if (!this.running) return;
    this.requestAnimationFrame();

    const excess = time % this.interval;
    const newFrameTime = time - excess;

    if (this.lastFrameTime === false) {
      this.lastFrameTime = newFrameTime;
      return;
    }

    let numFrames = Math.round((newFrameTime - this.lastFrameTime) / this.interval);

    // Prevent massive catch-ups (which cause "fast-forward" audio bugs) when the tab is inactive or on initial load
    if (numFrames > 3) {
      this.lastFrameTime = newFrameTime;
      numFrames = 1;
    }

    if (numFrames <= 0) {
      return;
    }

    this.generateFrame();
    this.onWriteFrame();

    const timeToNextFrame = this.interval - excess;
    for (let i = 1; i < numFrames; i++) {
      setTimeout(
        () => {
          if (this.running) {
            this.generateFrame();
          }
        },
        (i * timeToNextFrame) / numFrames,
      );
    }
  };
}
