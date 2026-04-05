import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Cpu, Zap, Clock, Coins, Globe, Github } from "lucide-react";
import { themes, Theme } from "./styles/themes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Emulator, { EmulatorHandle } from "./components/Emulator";
import ControllerHUD from "./components/ControllerHUD";
import RemoteControl from "./components/RemoteControl";
import Cartridge from "./components/Cartridge";
import CartridgeShop from "./components/CartridgeShop";
import SkeuoModal from "./components/SkeuoModal";
import { SaveSystem } from "./utils/saveSystem";
import { RecentGamesManager, RecentGame } from "./utils/recentGames";
import { KeyMap, KeyMapManager, getFriendlyKeyName, getButtonName } from "./utils/keyMap";
import { i18n, Language } from "./utils/i18n";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("cyberpunk");
  const [lang, setLang] = useState<Language>("zh");
  const [romData, setRomData] = useState<string | null>(null);
  const [romName, setRomName] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [pixelated, setPixelated] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showKeyHints, setShowKeyHints] = useState(true);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [keyMap, setKeyMap] = useState<KeyMap>(KeyMapManager.load(1));
  const [keyMap2, setKeyMap2] = useState<KeyMap>(KeyMapManager.load(2));
  const [showP2, setShowP2] = useState(false);
  const [insertingCoin, setInsertingCoin] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState(0);

  const [pendingSaveState, setPendingSaveState] = useState<any | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: "danger" | "info";
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emulatorRef = useRef<EmulatorHandle>(null);

  const currentTheme = themes[theme];
  const t = i18n[lang];

  // Async Initialization
  useEffect(() => {
    const init = async () => {
      await RecentGamesManager.migrateFromLocalStorage();
      const games = await RecentGamesManager.getGames();
      setRecentGames(games);
    };
    init();
  }, []);

  // Apply pending save state once the emulator is ready
  useEffect(() => {
    if (pendingSaveState && romData && emulatorRef.current) {
      // Small delay to ensure jsnes is fully initialized
      const timer = setTimeout(() => {
        emulatorRef.current?.load(pendingSaveState);
        setPendingSaveState(null);
        setConflictMsg("🚀 " + (lang === "zh" ? "存档已恢复！" : "SAVE_STATE_RESTORED!"));
        setTimeout(() => setConflictMsg(null), 3000);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingSaveState, romData, lang]);

  // Cycling tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % (t.tips as string[]).length);
    }, 10000); // Change tip every 10 seconds
    return () => clearInterval(tipInterval);
  }, [t.tips, lang]);

  const playCoinSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01 * volume, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);

      setInsertingCoin(true);
      setTimeout(() => setInsertingCoin(false), 500);
    } catch (e) {
      console.error("Coin sound failed", e);
    }
  }, [volume]);

  const handleKeyBind = useCallback(
    (buttonId: number, code: string, player: number = 1) => {
      // Global Conflict Detection
      let conflictPlayer: number | null = null;
      let conflictButton: number | null = null;

      const findConflict = (map: KeyMap, pNum: number) => {
        for (const [btnStr, key] of Object.entries(map)) {
          const btnId = Number(btnStr);
          if (player === pNum && btnId === buttonId) continue;
          if (key === code) {
            conflictPlayer = pNum;
            conflictButton = btnId;
            return true;
          }
        }
        return false;
      };

      if (findConflict(keyMap, 1) || findConflict(keyMap2, 2)) {
        const template = t.keyInUse as string;
        const playerStr = lang === "zh" ? `玩家${conflictPlayer}` : `Player ${conflictPlayer}`;
        const msg = template
          .replace("[{key}]", getFriendlyKeyName(code))
          .replace("[{player}]", playerStr)
          .replace("[{button}]", getButtonName(conflictButton!, lang));

        setConflictMsg(msg);
        setTimeout(() => setConflictMsg(null), 3000);
        return;
      }

      if (player === 1) {
        setKeyMap((prev) => {
          const next = { ...prev, [buttonId]: code };
          KeyMapManager.save(next, 1);
          return next;
        });
      } else {
        setKeyMap2((prev) => {
          const next = { ...prev, [buttonId]: code };
          KeyMapManager.save(next, 2);
          return next;
        });
      }
    },
    [keyMap, keyMap2, t.keyInUse, lang],
  );

  const captureThumbnail = useCallback(async () => {
    if (emulatorRef.current && romName) {
      const thumb = emulatorRef.current.getScreenshot();
      if (thumb) {
        await RecentGamesManager.updateThumbnail(romName, thumb);
        const games = await RecentGamesManager.getGames();
        setRecentGames(games);
      }
    }
  }, [romName]);

  // Capture a thumbnail a few seconds after loading
  useEffect(() => {
    if (romData && romName && !paused) {
      const timer = setTimeout(() => {
        captureThumbnail();
      }, 5000); // 5 seconds after start
      return () => clearTimeout(timer);
    }
  }, [romData, romName, paused, captureThumbnail]);

  const handleEmulatorError = useCallback(
    (mapper: string) => {
      const msg = (t.unsupportedMapper as string).replace("{mapper}", mapper);
      setConflictMsg(msg);
      setTimeout(() => {
        setConflictMsg(null);
        setRomData(null);
        setRomName(null);
      }, 5000);
    },
    [t.unsupportedMapper],
  );

  const loadRomData = async (name: string, data: string) => {
    playCoinSound();
    setRomData(data);
    setRomName(name);
    setPaused(false);
    await RecentGamesManager.saveGame(name, data);
    const games = await RecentGamesManager.getGames();
    setRecentGames(games);
  };

  const handleFile = useCallback(
    (file: File) => {
      if (file.name.endsWith(".dnes")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const state = SaveSystem.importFromFile(e.target?.result as string);
          if (state) {
            if (state.romName === romName && emulatorRef.current) {
              emulatorRef.current.load(state.nesState);
              setConflictMsg("🚀 " + (lang === "zh" ? "存档已恢复！" : "SAVE_STATE_RESTORED!"));
              setTimeout(() => setConflictMsg(null), 3000);
            } else {
              const history = await RecentGamesManager.getGames();
              const matchedGame = history.find((g) => g.name === state.romName);
              if (matchedGame) {
                setPendingSaveState(state.nesState);
                loadRomData(matchedGame.name, matchedGame.data);
              } else {
                setConflictMsg(
                  "❌ " +
                    (lang === "zh"
                      ? "找不到对应的 ROM 文件！请先拖入游戏 ROM 再导入存档。"
                      : "ROM NOT FOUND! PLEASE UPLOAD ROM FIRST."),
                );
                setTimeout(() => setConflictMsg(null), 5000);
              }
            }
          }
        };
        reader.readAsText(file);
        return;
      }

      if (!file.name.endsWith(".nes") && !file.name.endsWith(".neo")) {
        setModalConfig({
          isOpen: true,
          type: "danger",
          message:
            lang === "zh"
              ? "无效的文件类型：请上传 .nes 或 .neo 格式的游戏文件"
              : "INVALID_ROM_TYPE: PLEASE_UPLOAD_.NES_OR_.NEO_FILE",
          onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        loadRomData(file.name, data);
      };
      reader.readAsBinaryString(file);
    },
    [romName, lang, playCoinSound, loadRomData],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSave = async () => {
    if (emulatorRef.current && romName) {
      await captureThumbnail();
      const state = SaveSystem.createSaveState(
        {
          toJSON: () => emulatorRef.current?.save(),
        } as any,
        romName,
      );
      SaveSystem.exportToFile(state);
    }
  };

  const handleDeleteGame = useCallback(
    (name: string) => {
      setModalConfig({
        isOpen: true,
        type: "danger",
        message: t.deleteConfirm as string,
        onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
        onConfirm: async () => {
          await RecentGamesManager.deleteGame(name);
          const games = await RecentGamesManager.getGames();
          setRecentGames(games);
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    [t.deleteConfirm],
  );

  const handleClearLibrary = useCallback(() => {
    setModalConfig({
      isOpen: true,
      type: "danger",
      message: t.clearConfirm as string,
      onCancel: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
      onConfirm: async () => {
        await RecentGamesManager.clear();
        setRecentGames([]);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  }, [t.clearConfirm]);

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500 overflow-x-hidden relative",
        currentTheme.bg,
        currentTheme.font,
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <SkeuoModal
        isOpen={modalConfig.isOpen}
        message={modalConfig.message}
        type={modalConfig.type}
        lang={lang}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        accept=".nes,.neo,.dnes"
      />

      {currentTheme.scanline && <div className="scanline crt-flicker pointer-events-none" />}

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-40 border-b px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-md",
          currentTheme.accent,
        )}
      >
        <div className="flex items-center gap-3">
          <Cpu className={cn("w-6 h-6", currentTheme.primary)} />
          <h1
            className={cn(
              "text-xl font-bold tracking-tighter uppercase neon-text",
              currentTheme.primary,
            )}
          >
            DropNES <span className="opacity-50 font-light">v0.0.1</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {conflictMsg ? (
              <motion.div
                key="msg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "px-4 py-1.5 text-white font-bold tracking-widest text-[10px] rounded border-2 shadow-lg",
                  conflictMsg.includes("🚀")
                    ? "bg-green-600 border-green-400 shadow-green-900/50"
                    : "bg-red-600 border-red-400 shadow-red-900/50",
                )}
              >
                {conflictMsg}
              </motion.div>
            ) : (
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "px-4 py-1.5 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm hidden lg:block max-w-xs",
                  currentTheme.primary,
                )}
              >
                <span className="text-[9px] font-bold tracking-widest uppercase truncate block">
                  {(t.tips as string[])[currentTip]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {romName && (
            <div
              className={cn(
                "hidden md:flex flex-col items-end gap-1 px-3 py-1 border border-dashed rounded",
                currentTheme.accent,
              )}
            >
              <div className="flex items-center gap-2">
                <Zap className={cn("w-4 h-4", currentTheme.primary)} />
                <span className={cn("text-xs uppercase", currentTheme.primary)}>{romName}</span>
              </div>
              <span className={cn("text-[8px] uppercase opacity-50", currentTheme.primary)}>
                {t.dragToSwitch}
              </span>
            </div>
          )}

          <a
            href="https://github.com/miaoston/DropNES"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-center p-1.5 border transition-all hover:bg-white/10 hover:scale-110",
              currentTheme.accent,
              currentTheme.primary,
            )}
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs border transition-all hover:bg-white/10",
              currentTheme.accent,
              currentTheme.primary,
            )}
            title="Toggle Language"
          >
            <Globe className="w-3 h-3" />
            {lang === "zh" ? "EN" : "中"}
          </button>

          <div className="flex gap-2">
            {(["matrix", "cyberpunk", "tactical"] as Theme[]).map((themeName) => (
              <button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={cn(
                  "px-2 py-1 text-[10px] uppercase border transition-all hover:scale-105",
                  theme === themeName
                    ? cn("bg-current opacity-100", currentTheme.bg)
                    : "opacity-40 hover:opacity-100",
                  themes[themeName].primary.replace("text-", "border-").replace("text-", "text-"),
                )}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 flex flex-col items-center justify-center min-h-[calc(100vh-40px)]">
        <AnimatePresence mode="wait">
          {!romData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl flex flex-col gap-8"
            >
              <div
                className={cn(
                  "w-full aspect-video border-2 border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer group transition-all relative overflow-hidden",
                  currentTheme.accent,
                  "hover:bg-white/5",
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <motion.div
                  animate={
                    insertingCoin
                      ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                      : { y: [0, -10, 0] }
                  }
                  transition={{
                    duration: insertingCoin ? 0.3 : 4,
                    repeat: insertingCoin ? 0 : Infinity,
                  }}
                >
                  {insertingCoin ? (
                    <Coins className={cn("w-16 h-16 text-yellow-400")} />
                  ) : (
                    <Upload
                      className={cn(
                        "w-16 h-16 opacity-20 group-hover:opacity-100 transition-opacity",
                        currentTheme.primary,
                      )}
                    />
                  )}
                </motion.div>

                <div className="text-center space-y-2">
                  <p className={cn("text-lg uppercase tracking-widest", currentTheme.primary)}>
                    {t.dropToUpload}
                  </p>
                  <p
                    className={cn(
                      "text-xs opacity-50 uppercase tracking-tighter",
                      currentTheme.primary,
                    )}
                  >
                    {t.clickToSelect}
                  </p>
                </div>

                <div
                  className={cn(
                    "mt-4 text-xs opacity-50 uppercase text-center space-y-1",
                    currentTheme.primary,
                  )}
                >
                  <p>{t.clickToBind}</p>
                </div>

                <div
                  className={cn(
                    "absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2",
                    currentTheme.accent,
                  )}
                />
                <div
                  className={cn(
                    "absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2",
                    currentTheme.accent,
                  )}
                />
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2",
                    currentTheme.accent,
                  )}
                />
                <div
                  className={cn(
                    "absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2",
                    currentTheme.accent,
                  )}
                />
              </div>

              <CartridgeShop t={t} />

              {recentGames.length > 0 && (
                <div
                  className="w-full border p-6 space-y-6 bg-black/40 backdrop-blur-sm relative"
                  style={{ borderColor: themes[theme].accent.replace("border-", "") }}
                >
                  <div
                    className="flex items-center justify-between border-b pb-2"
                    style={{ borderColor: themes[theme].accent.replace("border-", "") }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={cn("w-4 h-4", currentTheme.primary)} />
                      <h2 className={cn("uppercase text-sm tracking-widest", currentTheme.primary)}>
                        {t.recentData}
                      </h2>
                    </div>
                    <button
                      onClick={handleClearLibrary}
                      className={cn(
                        "text-[10px] uppercase px-2 py-1 border transition-all hover:bg-red-600 hover:text-white opacity-50 hover:opacity-100",
                        currentTheme.accent,
                        currentTheme.primary,
                      )}
                    >
                      {t.clearHistory}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <AnimatePresence>
                      {recentGames.map((game) => (
                        <Cartridge
                          key={game.name}
                          name={game.name}
                          thumbnail={game.thumbnail}
                          onClick={() => {
                            loadRomData(game.name, game.data);
                          }}
                          onDelete={() => handleDeleteGame(game.name)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-12 w-full max-w-[95vw] relative"
            >
              <RemoteControl
                paused={paused}
                setPaused={setPaused}
                volume={volume}
                setVolume={setVolume}
                pixelated={pixelated}
                setPixelated={setPixelated}
                showP2={showP2}
                setShowP2={setShowP2}
                showKeyHints={showKeyHints}
                setShowKeyHints={setShowKeyHints}
                onReset={() => emulatorRef.current?.reset()}
                onEject={() => {
                  captureThumbnail();
                  setRomData(null);
                  setRomName(null);
                }}
                onSave={handleSave}
                onLoad={() => fileInputRef.current?.click()}
                theme={theme}
                t={t}
              />

              <motion.div
                className="absolute left-0 top-[10%] z-30 cursor-grab active:cursor-grabbing hidden lg:block"
                drag
                dragMomentum={false}
              >
                <ControllerHUD
                  theme={currentTheme}
                  keyMap={keyMap}
                  onKeyBind={(btn, code) => handleKeyBind(btn, code, 1)}
                  playerNum={1}
                  t={t}
                  showKeyHints={showKeyHints}
                />
              </motion.div>

              <AnimatePresence>
                {showP2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-0 top-[10%] z-30 cursor-grab active:cursor-grabbing hidden lg:block"
                    drag
                    dragMomentum={false}
                  >
                    <ControllerHUD
                      theme={currentTheme}
                      keyMap={keyMap2}
                      onKeyBind={(btn, code) => handleKeyBind(btn, code, 2)}
                      playerNum={2}
                      t={t}
                      showKeyHints={showKeyHints}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="lg:hidden flex flex-col gap-6">
                <ControllerHUD
                  theme={currentTheme}
                  keyMap={keyMap}
                  onKeyBind={(btn, code) => handleKeyBind(btn, code, 1)}
                  playerNum={1}
                  t={t}
                  showKeyHints={showKeyHints}
                />
                {showP2 && (
                  <ControllerHUD
                    theme={currentTheme}
                    keyMap={keyMap2}
                    onKeyBind={(btn, code) => handleKeyBind(btn, code, 2)}
                    playerNum={2}
                    t={t}
                    showKeyHints={showKeyHints}
                  />
                )}
              </div>

              <motion.div
                className="flex flex-col items-center gap-6 relative z-10 cursor-grab active:cursor-grabbing"
                drag
                dragMomentum={false}
              >
                <div className="relative p-8 bg-[#1a1a1a] rounded-[2rem] border-[12px] border-[#333] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] flex-shrink-0">
                  <div className="absolute right-3 top-8 bottom-8 w-4 flex flex-col justify-between opacity-30">
                    <div className="flex flex-col gap-1">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-[2px] w-full bg-black rounded-full" />
                      ))}
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                      <div className="w-3 h-3 rounded-full bg-[#444] border border-black shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-[#444] border border-black shadow-sm" />
                    </div>
                  </div>

                  <div className="relative pr-8">
                    <div
                      className="relative min-w-[300px] w-[600px] max-w-[75vw] resize overflow-hidden bg-black shadow-[inset_0_0_50px_rgba(0,0,0,1)] border-[16px] border-[#0a0a0a] rounded-[3rem]"
                      style={{ resize: "both", aspectRatio: "256 / 240" }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Emulator
                        ref={emulatorRef}
                        romData={romData}
                        paused={paused}
                        pixelated={pixelated}
                        keyMap={keyMap}
                        keyMap2={keyMap2}
                        volume={volume}
                        onError={handleEmulatorError}
                      />

                      {paused && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10 pointer-events-none">
                          <div
                            className={cn(
                              "text-4xl font-black italic tracking-tighter uppercase neon-text",
                              currentTheme.primary,
                            )}
                          >
                            {t.systemPaused}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                    <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
                      {t.console} TV
                    </span>
                  </div>
                </div>

                <div
                  className="relative w-80 h-16 bg-[#e0e0e0] border-t-8 border-[#333] border-b-4 border-[#999] rounded-b-xl shadow-2xl flex items-center justify-between px-6 z-0"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-4 bg-black rounded-t-sm shadow-inner" />

                  <div
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                    onClick={() => setPaused(!paused)}
                  >
                    <div
                      className={cn(
                        "w-10 h-4 rounded-sm shadow-md transition-all",
                        paused ? "bg-red-800" : "bg-red-600 shadow-[0_0_10px_red]",
                      )}
                    />
                    <span className="text-[10px] font-black text-black/50 tracking-tighter">
                      {t.power}
                    </span>
                  </div>

                  <div
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                    onClick={() => emulatorRef.current?.reset()}
                  >
                    <div className="w-10 h-4 bg-[#888] rounded-sm shadow-md border border-black/10" />
                    <span className="text-[10px] font-black text-black/50 tracking-tighter">
                      {t.reset}
                    </span>
                  </div>

                  <div className="absolute -bottom-2 left-12 w-16 h-3 bg-black flex items-center justify-between px-1">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-[3px] h-1.5 bg-[#444] rounded-full" />
                    ))}
                  </div>
                  {showP2 && (
                    <div className="absolute -bottom-2 right-12 w-16 h-3 bg-black flex items-center justify-between px-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-[3px] h-1.5 bg-[#444] rounded-full" />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 px-6 py-2 flex justify-between text-[10px] uppercase opacity-40 pointer-events-none bg-black/50 backdrop-blur-sm z-50">
        <div className={currentTheme.primary}>
          {t.status}: {paused ? t.paused : t.operational} | {t.filter}:{" "}
          {pixelated ? t.pixelPerfect : t.smooth}
        </div>
        <div className={currentTheme.primary}>DropNES // Bring Your Own Game</div>
      </footer>
    </div>
  );
}
