"use client";

import React, { useRef, useEffect } from "react";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Badge } from "@/components/ui/badge";
import { formatTime, cn } from "@/lib/utils";
import { SubtitleEntry } from "@/types";

interface SubtitleListProps {
  onSeek: (time: number) => void;
  className?: string;
}

export function SubtitleList({ onSeek, className }: SubtitleListProps) {
  const { tracks, activeTrackIds } = useSubtitleStore();
  const { currentTime } = usePlayerStore();
  const activeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const primaryTrack = tracks.find((t) => t.id === activeTrackIds[0]);
  const secondaryTrack = tracks.find((t) => t.id === activeTrackIds[1]);

  // Scroll HANYA di dalam panel transcript, bukan seluruh halaman
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      const offset =
        activeRect.top -
        containerRect.top -
        containerRect.height / 2 +
        activeRect.height / 2;

      container.scrollBy({ top: offset, behavior: "smooth" });
    }
  }, [currentTime]);

  if (!primaryTrack) {
    return (
      <div
        className={cn(
          "flex items-center justify-center py-12 text-muted-foreground text-sm",
          className
        )}
      >
        Load a subtitle to see transcript
      </div>
    );
  }

  const isActive = (entry: SubtitleEntry) =>
    currentTime >= entry.startTime && currentTime <= entry.endTime;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto scrollbar-thin p-2 space-y-1 h-full", className)}
    >
      {primaryTrack.entries.map((entry) => {
        const active = isActive(entry);
        const secondaryEntry = secondaryTrack?.entries.find(
          (se) =>
            Math.abs(se.startTime - entry.startTime) < 2 ||
            (se.startTime <= entry.endTime && se.endTime >= entry.startTime)
        );

        return (
          <div
            key={entry.id}
            ref={active ? activeRef : undefined}
            onClick={() => onSeek(entry.startTime)}
            className={cn(
              "group flex gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
              "hover:bg-accent/60",
              active && "bg-primary/10 border border-primary/30"
            )}
          >
            <div className="flex-shrink-0 pt-0.5">
              <Badge
                variant={active ? "default" : "secondary"}
                className="text-[10px] font-mono h-5 tabular-nums"
              >
                {formatTime(entry.startTime)}
              </Badge>
            </div>

            <div className="flex-1 space-y-1 min-w-0">
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  active ? "text-primary font-medium" : "text-foreground"
                )}
              >
                {entry.text}
              </p>
              {secondaryEntry && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {secondaryEntry.text}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}