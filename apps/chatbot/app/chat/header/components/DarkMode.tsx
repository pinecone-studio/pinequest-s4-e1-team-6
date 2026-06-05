"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
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
    group relative flex items-center rounded-xl py-2
    transition-all duration-200 ease-out
    hover:bg-black/5 dark:hover:bg-white/10
    active:scale-[0.97]

    ${collapsed ? "justify-center px-2" : "gap-2 px-3 w-full"}
  `}
      >
        <Palette
          className="
      h-5 w-5
      text-slate-500 dark:text-slate-400
      group-hover:text-black dark:group-hover:text-white
      transition
    "
        />
        {collapsed && (
          <div
            className="
      pointer-events-none
      absolute left-full ml-3 top-1/2 -translate-y-1/2
      px-2 py-1 rounded-md text-xs
      bg-black/80 text-white
      dark:bg-white dark:text-black
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
          <span className="text-sm text-slate-600 dark:text-slate-300 ">
            Theme
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className="w-44">
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
