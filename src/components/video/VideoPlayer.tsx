"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { VideoControls } from "./VideoControls";
import { SubtitleOverlay } from "./SubtitleOverlay";
import { SpeedOverlay } from "./SpeedOverlay";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function VideoPlayer({ src, poster, onTimeUpdate, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSpeed = useRef(1);

  const {
    isPlaying,
    currentTime,
    duration,
    speed,
    volume,
    isMuted,
    showSpeedOverlay,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setSpeed,
    setShowSpeedOverlay,
    setIsFullscreen,
  } = usePlayerStore();

  const { tracks } = useSubtitleStore();
  const video = videoRef.current;

  useEffect(() => {
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, video, setIsPlaying]);

  useEffect(() => {
    if (video) video.playbackRate = speed;
  }, [speed, video]);

  useEffect(() => {
    if (video) video.volume = volume;
  }, [volume, video]);

  useEffect(() => {
    if (video) video.muted = isMuted;
  }, [isMuted, video]);

  const updateDurationFromSubtitles = useCallback(() => {
    let maxSubTime = 0;
    tracks.forEach((track) => {
      if (track.entries.length > 0) {
        const lastEntry = track.entries[track.entries.length - 1];
        if (lastEntry && lastEntry.endTime > maxSubTime) {
          maxSubTime = lastEntry.endTime;
        }
      }
    });
    if (maxSubTime > 0) {
      setDuration(maxSubTime);
    }
  }, [tracks, setDuration]);

  const checkAndSetValidDuration = useCallback(() => {
    if (!video) return;
    const dur = video.duration;
    if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
      setDuration(dur);
    } else {
      updateDurationFromSubtitles();
    }
  }, [video, setDuration, updateDurationFromSubtitles]);

  const handleTimeUpdate = useCallback(() => {
    if (!video) return;
    setCurrentTime(video.currentTime);
    onTimeUpdate?.(video.currentTime);

    if (!duration || isNaN(duration) || !isFinite(duration)) {
      checkAndSetValidDuration();
    }
  }, [video, currentTime, duration, setCurrentTime, onTimeUpdate, checkAndSetValidDuration]);

  const handleSeek = useCallback(
    (time: number) => {
      if (!video) return;
      video.currentTime = time;
      setCurrentTime(time);
    },
    [video, setCurrentTime]
  );

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      previousSpeed.current = speed;
      setSpeed(2);
      setShowSpeedOverlay(true);
    }, 400);
  }, [speed, setSpeed, setShowSpeedOverlay]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isLongPress) {
      setIsLongPress(false);
      setSpeed(previousSpeed.current);
      setShowSpeedOverlay(false);
    }
  }, [isLongPress, setSpeed, setShowSpeedOverlay]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [setIsFullscreen]);

  return (
    <div
      ref={containerRef}
      className={cn("video-container relative aspect-video bg-black group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={checkAndSetValidDuration}
        onDurationChange={checkAndSetValidDuration}
        onCanPlay={checkAndSetValidDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={() => setIsPlaying(!isPlaying)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        playsInline
        preload="auto"
        {...({ referrerPolicy: "no-referrer" } as any)}
      />

      <SubtitleOverlay currentTime={currentTime} />
      {showSpeedOverlay && <SpeedOverlay />}
      <VideoControls
        visible={showControls || !isPlaying}
        videoRef={videoRef}
        onSeek={handleSeek}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}