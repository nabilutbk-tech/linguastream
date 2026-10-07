"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubtitleSettings } from "@/components/video/SubtitleSettings";
import { SubtitleList } from "@/components/subtitle/SubtitleList";
import { VocabularyExtractor } from "@/components/subtitle/VocabularyExtractor";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { List, Globe, ArrowLeft, Subtitles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LANGUAGES, LanguageCode, generateId } from "@/lib/utils";
import { VideoInfo } from "@/types";

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6 space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="aspect-video w-full bg-muted rounded-xl" />
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}

function WatchContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSub1, setSelectedSub1] = useState<string>("off");
  const [selectedSub2, setSelectedSub2] = useState<string>("off");

  const { setSlotTrack, clearTracks } = useSubtitleStore();
  const { setCurrentTime } = usePlayerStore();

  const loadSubtitleToSlot = useCallback(
    async (subId: string, slot: 0 | 1) => {
      if (subId === "off") {
        setSlotTrack(slot, null);
        return;
      }
      try {
        const subRes = await fetch(`/api/subtitle/${subId}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          const targetSub = video?.subtitles.find((s) => s.id === subId);
          if (targetSub) {
            const langInfo = LANGUAGES[targetSub.language as LanguageCode];
            setSlotTrack(slot, {
              id: generateId(),
              label: `${langInfo?.flag || ""} ${targetSub.label}`,
              language: targetSub.language,
              entries: subData.entries || [],
              enabled: true,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load sub track", err);
      }
    },
    [video, setSlotTrack]
  );

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

            // Set default subtitle jika tersedia
            if (foundVideo.subtitles && foundVideo.subtitles.length > 0) {
              const sub1 = foundVideo.subtitles[0]?.id || "off";
              const sub2 = foundVideo.subtitles[1]?.id || "off";
              setSelectedSub1(sub1);
              setSelectedSub2(sub2);
            }
          } else {
            setVideo(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch video:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchVideo();

    return () => {
      isMounted = false;
    };
  }, [id, clearTracks]);

  // Handle pergantian Subtitle 1 dari Dropdown
  const handleSub1Change = async (subId: string) => {
    setSelectedSub1(subId);
    await loadSubtitleToSlot(subId, 0);
  };

  // Handle pergantian Subtitle 2 dari Dropdown
  const handleSub2Change = async (subId: string) => {
    setSelectedSub2(subId);
    await loadSubtitleToSlot(subId, 1);
  };

  // Load awal ketika video & subtitle terdeteksi
  useEffect(() => {
    if (video && video.subtitles.length > 0) {
      if (selectedSub1 !== "off") loadSubtitleToSlot(selectedSub1, 0);
      if (selectedSub2 !== "off") loadSubtitleToSlot(selectedSub2, 1);
    }
  }, [video, selectedSub1, selectedSub2, loadSubtitleToSlot]);

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
      <div className="container mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold">Video Not Available</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          This video may have been deleted from the Telegram channel or is no longer accessible.
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
  const videoSrc =
    video.sourceType === "hosted" && video.videoUrl
      ? video.videoUrl
      : `/api/telegram/stream?fileId=${video.telegramFileId}&videoId=${video.id}`;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            {video.series && (
              <Badge variant="default" className="text-[10px]">
                📁 {video.series}
              </Badge>
            )}
            {lang && (
              <Badge variant="secondary" className="text-[10px] gap-1 shrink-0">
                <Globe className="w-3 h-3" />
                {lang.flag} {lang.label}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <VocabularyExtractor />
          <SubtitleSettings />
        </div>
      </div>

      {/* Pilihan Subtitle 1 & 2 untuk Video Ini */}
      {video.subtitles.length > 0 && (
        <Card className="p-3 bg-card/60 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold shrink-0">Sub 1 (Bawah):</span>
              <NativeSelect
                value={selectedSub1}
                onChange={(e) => handleSub1Change(e.target.value)}
                className="h-8 text-xs"
              >
                <option value="off">Off (Matikan)</option>
                {video.subtitles.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {LANGUAGES[sub.language as LanguageCode]?.flag || ""} {sub.label}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-secondary-foreground shrink-0" />
              <span className="text-xs font-semibold shrink-0">Sub 2 (Atas):</span>
              <NativeSelect
                value={selectedSub2}
                onChange={(e) => handleSub2Change(e.target.value)}
                className="h-8 text-xs"
              >
                <option value="off">Off (Matikan)</option>
                {video.subtitles.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {LANGUAGES[sub.language as LanguageCode]?.flag || ""} {sub.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VideoPlayer
            src={videoSrc}
            poster={video.thumbnailUrl || undefined}
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