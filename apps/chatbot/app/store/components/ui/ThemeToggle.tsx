"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration алдаанаас сэргийлэх хэсэг (хэвээр үлдээсэн)
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="w-full md:w-auto px-2 py-2 rounded-xl text-sm border border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 text-transparent animate-pulse">
        …
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-slate-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 select-none"
    >
      {/* Текст болон иконыг утас болон том дэлгэц дээр маш цэвэрхэн харагдуулах бүтэц */}
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase sm:normal-case">
        {isDark ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
