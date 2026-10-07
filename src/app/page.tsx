"use client";

import { useState, useEffect, Suspense } from "react";
import { VideoGrid } from "@/components/library/VideoGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { Search, Languages, Filter, HardDrive, Folder, Subtitles } from "lucide-react";
import { LANGUAGES } from "@/lib/utils";
import { VideoInfo } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6 text-center text-sm text-muted-foreground">Loading Library...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [sub1Pref, setSub1Pref] = useState("ja");
  const [sub2Pref, setSub2Pref] = useState("id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kumpulkan semua Series/Folder unik yang ada
  const availableSeries = Array.from(
    new Set(videos.map((v) => v.series).filter(Boolean))
  ) as string[];

  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSeries = seriesFilter === "all" || v.series === seriesFilter;
    const matchesLang = langFilter === "all" || v.language === langFilter;
    return matchesSearch && matchesSeries && matchesLang;
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Languages className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Lingua<span className="text-primary">Stream</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Learn foreign languages through video streaming with bilingual subtitles & vocabulary extraction.
        </p>
      </div>

      {/* Banner Pilihan Local Player */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Have your own video file?</h3>
            <p className="text-xs text-muted-foreground">
              Play video files from your device with local .srt or .ass subtitles.
            </p>
          </div>
        </div>
        <Link href="/local">
          <Button size="sm" className="gap-2 whitespace-nowrap">
            Open Local Player
          </Button>
        </Link>
      </div>

      {/* Preferensi Bahasa Subtitle Pembelajaran */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Subtitles className="w-4 h-4" />
          Subtitle Learning Preferences
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Subtitle 1 (Target Language / Baris Bawah)</label>
            <NativeSelect value={sub1Pref} onChange={(e) => setSub1Pref(e.target.value)}>
              <option value="ja">🇯🇵 Japanese (日本語)</option>
              <option value="en">🇬🇧 English</option>
              <option value="id">🇮🇩 Indonesian</option>
            </NativeSelect>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Subtitle 2 (Native Language / Baris Atas)</label>
            <NativeSelect value={sub2Pref} onChange={(e) => setSub2Pref(e.target.value)}>
              <option value="id">🇮🇩 Indonesian</option>
              <option value="en">🇬🇧 English</option>
              <option value="ja">🇯🇵 Japanese</option>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Series/Folder */}
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
          <NativeSelect value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value)}>
            <option value="all">All Series / Folders</option>
            {availableSeries.map((s) => (
              <option key={s} value={s}>
                📁 {s}
              </option>
            ))}
          </NativeSelect>
        </div>

        {/* Filter Content Language */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <NativeSelect value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
            <option value="all">All Audio Languages</option>
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-xl" />
              <div className="space-y-2 mt-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <VideoGrid videos={filteredVideos} />
      )}
    </div>
  );
}