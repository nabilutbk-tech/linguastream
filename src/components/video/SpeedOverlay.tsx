"use client";

import { usePlayerStore } from "@/stores/usePlayerStore";
import { FastForward } from "lucide-react";

export function SpeedOverlay() {
  const { speed } = usePlayerStore();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-xs z-20">
      <div className="flex items-center gap-2 bg-black/70 text-white rounded-full px-5 py-2.5 backdrop-blur-md shadow-lg">
        <FastForward className="w-5 h-5 text-emerald-400 animate-pulse" />
        <span className="font-bold text-lg">{speed}x Speed</span>
      </div>
    </div>
  );
}