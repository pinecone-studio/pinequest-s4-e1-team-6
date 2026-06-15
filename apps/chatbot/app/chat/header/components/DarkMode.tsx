"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/app/context/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DarkMode = ({ collapsed }: { collapsed: boolean }) => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`
    apple-liquid-control group relative flex items-center rounded-2xl py-2
    transition-all duration-200 ease-out
    text-white hover:bg-white/18 dark:text-white dark:hover:bg-white/14
    active:scale-[0.97]

    ${collapsed ? "justify-center px-2.5" : "gap-2 px-3 w-full"}
  `}
      >
        <Palette
          className="
      h-5 w-5
      text-white
      group-hover:text-white
      transition
    "
        />
        {collapsed && (
          <div
            className="
            pointer-events-none
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            px-2 py-1 rounded-md text-xs
      bg-white/95 text-slate-900 shadow-lg ring-1 ring-black/10
      dark:bg-slate-950 dark:text-slate-100 dark:ring-white/10
            opacity-0 translate-x-[-6px]
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-200
      whitespace-nowrap z-[9999]
    "
          >
            Theme
          </div>
        )}
        {!collapsed && (
          <span className="text-sm text-white">Theme</span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className="w-44 border-black/10 bg-white text-slate-900 shadow-xl dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          ☀️ Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          🌙 Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          💻 System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
