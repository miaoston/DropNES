import jsnes from "jsnes";

export type KeyMap = Record<number, string>;

export const DEFAULT_KEY_MAP: KeyMap = {
  [jsnes.Controller.BUTTON_UP]: "KeyW",
  [jsnes.Controller.BUTTON_DOWN]: "KeyS",
  [jsnes.Controller.BUTTON_LEFT]: "KeyA",
  [jsnes.Controller.BUTTON_RIGHT]: "KeyD",
  [jsnes.Controller.BUTTON_A]: "KeyK",
  [jsnes.Controller.BUTTON_B]: "KeyJ",
  [jsnes.Controller.BUTTON_SELECT]: "Digit1",
  [jsnes.Controller.BUTTON_START]: "Digit2",
};

export const DEFAULT_KEY_MAP_P2: KeyMap = {
  [jsnes.Controller.BUTTON_UP]: "ArrowUp",
  [jsnes.Controller.BUTTON_DOWN]: "ArrowDown",
  [jsnes.Controller.BUTTON_LEFT]: "ArrowLeft",
  [jsnes.Controller.BUTTON_RIGHT]: "ArrowRight",
  [jsnes.Controller.BUTTON_A]: "KeyX",
  [jsnes.Controller.BUTTON_B]: "KeyZ",
  [jsnes.Controller.BUTTON_SELECT]: "ShiftRight",
  [jsnes.Controller.BUTTON_START]: "Enter",
};

export function getFriendlyKeyName(code: string): string {
  if (!code) return "NONE";
  return code
    .replace("Key", "")
    .replace("Digit", "")
    .replace("Arrow", " ")
    .replace("Left", " L")
    .replace("Right", " R")
    .replace("Numpad", "NUM ")
    .toUpperCase();
}

export function getButtonName(buttonId: number, lang: "en" | "zh" = "en"): string {
  const namesEn: Record<number, string> = {
    [jsnes.Controller.BUTTON_UP]: "Up",
    [jsnes.Controller.BUTTON_DOWN]: "Down",
    [jsnes.Controller.BUTTON_LEFT]: "Left",
    [jsnes.Controller.BUTTON_RIGHT]: "Right",
    [jsnes.Controller.BUTTON_A]: "A Button",
    [jsnes.Controller.BUTTON_B]: "B Button",
    [jsnes.Controller.BUTTON_SELECT]: "Select",
    [jsnes.Controller.BUTTON_START]: "Start",
  };
  const namesZh: Record<number, string> = {
    [jsnes.Controller.BUTTON_UP]: "上方向键",
    [jsnes.Controller.BUTTON_DOWN]: "下方向键",
    [jsnes.Controller.BUTTON_LEFT]: "左方向键",
    [jsnes.Controller.BUTTON_RIGHT]: "右方向键",
    [jsnes.Controller.BUTTON_A]: "A 键",
    [jsnes.Controller.BUTTON_B]: "B 键",
    [jsnes.Controller.BUTTON_SELECT]: "Select 键",
    [jsnes.Controller.BUTTON_START]: "Start 键",
  };
  return lang === "zh" ? namesZh[buttonId] || "未知键" : namesEn[buttonId] || "Unknown";
}

export const KeyMapManager = {
  save(map: KeyMap, player: number = 1) {
    localStorage.setItem(`dropnes_keymap_p${player}`, JSON.stringify(map));
  },
  load(player: number = 1): KeyMap {
    const saved = localStorage.getItem(`dropnes_keymap_p${player}`);
    if (saved) return JSON.parse(saved);
    return player === 1 ? DEFAULT_KEY_MAP : DEFAULT_KEY_MAP_P2;
  },
};
