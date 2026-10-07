"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubtitleSettings } from "@/components/video/SubtitleSettings";
import { SubtitleList } from "@/components/subtitle/SubtitleList";
import { VocabularyExtractor } from "@/components/subtitle/VocabularyExtractor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Upload, Film, FileText, List, X, Loader2 } from "lucide-react";
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

  const { primaryTrack, secondaryTrack, setSlotTrack, clearTracks } = useSubtitleStore();
  const { setCurrentTime } = usePlayerStore();
  const { toast } = useToast();

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, "UTF-8");
    });

  const processVideo = useCallback(
    async (file: File, isNewUpload: boolean) => {
      setVideoUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
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

  const processSubtitle = useCallback(
    async (file: File, selectedLang: string, slot: 0 | 1, isNewUpload: boolean) => {
      try {
        const content = await readFileAsText(file);
        const format = detectSubtitleFormat(file.name);
        const entries = format === "ass" ? parseASS(content) : parseSRT(content);

        if (entries.length === 0) {
          if (isNewUpload) {
            toast({
              title: "Subtitle kosong atau tidak terbaca",
              variant: "destructive",
            });
          }
          return false;
        }

        const detected = detectLanguage(entries);
        const lang = selectedLang === "auto" ? detected ?? "en" : selectedLang;
        const langInfo = LANGUAGES[lang as keyof typeof LANGUAGES];

        setSlotTrack(slot, {
          id: generateId(),
          label: `${langInfo?.flag ?? ""} ${langInfo?.label ?? lang}`,
          language: lang,
          entries,
          enabled: true,
          fileName: file.name,
        });

        if (isNewUpload) {
          await setLocalMedia(`sub${slot}`, { file, lang: selectedLang });
          toast({
            title: `Subtitle ${slot + 1} dimuat`,
            description: `${file.name} • ${entries.length} baris`,
          });
        }
        return true;
      } catch (err) {
        console.error("Subtitle load error:", err);
        if (isNewUpload) {
          toast({
            title: "Gagal membaca file subtitle",
            variant: "destructive",
          });
        }
        return false;
      }
    },
    [setSlotTrack, toast]
  );

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const vidFile = await getLocalMedia("video");
        if (vidFile && isMounted) {
          await processVideo(vidFile, false);

          const sub0 = await getLocalMedia("sub0");
          if (sub0 && isMounted) await processSubtitle(sub0.file, sub0.lang, 0, false);

          const sub1 = await getLocalMedia("sub1");
          if (sub1 && isMounted) await processSubtitle(sub1.file, sub1.lang, 1, false);
        }
      } catch (err) {
        console.error("Failed to restore session", err);
      } finally {
        if (isMounted) setIsRestoring(false);
      }
    };
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [processVideo, processSubtitle]);

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processVideo(file, true);
  };

  const handleSubtitleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    lang: string,
    slot: 0 | 1
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const success = await processSubtitle(file, lang, slot, true);
    if (!success) e.target.value = "";
  };

  const clearVideo = async () => {
    setVideoUrl((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
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
      const videoEl = document.querySelector("video");
      if (videoEl) {
        videoEl.currentTime = time;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Upload className="h-5 w-5 text-primary" />
            Local Player
          </h1>
          <p className="text-sm text-muted-foreground">
            Putar video dari perangkat dengan subtitle kustom
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VocabularyExtractor />
          <SubtitleSettings />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {videoUrl ? (
            <VideoPlayer src={videoUrl} className="overflow-hidden rounded-xl shadow-lg border" />
          ) : (
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
                htmlFor="video-upload-main"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-transform active:scale-95"
              >
                <Upload className="h-4 w-4" />
                Pilih Video
              </Label>
              <Input
                id="video-upload-main"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </div>
          )}

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Film className="h-4 w-4 text-primary" />
                  Video File
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground file:font-medium"
                  />
                  {videoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={clearVideo}
                      title="Hapus video"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {videoFile && (
                  <Badge variant="secondary" className="max-w-full truncate text-xs">
                    {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SubtitleSlot
                  slot={0}
                  title="Subtitle 1 (Primary)"
                  hint="Tampil di baris bawah"
                  track={primaryTrack}
                  onFileChange={handleSubtitleChange}
                  onClear={async () => {
                    setSlotTrack(0, null);
                    await deleteLocalMedia("sub0");
                  }}
                />
                <SubtitleSlot
                  slot={1}
                  title="Subtitle 2 (Secondary)"
                  hint="Tampil di baris atas"
                  track={secondaryTrack}
                  onFileChange={handleSubtitleChange}
                  onClear={async () => {
                    setSlotTrack(1, null);
                    await deleteLocalMedia("sub1");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-12rem)] lg:sticky lg:top-20">
            <div className="flex items-center gap-2 border-b p-3">
              <List className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Transcript</span>
              {primaryTrack && (
                <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
                  {primaryTrack.entries.length} lines
                </Badge>
              )}
            </div>
            <SubtitleList onSeek={handleSeek} className="h-[calc(100%-3rem)]" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubtitleSlot({
  slot,
  title,
  hint,
  track,
  onFileChange,
  onClear,
}: {
  slot: 0 | 1;
  title: string;
  hint: string;
  track: { id: string; label: string; fileName?: string; language: string } | null;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    lang: string,
    slot: 0 | 1
  ) => void;
  onClear: () => void;
}) {
  const [lang, setLang] = useState("auto");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!track && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [track]);

  const handleClear = () => {
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 p-3">
      <div className="space-y-0.5">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <FileText className="h-3.5 w-3.5" />
          {title}
        </Label>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>

      <div className="flex gap-2">
        <NativeSelect
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-[110px] shrink-0"
          aria-label={`Bahasa ${title}`}
        >
          <option value="auto">Auto</option>
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <option key={code} value={code}>
              {l.flag} {l.label}
            </option>
          ))}
        </NativeSelect>
        <Input
          ref={inputRef}
          type="file"
          accept=".srt,.ass,.ssa"
          onChange={(e) => onFileChange(e, lang, slot)}
          className="h-9 min-w-0 flex-1 text-xs file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-secondary file:px-2 file:py-0.5 file:text-[10px]"
        />
      </div>

      {track && (
        <div className="flex items-start gap-2 mt-2">
          <Badge
            variant="outline"
            className="min-w-0 flex-1 justify-start gap-1 truncate text-[11px] font-normal bg-background"
            title={track.fileName}
          >
            <span className="shrink-0 font-semibold text-primary">
              {slot === 0 ? "SUB1" : "SUB2"}
            </span>
            <span className="truncate">
              {track.label}
              {track.fileName ? ` — ${track.fileName}` : ""}
            </span>
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10"
            onClick={handleClear}
            title={`Hapus subtitle ${slot + 1}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}