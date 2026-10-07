"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubtitleSettings } from "@/components/video/SubtitleSettings";
import { SubtitleList } from "@/components/subtitle/SubtitleList";
import { VocabularyExtractor } from "@/components/subtitle/VocabularyExtractor";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { List, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LANGUAGES, LanguageCode, generateId } from "@/lib/utils";
import { VideoInfo } from "@/types";

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { setSlotTrack, clearTracks } = useSubtitleStore();
  const { setCurrentTime } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const fetchVideo = async () => {
      try {
        const res = await fetch(`/api/videos?id=${id}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const foundVideo = Array.isArray(data)
            ? data.find((v: VideoInfo) => v.id === id)
            : data;

          if (foundVideo) {
            setVideo(foundVideo);
            clearTracks();

            // Load subtitles automatically to Slot 0 and Slot 1
            if (foundVideo.subtitles && foundVideo.subtitles.length > 0) {
              for (let i = 0; i < Math.min(foundVideo.subtitles.length, 2); i++) {
                const sub = foundVideo.subtitles[i];
                try {
                  const subRes = await fetch(`/api/subtitle/${sub.id}`);
                  if (subRes.ok) {
                    const subData = await subRes.json();
                    const langInfo = LANGUAGES[sub.language as LanguageCode];
                    
                    setSlotTrack(i as 0 | 1, {
                      id: generateId(),
                      label: `${langInfo?.flag || ""} ${sub.label}`,
                      language: sub.language,
                      entries: subData.entries || [],
                      enabled: true,
                    });
                  }
                } catch (err) {
                  console.error("Failed to load sub track", err);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch video:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVideo();
    
    return () => { isMounted = false; };
  }, [id, setSlotTrack, clearTracks]);

  const handleSeek = useCallback(
    (time: number) => {
      const videoEl = document.querySelector("video");
      if (videoEl) {
        videoEl.currentTime = time;
        setCurrentTime(time);
      }
    },
    [setCurrentTime]
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="aspect-video w-full bg-muted rounded-xl" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-2">Video not found</h2>
        <p className="text-muted-foreground mb-4">
          The video you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const lang = LANGUAGES[video.language as LanguageCode];
  
  // Tentukan Source Video (Gunakan API Proxy jika dari Telegram)
  const videoSrc = video.sourceType === "telegram"
    ? `/api/telegram/stream?fileId=${video.telegramFileId}`
    : video.videoUrl || "";

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-lg md:text-xl font-bold truncate">
              {video.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-10">
            {lang && (
              <Badge variant="secondary" className="text-[10px] gap-1 shrink-0">
                <Globe className="w-3 h-3" />
                {lang.flag} {lang.label}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] shrink-0">
              {video.sourceType === "telegram" ? "📺 Channel" : "📁 Local"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <VocabularyExtractor />
          <SubtitleSettings />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VideoPlayer
            src={videoSrc}
            poster={video.thumbnailUrl}
            className="rounded-xl overflow-hidden shadow-lg border"
          />

          {video.description && (
            <p className="text-sm text-muted-foreground mt-3 p-3 bg-muted/30 rounded-lg">
              {video.description}
            </p>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-12rem)] lg:sticky lg:top-20">
            <div className="p-3 border-b flex items-center gap-2">
              <List className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Transcript</span>
            </div>
            <SubtitleList onSeek={handleSeek} className="h-[calc(100%-3rem)]" />
          </Card>
        </div>
      </div>
    </div>
  );
}