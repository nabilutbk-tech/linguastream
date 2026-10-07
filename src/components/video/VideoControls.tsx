"use client";

import React, { useCallback } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { Button } from "@/components/ui/button";
import { RangeInput } from "@/components/ui/range-input";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rewind,
  FastForward,
  Gauge,
  Subtitles,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime, cn } from "@/lib/utils";

interface VideoControlsProps {
  visible: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSeek: (time: number) => void;
  onToggleFullscreen: () => void;
}

const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoControls({
  visible,
  videoRef,
  onSeek,
  onToggleFullscreen,
}: VideoControlsProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    speed,
    volume,
    isMuted,
    isFullscreen,
    setIsPlaying,
    setSpeed,
    setVolume,
    toggleMute,
  } = usePlayerStore();

  const { tracks, activeTrackIds, toggleTrack } = useSubtitleStore();

  const handleSeekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const newTime = Math.max(0, Math.min(duration || 99999, video.currentTime + seconds));
      onSeek(newTime);
    },
    [videoRef, duration, onSeek]
  );

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 transition-all duration-300 z-20",
        "bg-gradient-to-t from-black/90 via-black/50 to-transparent",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="px-3 pb-3 pt-8 space-y-2">
        {}
        <RangeInput
          value={currentTime}
          min={0}
          max={duration || 100}
          step={0.1}
          onChange={onSeek}
          aria-label="Posisi video"
          className="[--range-track:rgba(255,255,255,0.3)]"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-8 h-8 md:w-9 md:h-9"
              onClick={() => handleSeekRelative(-10)}
              title="-10s"
            >
              <Rewind className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-8 h-8 md:w-9 md:h-9"
              onClick={() => handleSeekRelative(-5)}
              title="-5s"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-8 h-8 md:w-9 md:h-9"
              onClick={() => handleSeekRelative(5)}
              title="+5s"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-8 h-8 md:w-9 md:h-9"
              onClick={() => handleSeekRelative(10)}
              title="+10s"
            >
              <FastForward className="w-4 h-4" />
            </Button>

            <span className="text-white/80 text-xs ml-2 font-mono hidden sm:inline">
              {formatTime(currentTime)} / {duration ? formatTime(duration) : "--:--"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Volume */}
            <div className="hidden md:flex items-center gap-1 mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 w-8 h-8"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <RangeInput
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.05}
                onChange={(val) => {
                  setVolume(val);
                  if (val > 0 && isMuted) toggleMute();
                }}
                aria-label="Volume"
                className="w-20 [--range-track:rgba(255,255,255,0.3)]"
              />
            </div>

            {/* Subtitle Menu Toggle */}
            {tracks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-xs px-2.5 h-8 text-white hover:bg-white/20 transition-colors gap-1 border border-white/20">
                  <Subtitles className="w-4 h-4" />
                  <span>
                    {activeTrackIds.length === 0
                      ? "Off"
                      : activeTrackIds.length === 2
                      ? "Both"
                      : "Sub 1"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs">
                      Subtitle Tracks
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {tracks.map((track, index) => {
                      const isOn = activeTrackIds.includes(track.id);
                      return (
                        <DropdownMenuItem
                          key={track.id}
                          onClick={() => toggleTrack(track.id)}
                          className="flex items-center justify-between text-xs cursor-pointer"
                        >
                          <span className="truncate pr-2">
                            {index === 0 ? "1. " : "2. "}
                            {track.label}
                          </span>
                          {isOn && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}

                    {tracks.length >= 2 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-xs justify-center font-medium text-primary cursor-pointer"
                          onClick={() => {
                            tracks.forEach((t) => {
                              if (!activeTrackIds.includes(t.id)) toggleTrack(t.id);
                            });
                          }}
                        >
                          Show Both
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs justify-center text-muted-foreground cursor-pointer"
                          onClick={() => {
                            activeTrackIds.forEach((id) => toggleTrack(id));
                          }}
                        >
                          Turn Off All
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Speed Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-xs font-mono px-2 h-8 text-white hover:bg-white/20 transition-colors">
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {speed}x
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                <DropdownMenuGroup>
                  {speedOptions.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={cn(
                        "text-sm font-mono justify-center cursor-pointer",
                        speed === s && "bg-primary/10 text-primary font-bold"
                      )}
                    >
                      {s}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-8 h-8"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}