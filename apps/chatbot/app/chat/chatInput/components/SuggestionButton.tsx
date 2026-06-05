"use client";
import { motion } from "framer-motion";

interface Props {
  label: string;
  query: string;
  onClick: (query: string) => void;
  index: number;
}

export const SuggestionButton = ({ label, query, onClick, index }: Props) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.1 }}
    onClick={() => onClick(query)}
    className="px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-[#007AFF] dark:hover:border-[#C5A059] text-slate-600 dark:text-slate-300 text-xs md:text-sm rounded-full transition-all shadow-sm"
  >
    {label}
  </motion.button>
);