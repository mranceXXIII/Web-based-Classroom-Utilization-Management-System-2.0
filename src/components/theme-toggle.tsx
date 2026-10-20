"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/* Theme toggle (FR-032): toggles .dark on <html>, persists to localStorage key
 * "theme", defaults to system preference (root layout pre-hydration script does
 * the initial paint; this component only reads after mount → no hydration
 * mismatch). Icon-only button carries an accessible label (app-interface.md #1). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // storage unavailable — session-only theme
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {mounted && isDark
        ? <Sun aria-hidden="true" className="h-4 w-4" />
        : <Moon aria-hidden="true" className="h-4 w-4" />}
    </button>
  );
}
