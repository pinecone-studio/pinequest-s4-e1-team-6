"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const SuccessToast = ({
  message,
  isVisible,
  onClose,
}: SuccessToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-300 pointer-events-none p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20, filter: "brightness(2)" }}
            animate={{ scale: 1, opacity: 1, y: 0, filter: "brightness(1)" }}
            exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="relative w-full max-w-md sm:w-auto" // Утас дээр бүтэн өргөнөөр харах боловч хамгийн ихдээ max-w-md байна
          >
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 via-cyan-400 to-indigo-600 rounded-3xl blur-xl opacity-50 animate-pulse" />

            {/* min-w-100-ийг утас дээр min-w-full эсвэл min-w-0 болгож, sm:min-w-100 болгон засав */}
            <div className="relative bg-gray-950 border-2 border-indigo-500/50 p-6 sm:p-8 px-8 sm:px-12 rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.4)] flex flex-col items-center gap-4 w-full min-w-0 sm:min-w-100">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
              </div>

              {/* Зурвасын дүрс (Icon)-ийг утас дээр үл mүл жижигсгэв */}
              <motion.div
                initial={{ rotateY: 180, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
              </motion.div>

              <div className="text-center space-y-1 w-full">
                <motion.h3
                  initial={{ letterSpacing: "0.5em", opacity: 0 }}
                  animate={{ letterSpacing: "0.2em", opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[10px] sm:text-xs font-black text-indigo-400 uppercase tracking-[0.3em]"
                >
                  Successful
                </motion.h3>
                {/* Текст урт байсан ч утасны дэлгэц рүү шахагдаж орохоор break-words хийв */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] break-words max-w-full">
                  {message}
                </h2>
              </div>

              <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-2 sm:mt-4 overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="w-full h-full bg-linear-to-r from-indigo-500 to-cyan-400"
                />
              </div>

              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-bounce" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
