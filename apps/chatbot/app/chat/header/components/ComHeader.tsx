import React from "react";
import { ClerkAuth } from "./Clerk";
import { DarkMode } from "./DarkMode";

export const ComHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-black/10 dark:border-white/5 bg-background">
      <button
        onClick={toggleSidebar}
        className="hover:opacity-70 transition-all"
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
