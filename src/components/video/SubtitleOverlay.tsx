"use client";

import React, { useMemo } from "react";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { cn } from "@/lib/utils";

interface SubtitleOverlayProps {
  currentTime: number;
}

export function SubtitleOverlay({ currentTime }: SubtitleOverlayProps) {
  const { activeTrackIds, tracks, primaryStyle, secondaryStyle, getCurrentEntries } =
    useSubtitleStore();

  const activeEntries = useMemo(() => {
    return activeTrackIds.map((trackId, index) => {
      const entries = getCurrentEntries(currentTime, trackId);
      const track = tracks.find((t) => t.id === trackId);
      const style = index === 0 ? primaryStyle : secondaryStyle;
      return { trackId, entries, track, style, isPrimary: index === 0 };
    });
  }, [activeTrackIds, currentTime, tracks, primaryStyle, secondaryStyle, getCurrentEntries]);

  if (activeEntries.every((e) => e.entries.length === 0)) return null;

  return (
    <div className="absolute inset-x-0 bottom-14 md:bottom-16 flex flex-col items-center gap-1.5 px-4 pointer-events-none z-10">
      {activeEntries.map(({ trackId, entries, style, isPrimary }) => {
        if (entries.length === 0) return null;

        const bgColor = style.bgColor;
        const bgOpacity = style.bgOpacity;
        const rgbMatch = bgColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        let rgbaColor = `rgba(0,0,0,${bgOpacity})`;
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 16);
          const g = parseInt(rgbMatch[2], 16);
          const b = parseInt(rgbMatch[3], 16);
          rgbaColor = `rgba(${r},${g},${b},${bgOpacity})`;
        }

        return (
          <div
            key={trackId}
            className={cn(
              "text-center px-4 py-1.5 rounded-lg transition-all duration-150 max-w-[90%] pointer-events-auto select-text",
              isPrimary ? "order-2" : "order-1"
            )}
            style={{
              backgroundColor: rgbaColor,
              fontSize: `${style.fontSize}px`,
              color: style.fontColor,
              fontFamily: style.fontFamily,
            }}
          >
            {entries.map((entry) => (
              <p key={entry.id} className="subtitle-text leading-relaxed whitespace-pre-line">
                {entry.text}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}