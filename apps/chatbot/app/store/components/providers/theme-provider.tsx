"use client";

import * as React from "react";
import { ThemeProvider as AppThemeProvider } from "@/app/context/ThemeProvider";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof AppThemeProvider>) {
  return <AppThemeProvider {...props}>{children}</AppThemeProvider>;
}
