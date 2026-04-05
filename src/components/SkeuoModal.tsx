import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, Check, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeuoModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
  lang: "zh" | "en";
}

export default function SkeuoModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  type = "info",
  lang,
}: SkeuoModalProps) {
  const isConfirmOnly = !onCancel;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel || onConfirm}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Body */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#d0d0d0] border-[6px] border-[#1a1a1a] rounded-xl shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_2px_0_rgba(255,255,255,0.5)] overflow-hidden"
          >
            {/* Header / Accent Bar */}
            <div className={cn("h-2 w-full", type === "danger" ? "bg-red-600" : "bg-blue-600")} />

            <div className="p-8 flex flex-col items-center gap-6">
              {/* Icon */}
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#1a1a1a] shadow-inner",
                  type === "danger" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600",
                )}
              >
                {type === "danger" ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : (
                  <Info className="w-8 h-8" />
                )}
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                {title && (
                  <h3 className="text-lg font-black text-black uppercase tracking-tighter">
                    {title}
                  </h3>
                )}
                <p className="text-sm font-bold text-black/70 leading-relaxed">{message}</p>
              </div>

              {/* Actions */}
              <div
                className={cn(
                  "flex gap-4 w-full mt-2",
                  isConfirmOnly ? "justify-center" : "justify-between",
                )}
              >
                {!isConfirmOnly && (
                  <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-[#888] border-b-4 border-[#555] active:border-b-0 active:translate-y-1 rounded font-black text-xs text-white uppercase tracking-widest hover:bg-[#999] transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-3 h-3" />
                    {cancelText || (lang === "zh" ? "取消" : "CANCEL")}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  className={cn(
                    "flex-1 px-6 py-3 rounded font-black text-xs text-white uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    type === "danger"
                      ? "bg-red-600 border-b-4 border-red-900 hover:bg-red-500"
                      : "bg-green-600 border-b-4 border-green-900 hover:bg-green-500",
                    "active:border-b-0 active:translate-y-1",
                  )}
                >
                  <Check className="w-3 h-3" />
                  {confirmText || (lang === "zh" ? "确认" : "CONFIRM")}
                </button>
              </div>
            </div>

            {/* Retro Vents Decoration */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-4 h-1 bg-black rounded-full" />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
