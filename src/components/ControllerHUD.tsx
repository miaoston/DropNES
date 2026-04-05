import { useEffect, useState } from "react";
import jsnes from "jsnes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { KeyMap, getFriendlyKeyName } from "../utils/keyMap";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ControllerHUDProps {
  theme: any;
  keyMap: KeyMap;
  onKeyBind: (buttonId: number, code: string) => void;
  playerNum?: number;
  t: Record<string, string | string[]>;
  showKeyHints?: boolean;
}

export default function ControllerHUD({
  theme,
  keyMap,
  onKeyBind,
  playerNum = 1,
  t,
  showKeyHints = true,
}: ControllerHUDProps) {
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [bindingButton, setBindingButton] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bindingButton !== null) {
        if (e.code === "Escape") {
          setBindingButton(null);
        } else {
          onKeyBind(bindingButton, e.code);
          setBindingButton(null);
        }
        e.preventDefault();
        return;
      }
      setPressed((prev) => new Set(prev).add(e.code));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [bindingButton, onKeyBind]);

  const NesButton = ({
    buttonId,
    label,
    className,
    title,
  }: {
    buttonId: number;
    label: string;
    className?: string;
    title?: string;
  }) => {
    const keyCode = keyMap[buttonId];
    const isPressed = pressed.has(keyCode);
    const isBinding = bindingButton === buttonId;

    return (
      <div
        onClick={() => setBindingButton(buttonId)}
        className={cn(
          "flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-95 group",
          isBinding && "animate-pulse scale-110 z-10",
        )}
        title={title}
      >
        <div
          className={cn(
            "w-16 h-16 flex items-center justify-center border-4 transition-all duration-75 shadow-[0_10px_20px_rgba(0,0,0,0.4)] rounded-full",
            isPressed ? "translate-y-1 shadow-inner bg-red-800" : "-translate-y-1 bg-red-600",
            isBinding ? "border-yellow-400 bg-yellow-400/20" : "border-black/40",
            className,
          )}
        >
          {isBinding ? (
            <span className="text-sm text-white animate-bounce font-black">?</span>
          ) : (
            <span className="text-3xl font-black text-black/20 group-hover:text-black/40 transition-colors">
              {label}
            </span>
          )}
        </div>
        {showKeyHints && (
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "text-xs font-mono px-2 py-0.5 border border-white/10 rounded-sm bg-black/40 shadow-inner",
                theme.primary,
              )}
            >
              {getFriendlyKeyName(keyCode)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const DPadKey = ({
    buttonId,
    className,
    icon,
    title,
    labelClass,
  }: {
    buttonId: number;
    className: string;
    icon: string;
    title?: string;
    labelClass: string;
  }) => {
    const keyCode = keyMap[buttonId];
    const isPressed = pressed.has(keyCode);
    const isBinding = bindingButton === buttonId;

    return (
      <>
        <div
          onClick={() => setBindingButton(buttonId)}
          title={title}
          className={cn(
            "absolute flex items-center justify-center cursor-pointer transition-all",
            "bg-[#1a1a1a] border-2 border-black/60 shadow-xl",
            isPressed && "bg-black scale-95 shadow-inner",
            isBinding && "bg-yellow-500/50 border-yellow-400 animate-pulse scale-110 z-10",
            className,
          )}
        >
          <span className="text-white/10 group-hover:text-white/30 text-xl">
            {isBinding ? "?" : icon}
          </span>
        </div>
        {showKeyHints && (
          <div className={cn("absolute flex justify-center pointer-events-none z-20", labelClass)}>
            <span
              className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 border border-white/10 rounded-sm bg-black/60 shadow-inner whitespace-nowrap",
                theme.primary,
              )}
            >
              {getFriendlyKeyName(keyCode)}
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className={cn(
          "flex items-center gap-4 px-6 py-2 border-2 rounded-full bg-black/20 backdrop-blur-md shadow-lg",
          theme.accent,
        )}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            playerNum === 1
              ? "bg-red-500 shadow-[0_0_10px_red]"
              : "bg-blue-500 shadow-[0_0_10px_blue]",
          )}
        />
        <span className={cn("text-sm font-black uppercase tracking-[0.3em]", theme.primary)}>
          {playerNum === 1 ? t.player1 : t.player2}
        </span>
      </div>

      {/* NES Controller Body - PRO MAX - Increased Width to 600px */}
      <div className="relative w-[600px] h-[210px] bg-gradient-to-br from-[#e0e0e0] to-[#b0b0b0] border-[8px] border-[#888] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex items-center px-12 transform hover:scale-[1.02] transition-transform duration-500">
        {/* Aesthetic NES Stripes */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-28 bg-black/5 flex flex-col justify-between py-4 border-y-[1px] border-black/10">
          <div className="w-full h-[2px] bg-white/10" />
          <div className="w-full h-[2px] bg-black/10" />
        </div>

        {/* D-PAD Area - Moved to left */}
        <div className="relative w-40 h-40 flex items-center justify-center -ml-8">
          <div className="w-36 h-36 bg-black/10 rounded-full blur-xl absolute" />
          <div className="relative w-32 h-32 bg-[#222] rounded-full shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center border-4 border-black/20">
            <DPadKey
              buttonId={jsnes.Controller.BUTTON_UP}
              className="top-0 left-1/2 -translate-x-1/2 w-10 h-13 rounded-t-xl"
              labelClass="top-6 left-1/2 -translate-x-1/2"
              icon="▲"
              title="D-Pad Up"
            />
            <DPadKey
              buttonId={jsnes.Controller.BUTTON_DOWN}
              className="bottom-0 left-1/2 -translate-x-1/2 w-10 h-13 rounded-b-xl"
              labelClass="bottom-6 left-1/2 -translate-x-1/2"
              icon="▼"
              title="D-Pad Down"
            />
            <DPadKey
              buttonId={jsnes.Controller.BUTTON_LEFT}
              className="left-0 top-1/2 -translate-y-1/2 w-13 h-10 rounded-l-xl"
              labelClass="left-6 top-1/2 -translate-y-1/2"
              icon="◀"
              title="D-Pad Left"
            />
            <DPadKey
              buttonId={jsnes.Controller.BUTTON_RIGHT}
              className="right-0 top-1/2 -translate-y-1/2 w-13 h-10 rounded-r-xl"
              labelClass="right-6 top-1/2 -translate-y-1/2"
              icon="▶"
              title="D-Pad Right"
            />
            <div className="w-10 h-10 bg-[#222] border-2 border-black/40 rounded-md shadow-inner" />
          </div>
        </div>

        {/* Center Pill Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 mt-12">
          <div className="flex gap-4">
            <div
              onClick={() => setBindingButton(jsnes.Controller.BUTTON_SELECT)}
              title="Select Button"
              className="flex flex-col items-center gap-2 cursor-pointer group w-20"
            >
              <div
                className={cn(
                  "w-12 h-4 bg-[#333] rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-all border-2 border-black/20",
                  pressed.has(keyMap[jsnes.Controller.BUTTON_SELECT])
                    ? "scale-90 bg-black translate-y-1"
                    : "-translate-y-1 hover:-translate-y-1.5",
                  bindingButton === jsnes.Controller.BUTTON_SELECT &&
                    "bg-yellow-500 animate-pulse border-yellow-400",
                )}
              />
              <span className="text-xs font-black text-black/50 uppercase tracking-tighter">
                Select
              </span>
              {showKeyHints && (
                <span
                  className={cn(
                    "text-xs font-mono font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center px-1",
                    theme.primary,
                  )}
                >
                  {getFriendlyKeyName(keyMap[jsnes.Controller.BUTTON_SELECT])}
                </span>
              )}
            </div>
            <div
              onClick={() => setBindingButton(jsnes.Controller.BUTTON_START)}
              title="Start Button"
              className="flex flex-col items-center gap-2 cursor-pointer group w-20"
            >
              <div
                className={cn(
                  "w-12 h-4 bg-[#333] rounded-full shadow-[0_5px_10px_rgba(0,0,0,0.5)] transition-all border-2 border-black/20",
                  pressed.has(keyMap[jsnes.Controller.BUTTON_START])
                    ? "scale-90 bg-black translate-y-1"
                    : "-translate-y-1 hover:-translate-y-1.5",
                  bindingButton === jsnes.Controller.BUTTON_START &&
                    "bg-yellow-500 animate-pulse border-yellow-400",
                )}
              />
              <span className="text-xs font-black text-black/50 uppercase tracking-tighter">
                Start
              </span>
              {showKeyHints && (
                <span
                  className={cn(
                    "text-xs font-mono font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center px-1",
                    theme.primary,
                  )}
                >
                  {getFriendlyKeyName(keyMap[jsnes.Controller.BUTTON_START])}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs font-black text-red-800/30 italic flex items-center gap-3 tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-red-800/20 animate-ping" />
            {t.engine}
          </div>
        </div>

        {/* Action Buttons - Diagonal Dogbone Style - Moved to right */}
        <div className="relative w-40 h-40 flex items-center justify-center -mr-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-black/10 rounded-full rotate-[-25deg] blur-xl" />
          <div className="absolute left-0 bottom-6">
            <NesButton buttonId={jsnes.Controller.BUTTON_B} label="B" title="Action Button B" />
          </div>
          <div className="absolute right-0 top-6">
            <NesButton buttonId={jsnes.Controller.BUTTON_A} label="A" title="Action Button A" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "text-xs uppercase font-black tracking-[0.2em] px-6 py-2 border-2 border-white/5 rounded-full bg-black/40 backdrop-blur-sm shadow-2xl transition-all",
          bindingButton !== null ? "text-yellow-400 border-yellow-400/50" : "opacity-60",
        )}
      >
        {bindingButton !== null ? t.waitingInput : t.proTipRebind}
      </div>
    </div>
  );
}
