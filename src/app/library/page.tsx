"use client";

import { useState, useEffect, useMemo } from "react";
import { UploadModal } from "@/components/library/UploadModal";
import { VideoCard } from "@/components/library/VideoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Video as VideoIcon, Folder, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { VideoInfo } from "@/types";

export default function LibraryPage() {
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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

  const handleUpload = async (formData: FormData) => {
    try {
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      await fetchVideos();
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase()) ||
      v.series?.toLowerCase().includes(search.toLowerCase())
  );

  // Kelompokkan video per folder (series)
  const groupedVideos = useMemo(() => {
    const groups = new Map<string, VideoInfo[]>();
    for (const v of filteredVideos) {
      const name = v.series?.trim() || "Uncategorized";
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(v);
    }
    return Array.from(groups.entries());
  }, [filteredVideos]);

  const toggleFolder = (folder: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  };

  // Saat mencari, buka semua folder agar hasil pencarian terlihat
  useEffect(() => {
    setCollapsed(new Set());
  }, [search]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <VideoIcon className="w-8 h-8 text-primary" />
            Video Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your language learning videos
          </p>
        </div>
        <UploadModal onUpload={handleUpload} />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">{videos.length} videos</Badge>
        <Badge variant="outline">
          {groupedVideos.length} folder{groupedVideos.length > 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline">
          {videos.filter((v) => v.sourceType === "telegram").length} from Telegram
        </Badge>
        <Badge variant="outline">
          {videos.filter((v) => v.sourceType === "hosted").length} hosted
        </Badge>
      </div>

      {/* Video Folders (Accordion) */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Loading videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <VideoIcon className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground mt-4">
            {search ? "No videos found" : "No videos yet. Upload your first video!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedVideos.map(([folder, items]) => {
            const isCollapsed = collapsed.has(folder);
            const isUncategorized = folder === "Uncategorized";
            return (
              <div
                key={folder}
                className="rounded-xl border bg-card/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFolder(folder)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                  )}
                  {isUncategorized ? (
                    <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <span className="font-semibold text-sm truncate">
                    {isUncategorized ? "Uncategorized" : folder}
                  </span>
                  <Badge variant="secondary" className="ml-auto shrink-0">
                    {items.length}
                  </Badge>
                </button>
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-3 pt-0">
                    {items.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
