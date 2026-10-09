"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubtitleSettings } from "@/components/video/SubtitleSettings";
import { SubtitleList } from "@/components/subtitle/SubtitleList";
import { VocabularyExtractor } from "@/components/subtitle/VocabularyExtractor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Film, List, X, Loader2 } from "lucide-react";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import {
  parseSRT,
  parseASS,
  detectSubtitleFormat,
  detectLanguage,
} from "@/lib/subtitle-parser";
import { LANGUAGES, generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { setLocalMedia, getLocalMedia, deleteLocalMedia } from "@/lib/idb";

export default function LocalPlayerPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { primaryTrack, clearTracks, setSlotTrack } = useSubtitleStore();
  const { setCurrentTime } = usePlayerStore();
  const { toast } = useToast();

  const processVideo = useCallback(
    async (file: File, isNewUpload: boolean) => {
      setVideoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setVideoFile(file);

      if (isNewUpload) {
        clearTracks();
        await setLocalMedia("video", file);
        await deleteLocalMedia("sub0");
        await deleteLocalMedia("sub1");
        toast({ title: `Video dimuat: ${file.name}` });
      }
    },
    [clearTracks, toast]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const vid = await getLocalMedia("video");
        if (vid && alive) await processVideo(vid, false);
        // Subtitle di-restore lewat SubtitleSettings + idb keys sub0/sub1 jika ada
        const sub0 = await getLocalMedia("sub0");
        const sub1 = await getLocalMedia("sub1");
        if (sub0?.file && alive) {
          // restore ditangani lewat event di settings; di sini cukup biarkan user buka style
        }
        void sub1;
      } finally {
        if (alive) setIsRestoring(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [processVideo]);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processVideo(file, true);
  };

  const clearVideo = async () => {
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setVideoFile(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    clearTracks();
    await deleteLocalMedia("video");
    await deleteLocalMedia("sub0");
    await deleteLocalMedia("sub1");
  };

  const handleSeek = useCallback(
    (time: number) => {
      const el = document.querySelector("video");
      if (el) {
        el.currentTime = time;
        setCurrentTime(time);
      }
    },
    [setCurrentTime]
  );

  if (isRestoring) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Memulihkan sesi sebelumnya...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Upload className="h-5 w-5 text-primary" />
            Local Player
          </h1>
          <p className="text-sm text-muted-foreground">
            Putar video lokal + dual subtitle. Upload subtitle lewat tombol{" "}
            <b>Subtitle Style</b>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VocabularyExtractor />
          <SubtitleSettings enableFileUpload />
        </div>
      </div>

      {/* Upload video (satu-satunya) */}
      {!videoUrl ? (
        <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Belum ada video</p>
            <p className="text-sm text-muted-foreground">
              Pilih file video dari perangkatmu
            </p>
          </div>
          <Label
            htmlFor="local-video-main"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Pilih Video
          </Label>
          <Input
            id="local-video-main"
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="max-w-full truncate text-xs">
              {videoFile?.name}{" "}
              {videoFile
                ? `(${(videoFile.size / 1024 / 1024).toFixed(1)} MB)`
                : ""}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-destructive"
              onClick={clearVideo}
            >
              <X className="h-3.5 w-3.5" />
              Ganti / Hapus video
            </Button>
            <Label
              htmlFor="local-video-replace"
              className="cursor-pointer text-xs text-primary underline-offset-2 hover:underline"
            >
              Pilih file lain
            </Label>
            <Input
              id="local-video-replace"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>

          <VideoPlayer
            src={videoUrl}
            className="overflow-hidden rounded-xl border shadow-lg"
          />
        </div>
      )}

      {/* Langsung Transcript di bawah player (tanpa card upload sub/video) */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b p-3">
          <List className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Transcript</span>
          {primaryTrack && (
            <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
              {primaryTrack.entries.length} lines
            </Badge>
          )}
          {!primaryTrack && (
            <span className="ml-auto text-xs text-muted-foreground">
              Buka <b>Subtitle Style</b> untuk upload Sub 1 & Sub 2
            </span>
          )}
        </div>
        <div className="h-[min(420px,50vh)]">
          <SubtitleList onSeek={handleSeek} className="h-full" />
        </div>
      </Card>
    </div>
  );
}