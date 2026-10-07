"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Subtitles, Globe } from "lucide-react";
import { VideoInfo } from "@/types";
import { formatTime, LANGUAGES, LanguageCode } from "@/lib/utils";

interface VideoCardProps {
  video: VideoInfo;
}

export function VideoCard({ video }: VideoCardProps) {
  const lang = LANGUAGES[video.language as LanguageCode];

  return (
    <Link href={`/watch/${video.id}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50">
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
        </div>

        <CardContent className="p-3 space-y-2">
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

          {video.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {video.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}