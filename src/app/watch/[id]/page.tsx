"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { SubtitleSettings } from "@/components/video/SubtitleSettings";
import { SubtitleList } from "@/components/subtitle/SubtitleList";
import { VocabularyExtractor } from "@/components/subtitle/VocabularyExtractor";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { useSubtitleStore } from "@/stores/useSubtitleStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { List, Globe, ArrowLeft, Subtitles, FilePlus, Trash2, Loader2, Folder } from "lucide-react";
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

  // State untuk tambah subtitle setelah upload
  const [subFile, setSubFile] = useState<File | null>(null);
  const [subLang, setSubLang] = useState("en");
  const [submitting, setSubmitting] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // State untuk mengatur folder/series video
  const [seriesInput, setSeriesInput] = useState("");
  const [existingSeries, setExistingSeries] = useState<string[]>([]);
  const [savingSeries, setSavingSeries] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

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

  const fetchVideo = useCallback(async (): Promise<VideoInfo | null> => {
    if (!id) return null;
    try {
      const res = await fetch(`/api/videos?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        const foundVideo = Array.isArray(data)
          ? data.find((v: VideoInfo) => v.id === id)
          : data;
        if (foundVideo) setVideo(foundVideo as VideoInfo);
        return (foundVideo as VideoInfo) || null;
      }
    } catch (error) {
      console.error("Failed to fetch video:", error);
    } finally {
      setLoading(false);
    }
    return null;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadInitial = async () => {
      const foundVideo = await fetchVideo();
      if (!isMounted) return;

      if (foundVideo) {
        clearTracks();

        // Set default subtitle jika tersedia
        if (foundVideo.subtitles && foundVideo.subtitles.length > 0) {
          const sub1 = foundVideo.subtitles[0]?.id || "off";
          const sub2 = foundVideo.subtitles[1]?.id || "off";
          setSelectedSub1(sub1);
          setSelectedSub2(sub2);
        }
      }
    };
    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [id, fetchVideo, clearTracks]);

  // Tambah subtitle yang lupa diupload (tersimpan permanen ke database)
  const handleAddSubtitle = async () => {
    if (!video || !subFile) return;
    setSubmitting(true);
    setSubError(null);
    try {
      const formData = new FormData();
      formData.append("videoId", video.id);
      formData.append("subtitle", subFile);
      formData.append("language", subLang);

      const res = await fetch("/api/subtitle", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add subtitle");
      }

      setSubFile(null);
      if (subFileInputRef.current) subFileInputRef.current.value = "";
      await fetchVideo();
    } catch (err: any) {
      setSubError(err.message || "Failed to add subtitle");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus subtitle dari video
  const handleDeleteSubtitle = async (subId: string) => {
    if (!confirm("Hapus subtitle ini dari video?")) return;
    setDeletingSubId(subId);
    setSubError(null);
    try {
      const res = await fetch(`/api/subtitle/${subId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete subtitle");
      }

      // Reset dropdown jika subtitle yang aktif dihapus
      if (selectedSub1 === subId) setSelectedSub1("off");
      if (selectedSub2 === subId) setSelectedSub2("off");
      await fetchVideo();
    } catch (err: any) {
      setSubError(err.message || "Failed to delete subtitle");
    } finally {
      setDeletingSubId(null);
    }
  };

  // Sinkronkan input folder saat video dimuat/di-refresh
  useEffect(() => {
    setSeriesInput(video?.series || "");
  }, [video?.series]);

  // Muat daftar folder yang sudah ada (untuk quick-pick)
  useEffect(() => {
    let isMounted = true;
    fetch("/api/videos")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: VideoInfo[]) => {
        if (!isMounted) return;
        setExistingSeries(
          Array.from(
            new Set(
              list
                .map((v) => v.series)
                .filter((s): s is string => !!s && s.trim() !== "")
                .map((s) => s.trim())
            )
          ).sort((a, b) => a.localeCompare(b))
        );
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Simpan perubahan folder/series video (tidak perlu upload ulang)
  const handleSaveSeries = async () => {
    if (!video) return;
    setSavingSeries(true);
    setFolderError(null);
    try {
      const res = await fetch("/api/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, series: seriesInput }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save folder");
      }
      await fetchVideo();
    } catch (err: any) {
      setFolderError(err.message || "Failed to save folder");
    } finally {
      setSavingSeries(false);
    }
  };

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

      {/* Tambah / Kelola Subtitle (kalau lupa saat upload) */}
      <Card className="p-3 bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold">
            Tambahkan Subtitle <span className="text-muted-foreground">(kalau lupa saat upload — tersimpan permanen)</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            ref={subFileInputRef}
            type="file"
            accept=".srt,.ass,.ssa"
            onChange={(e) => setSubFile(e.target.files?.[0] || null)}
            disabled={submitting}
            className="flex-1 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:cursor-pointer"
          />
          <NativeSelect
            value={subLang}
            onChange={(e) => setSubLang(e.target.value)}
            disabled={submitting}
            className="w-full sm:w-[140px] h-9 text-xs"
          >
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </NativeSelect>
          <Button
            onClick={handleAddSubtitle}
            disabled={!subFile || submitting}
            className="gap-1 shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FilePlus className="w-4 h-4" />
            )}
            Add
          </Button>
        </div>
        {subFile && (
          <p className="text-xs text-muted-foreground">{subFile.name}</p>
        )}
        {subError && (
          <p className="text-xs text-destructive">{subError}</p>
        )}
        {video.subtitles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {video.subtitles.map((sub) => (
              <span
                key={sub.id}
                className="inline-flex items-center gap-1.5 text-xs rounded-md border px-2 py-1 bg-muted/40"
              >
                <Subtitles className="w-3 h-3 text-primary shrink-0" />
                {LANGUAGES[sub.language as LanguageCode]?.flag || ""} {sub.label}
                <button
                  type="button"
                  onClick={() => handleDeleteSubtitle(sub.id)}
                  disabled={deletingSubId === sub.id}
                  title="Hapus subtitle"
                  className="text-destructive hover:bg-destructive/10 rounded p-0.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Folder / Series */}
      <Card className="p-3 bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold">
            Folder / Series{" "}
            <span className="text-muted-foreground">(kelompokkan dalam folder, mis. "Boruto")</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={seriesInput}
            onChange={(e) => setSeriesInput(e.target.value)}
            placeholder="Contoh: Boruto, Naruto..."
            disabled={savingSeries}
            className="flex-1"
          />
          <Button
            onClick={handleSaveSeries}
            disabled={savingSeries || seriesInput.trim() === (video.series || "")}
            variant="outline"
            className="gap-1 shrink-0"
          >
            {savingSeries ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
            Simpan
          </Button>
        </div>
        {existingSeries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {existingSeries.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeriesInput(s)}
                disabled={savingSeries}
                className="text-xs rounded-md border px-2 py-0.5 hover:bg-muted/50 disabled:opacity-50"
              >
                📁 {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSeriesInput("")}
              disabled={savingSeries}
              className="text-xs rounded-md border px-2 py-0.5 hover:bg-muted/50 text-muted-foreground disabled:opacity-50"
            >
              ✕ Tanpa folder
            </button>
          </div>
        )}
        {folderError && (
          <p className="text-xs text-destructive">{folderError}</p>
        )}
      </Card>

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