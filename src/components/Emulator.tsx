import { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import jsnes from "jsnes";
import Speakers from "../utils/speakers";
import FrameTimer from "../utils/frameTimer";
import { KeyMap } from "../utils/keyMap";

export interface EmulatorHandle {
  save: () => any;
  load: (state: any) => void;
  reset: () => void;
  getScreenshot: () => string | null;
}

interface EmulatorProps {
  romData: string;
  paused?: boolean;
  pixelated?: boolean;
  keyMap: KeyMap;
  keyMap2?: KeyMap;
  volume?: number;
  onError?: (mapper: string) => void;
}

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

const Emulator = forwardRef<EmulatorHandle, EmulatorProps>(
  ({ romData, paused = false, pixelated = true, keyMap, keyMap2, volume = 1.0, onError }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nesRef = useRef<jsnes.NES | null>(null);
    const frameTimerRef = useRef<FrameTimer | null>(null);
    const speakersRef = useRef<Speakers | null>(null);

    useEffect(() => {
      speakersRef.current?.setVolume(volume);
    }, [volume]);

    // Invert keyMap for fast lookup: { code: buttonId }
    const invertedKeyMap = useMemo(() => {
      const map: Record<string, number> = {};
      for (const [buttonId, code] of Object.entries(keyMap)) {
        map[code] = Number(buttonId);
      }
      return map;
    }, [keyMap]);

    const invertedKeyMap2 = useMemo(() => {
      const map: Record<string, number> = {};
      if (keyMap2) {
        for (const [buttonId, code] of Object.entries(keyMap2)) {
          map[code] = Number(buttonId);
        }
      }
      return map;
    }, [keyMap2]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      save: () => nesRef.current?.toJSON(),
      load: (state: any) => nesRef.current?.fromJSON(state),
      reset: () => {
        if (nesRef.current) {
          nesRef.current.reset();
          if (romData) {
            try {
              nesRef.current.loadROM(romData);
            } catch (e) {
              console.error("Failed to reload ROM on reset", e);
            }
          }
        }
      },
      getScreenshot: () => {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL("image/jpeg", 0.5);
        }
        return null;
      },
    }));

    // Handle Input separately to avoid re-triggering the main NES loop
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const buttonId1 = invertedKeyMap[e.code];
        if (buttonId1 !== undefined) {
          nesRef.current?.buttonDown(1, buttonId1);
          e.preventDefault();
        }
        const buttonId2 = invertedKeyMap2[e.code];
        if (buttonId2 !== undefined) {
          nesRef.current?.buttonDown(2, buttonId2);
          e.preventDefault();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        const buttonId1 = invertedKeyMap[e.code];
        if (buttonId1 !== undefined) {
          nesRef.current?.buttonUp(1, buttonId1);
          e.preventDefault();
        }
        const buttonId2 = invertedKeyMap2[e.code];
        if (buttonId2 !== undefined) {
          nesRef.current?.buttonUp(2, buttonId2);
          e.preventDefault();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [invertedKeyMap, invertedKeyMap2]);

    // Handle Pause
    useEffect(() => {
      if (paused) {
        frameTimerRef.current?.stop();
        speakersRef.current?.pause();
      } else {
        frameTimerRef.current?.start();
        speakersRef.current?.resume();
      }
    }, [paused]);

    // Initial Setup
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      const buf = new ArrayBuffer(imageData.data.length);
      const buf8 = new Uint8ClampedArray(buf);
      const buf32 = new Uint32Array(buf);

      speakersRef.current = new Speakers({
        onBufferUnderrun: () => {
          // Run extra frames to catch up if audio buffer gets empty
          if (frameTimerRef.current && !frameTimerRef.current.running) return;
          nesRef.current?.frame();
          nesRef.current?.frame();
        },
      });

      nesRef.current = new jsnes.NES({
        onFrame: (framebuffer_24) => {
          for (let i = 0; i < framebuffer_24.length; i++) {
            buf32[i] = 0xff000000 | framebuffer_24[i];
          }
        },
        onAudioSample: (left, right) => {
          speakersRef.current?.writeSample(left, right);
        },
        sampleRate: speakersRef.current.getSampleRate(),
      });

      // Fix jsnes crash: jsnes occasionally calls this.nes.stop() which doesn't exist
      (nesRef.current as any).stop = () => {
        console.error("CPU HALTED: nes.stop() was called by jsnes. Triggering safe halt.");
        throw new Error("NES_HALT");
      };

      frameTimerRef.current = new FrameTimer({
        onGenerateFrame: () => {
          try {
            nesRef.current?.frame();
            speakersRef.current?.flush();
          } catch (e: any) {
            if (e.message === "NES_HALT") {
              frameTimerRef.current?.stop();
            } else {
              console.error("Frame generation error:", e);
            }
          }
        },
        onWriteFrame: () => {
          imageData.data.set(buf8);
          ctx.putImageData(imageData, 0, 0);
        },
      });

      // Load ROM with error handling
      try {
        nesRef.current.loadROM(romData);
      } catch (e: any) {
        console.error("JSNES ROM Load Error:", e);
        const mapperMatch = e.message.match(/Mapper, (\d+)/);
        const mapperNum = mapperMatch ? mapperMatch[1] : "Unknown";
        onError?.(mapperNum);
        return;
      }

      speakersRef.current.start();
      frameTimerRef.current.start();

      return () => {
        frameTimerRef.current?.stop();
        speakersRef.current?.stop();
      };
    }, [romData]);

    return (
      <canvas
        ref={canvasRef}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        className={`w-full h-full object-contain ${pixelated ? "pixel-perfect" : ""}`}
      />
    );
  },
);

Emulator.displayName = "Emulator";
export default Emulator;
