"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
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
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 top-4 z-300 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/20 bg-white px-4 py-3 text-slate-900 shadow-xl shadow-black/10 dark:bg-gray-900 dark:text-white"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black">Амжилттай</p>
            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
