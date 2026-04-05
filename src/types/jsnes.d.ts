declare module "jsnes" {
  export type ButtonKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

  export class Controller {
    state: number[];
    buttonDown: (key: number) => void;
    buttonUp: (key: number) => void;
    clock: () => void;

    static readonly BUTTON_A = 0;
    static readonly BUTTON_B = 1;
    static readonly BUTTON_SELECT = 2;
    static readonly BUTTON_START = 3;
    static readonly BUTTON_UP = 4;
    static readonly BUTTON_DOWN = 5;
    static readonly BUTTON_LEFT = 6;
    static readonly BUTTON_RIGHT = 7;
  }

  export interface NESOptions {
    onFrame: (buffer: Int32Array) => void;
    onAudioSample: (left: number, right: number) => void;
    onStatusUpdate?: (status: string) => void;
    onBatteryRamWrite?: (address: number, value: number) => void;
    emulateSound?: boolean;
    sampleRate?: number;
  }

  export class NES {
    constructor(opts: NESOptions);
    frame: () => void;
    buttonDown: (controller: 1 | 2, button: number) => void;
    buttonUp: (controller: 1 | 2, button: number) => void;
    loadROM: (data: string) => void;
    reset: () => void;
    toJSON: () => any;
    fromJSON: (data: any) => void;
  }
}
