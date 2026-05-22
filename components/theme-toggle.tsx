"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
    </button>
  );
}

export function FloatingThemeToggle() {
  const pathname = usePathname();

  if (pathname === "/chatbot") {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 bg-card/60 backdrop-blur-lg border border-border rounded-full shadow-2xl p-1 flex items-center justify-center">
      <ThemeToggle />
    </div>
  );
}

