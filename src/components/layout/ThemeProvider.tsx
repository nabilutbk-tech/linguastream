"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { checkAndCleanExpiredMedia, setLocalMedia } from "@/lib/idb";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    checkAndCleanExpiredMedia().then(() => {
      interval = setInterval(() => {
        setLocalMedia("timestamp", Date.now()).catch(() => {});
      }, 60000);
    });

    const handleVis = () => {
      if (document.visibilityState === "visible") {
        setLocalMedia("timestamp", Date.now()).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}