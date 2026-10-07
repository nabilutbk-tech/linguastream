"use client";

import { useState, useEffect, Suspense } from "react";
import { VideoGrid } from "@/components/library/VideoGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Languages, Filter, HardDrive } from "lucide-react";
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
  const [langFilter, setLangFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesLang = langFilter === "all" || v.language === langFilter;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-4">
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
        <div className="flex items-center justify-center gap-2">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <Badge key={code} variant="secondary" className="text-xs gap-1">
              {lang.flag} {lang.label}
            </Badge>
          ))}
        </div>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Telegram channel videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={langFilter} onValueChange={(v: any) => v && setLangFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <SelectItem key={code} value={code}>
                {lang.flag} {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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