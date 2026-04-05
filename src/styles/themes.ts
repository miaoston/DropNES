export type Theme = "matrix" | "cyberpunk" | "tactical";

export interface ThemeConfig {
  name: string;
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
  font: string;
  scanline: boolean;
  glow: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  matrix: {
    name: "Matrix",
    bg: "bg-black",
    primary: "text-[#00ff41]",
    secondary: "text-[#003b00]",
    accent: "border-[#00ff41]",
    font: "font-mono",
    scanline: true,
    glow: "shadow-[0_0_15px_#00ff41]",
  },
  cyberpunk: {
    name: "Cyberpunk",
    bg: "bg-[#0d0221]",
    primary: "text-[#00f6ff]",
    secondary: "text-[#ff00ff]",
    accent: "border-[#ff00ff]",
    font: "font-sans",
    scanline: true,
    glow: "shadow-[0_0_20px_#ff00ff]",
  },
  tactical: {
    name: "Tactical",
    bg: "bg-[#1a1a1a]",
    primary: "text-[#f0f0f0]",
    secondary: "text-[#ff6b00]",
    accent: "border-[#f0f0f0]",
    font: "font-mono",
    scanline: false,
    glow: "shadow-none",
  },
};
