"use client";

import { VideoCard } from "./VideoCard";
import { VideoInfo } from "@/types";
import { Film } from "lucide-react";

interface VideoGridProps {
  videos: VideoInfo[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Film className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-1">No videos yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upload videos from your Telegram channel or try the local player.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}