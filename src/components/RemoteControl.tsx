import { motion } from "framer-motion";
import {
  Power,
  LogOut,
  Save,
  FolderOpen,
  RefreshCw,
  Monitor,
  Users,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { Theme } from "../styles/themes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RemoteControlProps {
  paused: boolean;
  setPaused: (v: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  pixelated: boolean;
  setPixelated: (v: boolean) => void;
  showP2: boolean;
  setShowP2: (v: boolean) => void;
  showKeyHints: boolean;
  setShowKeyHints: (v: boolean) => void;
  onReset: () => void;
  onEject: () => void;
  onSave: () => void;
  onLoad: () => void;
  theme?: Theme;
  t: any;
}

export default function RemoteControl({
  paused,
  setPaused,
  volume,
  setVolume,
  pixelated,
  setPixelated,
  showP2,
  setShowP2,
  showKeyHints,
  setShowKeyHints,
  onReset,
  onEject,
  onSave,
  onLoad,
  t,
}: RemoteControlProps) {
  const handleVolChange = (delta: number) => {
    setVolume(Math.max(0, Math.min(1, volume + delta)));
  };

  return (
    <motion.div
      className="absolute top-1/4 left-10 z-40 flex flex-col items-center w-24 bg-[#2a2a2a] border-[4px] border-[#1a1a1a] rounded-t-3xl rounded-b-xl shadow-[20px_20px_40px_rgba(0,0,0,0.8),inset_-2px_-2px_10px_rgba(0,0,0,0.5),inset_2px_2px_10px_rgba(255,255,255,0.1)] cursor-grab active:cursor-grabbing pb-6"
      drag
      dragMomentum={false}
      onPointerDown={() => {
        // Allow drag to start on the remote body
      }}
    >
      {/* IR Blaster */}
      <div className="w-full h-8 bg-[#401010] rounded-t-3xl border-b-2 border-black flex items-center justify-center shadow-inner overflow-hidden relative">
        <div className="w-4 h-4 bg-red-500/20 rounded-full blur-[2px]" />
        <div className="absolute top-1 w-10 h-1 bg-white/10 rounded-full" />
      </div>

      <div
        className="w-full px-3 py-4 flex flex-col gap-6"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Power Section */}
        <div className="flex justify-between items-center w-full">
          <span className="text-[8px] font-bold text-white/40 tracking-widest">POWER</span>
          <button
            onClick={() => setPaused(!paused)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shadow-[0_4px_0_#500,inset_0_-2px_5px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_0_0_#500] transition-all",
              paused ? "bg-red-800" : "bg-red-600",
            )}
            title={paused ? t.resume : t.pause}
          >
            <Power className="w-4 h-4 text-white/90" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            title={t.resetEmu}
            className="w-8 h-6 bg-[#444] rounded shadow-[0_3px_0_#222] active:translate-y-[3px] active:shadow-[0_0_0_#222] flex items-center justify-center transition-all"
          >
            <RefreshCw className="w-3 h-3 text-white/70" />
          </button>
          <button
            onClick={onEject}
            title={t.ejectRom}
            className="w-8 h-6 bg-[#444] rounded shadow-[0_3px_0_#222] active:translate-y-[3px] active:shadow-[0_0_0_#222] flex items-center justify-center transition-all"
          >
            <LogOut className="w-3 h-3 text-white/70" />
          </button>
          <button
            onClick={onSave}
            title={t.exportSave}
            className="w-8 h-6 bg-[#444] rounded shadow-[0_3px_0_#222] active:translate-y-[3px] active:shadow-[0_0_0_#222] flex items-center justify-center transition-all"
          >
            <Save className="w-3 h-3 text-white/70" />
          </button>
          <button
            onClick={onLoad}
            title={t.importSave}
            className="w-8 h-6 bg-[#444] rounded shadow-[0_3px_0_#222] active:translate-y-[3px] active:shadow-[0_0_0_#222] flex items-center justify-center transition-all"
          >
            <FolderOpen className="w-3 h-3 text-white/70" />
          </button>
        </div>

        <div className="w-full h-px bg-black/50 border-b border-white/10" />

        {/* Volume Controls */}
        <div className="flex flex-col items-center bg-[#1a1a1a] p-2 rounded-lg shadow-inner border border-white/5 gap-2">
          <span className="text-[8px] font-bold text-white/40 tracking-widest">VOL</span>
          <button
            onClick={() => handleVolChange(0.1)}
            className="w-8 h-6 bg-[#333] rounded-t-lg shadow-[0_2px_0_#111] active:translate-y-[2px] active:shadow-[0_0_0_#111] flex items-center justify-center transition-all"
          >
            <Plus className="w-3 h-3 text-white/70" />
          </button>

          <div className="flex items-center gap-1 w-full justify-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 h-1.5 rounded-sm",
                  volume >= (i + 1) * 0.2 ? "bg-green-500 shadow-[0_0_5px_#22c55e]" : "bg-[#222]",
                )}
              />
            ))}
          </div>

          <button
            onClick={() => handleVolChange(-0.1)}
            className="w-8 h-6 bg-[#333] rounded-b-lg shadow-[0_2px_0_#111] active:translate-y-[2px] active:shadow-[0_0_0_#111] flex items-center justify-center transition-all"
          >
            <Minus className="w-3 h-3 text-white/70" />
          </button>
        </div>

        <div className="w-full h-px bg-black/50 border-b border-white/10" />

        {/* Toggles - Triangular Layout for Space */}
        <div className="flex flex-col gap-4 w-full pt-2">
          <div className="flex justify-between w-full px-1">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setPixelated(!pixelated)}
                title={t.toggleFilter}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shadow-[0_2px_0_#111] active:translate-y-[1px] active:shadow-none transition-all",
                  pixelated ? "bg-blue-600 shadow-[0_2px_0_#004]" : "bg-[#444]",
                )}
              >
                <Monitor className="w-3 h-3 text-white/90" />
              </button>
              <span className="text-[7px] font-bold text-white/30 tracking-widest">FLT</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowP2(!showP2)}
                title={t.toggleP2}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shadow-[0_2px_0_#111] active:translate-y-[1px] active:shadow-none transition-all",
                  showP2 ? "bg-yellow-600 shadow-[0_2px_0_#440]" : "bg-[#444]",
                )}
              >
                <Users className="w-3 h-3 text-white/90" />
              </button>
              <span className="text-[7px] font-bold text-white/30 tracking-widest">2P</span>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowKeyHints(!showKeyHints)}
                title={t.toggleHints}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shadow-[0_2px_0_#111] active:translate-y-[1px] active:shadow-none transition-all",
                  showKeyHints ? "bg-purple-600 shadow-[0_2px_0_#404]" : "bg-[#444]",
                )}
              >
                <Info className="w-3 h-3 text-white/90" />
              </button>
              <span className="text-[7px] font-bold text-white/30 tracking-widest">HINT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div
        className="mt-2 text-[10px] font-black text-[#555] tracking-widest italic"
        style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.5)" }}
      >
        DropNES
      </div>
      <div className="mt-1 flex gap-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-3 bg-black/30 rounded-full" />
        ))}
      </div>
    </motion.div>
  );
}
