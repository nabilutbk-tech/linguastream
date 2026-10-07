"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Subtitles, Globe, Trash2 } from "lucide-react";
import { VideoInfo } from "@/types";
import { formatTime, LANGUAGES, LanguageCode } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface VideoCardProps {
  video: VideoInfo;
  onDeleted?: () => void;
}

export function VideoCard({ video, onDeleted }: VideoCardProps) {
  const lang = LANGUAGES[video.language as LanguageCode];
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Hapus "${video.title}" dari Library web?`)) return;

    try {
      const res = await fetch(`/api/videos?id=${video.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Video berhasil dihapus dari Library" });
        if (onDeleted) onDeleted();
      } else {
        toast({ title: "Gagal menghapus video", variant: "destructive" });
      }
    } catch {
      toast({ title: "Terjadi kesalahan", variant: "destructive" });
    }
  };

  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 relative">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Play className="w-12 h-12 text-primary/40" />
            </div>
          )}

          {video.duration != null && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md font-mono">
              {formatTime(video.duration)}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>

          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-[10px] h-5 bg-background/80 backdrop-blur-sm"
          >
            {video.sourceType === "telegram" ? "📺 Channel" : "📁 Local"}
          </Badge>

          {/* Tombol Hapus Video */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
            onClick={handleDelete}
            title="Hapus dari Library"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <CardContent className="p-3 space-y-2">
          {video.series && (
            <Badge variant="outline" className="text-[9px] h-4">
              📁 {video.series}
            </Badge>
          )}

          <h3 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {lang && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <Globe className="w-3 h-3" />
                {lang.flag} {lang.label}
              </Badge>
            )}
            {video.subtitles.length > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <Subtitles className="w-3 h-3" />
                {video.subtitles.length} sub{video.subtitles.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}