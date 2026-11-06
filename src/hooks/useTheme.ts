"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  // Lazy initializer — reads localStorage once synchronously, no setState-in-effect
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("instapulse_theme") as Theme | null) ?? "system";
  });
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  // Resolve effective theme and apply to <html>
  useEffect(() => {
    const applyTheme = () => {
      let effective: "light" | "dark";
      if (theme === "system") {
        effective = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        effective = theme;
      }
      setResolved(effective);
      document.documentElement.classList.toggle("dark", effective === "dark");
    };

    applyTheme();

    // Listen for system theme changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("instapulse_theme", t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return { theme, resolved, setTheme, toggle };
}
