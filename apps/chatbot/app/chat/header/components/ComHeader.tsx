import React from "react";
import { ClerkAuth } from "./Clerk";
import { DarkMode } from "./DarkMode";

export const ComHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-black/10 dark:border-white/10 bg-white/90 text-slate-900 shadow-sm backdrop-blur-xl dark:bg-slate-950/75 dark:text-slate-100 dark:shadow-black/10">
      <button
        onClick={toggleSidebar}
        className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/10"
      >
        <span>Menu</span>
      </button>

      <div className="flex items-center gap-4">
        <ClerkAuth collapsed />
        <DarkMode collapsed />
      </div>
    </header>
  );
};
