"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NavActions = () => {
  const { setTheme } = useTheme();
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center gap-4">
      {!isSignedIn ? (
        <SignInButton mode="redirect">
          <button className="px-4 py-2 text-sm font-medium rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            Sign in
          </button>
        </SignInButton>
      ) : (
        <UserButton />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center rounded-full w-10 h-10 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};