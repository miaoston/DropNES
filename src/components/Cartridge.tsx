import { motion } from "framer-motion";
import { X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CartridgeProps {
  name: string;
  thumbnail?: string;
  onClick: () => void;
  onDelete?: () => void;
}

export default function Cartridge({ name, thumbnail, onClick, onDelete }: CartridgeProps) {
  // Generate a random seed based on name to pick cartridge color
  const colors = [
    { shell: "bg-[#d0d0d0]", label: "bg-white", border: "border-[#999]" }, // Classic Gray
    { shell: "bg-[#b89947]", label: "bg-[#ffcc00]", border: "border-[#8a7235]" }, // Zelda Gold
    { shell: "bg-[#222]", label: "bg-[#111]", border: "border-black" }, // Stealth Black
    { shell: "bg-[#802020]", label: "bg-[#ffaaaa]", border: "border-[#501010]" }, // Red
  ];

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];

  // Generate a random slight rotation for the messy desk look
  const initialRotation = (hash % 15) - 7; // -7 to +7 degrees

  return (
    <motion.div
      layout
      initial={{ rotate: initialRotation, opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      whileHover={{ y: -10, rotate: 0, scale: 1.05, zIndex: 10 }}
      whileTap={{ y: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative w-28 h-32 border-[3px] rounded-t-sm shadow-[5px_5px_10px_rgba(0,0,0,0.5)] cursor-pointer flex flex-col items-center pt-2 transition-colors flex-shrink-0 group",
        color.shell,
        color.border,
      )}
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 hover:bg-red-700 hover:scale-110 transition-all z-20"
          title="Remove Game"
        >
          <X className="w-3 h-3 stroke-[4px]" />
        </button>
      )}

      {/* Top Ribs */}
      <div className="absolute top-1 left-2 w-24 h-3 flex flex-col justify-between opacity-30 pointer-events-none">
        <div className="w-full h-px bg-black" />
        <div className="w-full h-px bg-black" />
        <div className="w-full h-px bg-black" />
      </div>

      {/* Side Grooves */}
      <div className="absolute top-5 left-1 w-1 h-14 border-r border-black/20 pointer-events-none" />
      <div className="absolute top-5 right-1 w-1 h-14 border-l border-black/20 pointer-events-none" />

      {/* Label Sticker */}
      <div
        className={cn(
          "mt-4 w-24 h-20 border-2 border-black/10 rounded-sm p-1 shadow-inner relative flex flex-col items-center justify-center overflow-hidden text-center pointer-events-none",
          color.label,
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : null}

        {/* Fake seal of quality */}
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-yellow-600/50 flex items-center justify-center z-10 bg-white/20 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full border border-yellow-600/30" />
        </div>

        <div className="relative z-10 bg-black/60 w-full py-0.5 mt-auto">
          <span className="text-[7px] font-black leading-tight text-white line-clamp-2 break-all px-1">
            {name.replace(".nes", "").replace(".neo", "")}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5 z-20" />
      </div>

      {/* Bottom gap */}
      <div className="absolute bottom-0 w-20 h-1.5 bg-black/20 rounded-t-sm pointer-events-none group-active:bg-black/40 transition-colors" />
    </motion.div>
  );
}
