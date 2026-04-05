import { motion } from "framer-motion";
import { Store, ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CartridgeShopProps {
  t: any;
}

export default function CartridgeShop({ t }: CartridgeShopProps) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute right-[5%] top-[15%] z-30 cursor-grab active:cursor-grabbing hidden md:block"
    >
      <a
        href="https://github.com/dream1986/nesrom"
        target="_blank"
        rel="noreferrer"
        className="block group"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-40 h-32 bg-[#2a2a2a] border-4 border-[#1a1a1a] rounded-lg shadow-[20px_20px_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-end pb-2 overflow-hidden">
          {/* Awning */}
          <div className="absolute top-0 left-0 w-full h-10 flex shadow-md">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-full rounded-b-md shadow-inner",
                  i % 2 === 0 ? "bg-red-600" : "bg-white",
                )}
              />
            ))}
          </div>

          {/* Store Sign / Neon */}
          <div className="absolute top-12 w-32 h-8 bg-black border-2 border-[#333] rounded flex items-center justify-center shadow-[0_0_10px_rgba(255,0,0,0.3)]">
            <span className="text-[10px] font-black text-red-500 tracking-widest neon-text text-center leading-tight">
              GAME
              <br />
              SHOP
            </span>
          </div>

          {/* Door / Window details */}
          <div className="w-full px-4 flex justify-between items-end mt-16 opacity-50">
            <div className="w-8 h-10 border-2 border-white/20 bg-blue-900/20" />
            <Store className="w-8 h-8 text-white/40 mb-1" />
            <div className="w-8 h-10 border-2 border-white/20 bg-blue-900/20" />
          </div>

          {/* Interaction Hint */}
          <div className="absolute -bottom-8 group-hover:bottom-2 bg-black/90 px-2 py-1 rounded text-[8px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shadow-xl">
            <span>{t.rentCartridge}</span>
            <ArrowRight className="w-2 h-2" />
          </div>
        </div>
      </a>
    </motion.div>
  );
}
