import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const fileId = searchParams.get("fileId");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (video?.videoUrl) {
        let finalUrl = video.videoUrl;

        // AUTO-FIX PIXELDRAIN: Ganti /u/ menjadi /api/file/
        if (finalUrl.includes("pixeldrain.com/u/")) {
          finalUrl = finalUrl.replace("pixeldrain.com/u/", "pixeldrain.com/api/file/");
        }
        
        // AUTO-FIX DROPBOX: Tambahkan raw=1 agar jadi link video asli
        if (finalUrl.includes("dropbox.com") && !finalUrl.includes("raw=1")) {
          finalUrl = finalUrl.includes("?") ? `${finalUrl}&raw=1` : `${finalUrl}?raw=1`;
        }

        return NextResponse.redirect(finalUrl);
      }
    } catch (e) {
      console.error("Stream redirect error:", e);
    }
  }

  // Fallback Telegram Bot API (< 20MB)
  if (fileId && BOT_TOKEN) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const data = await res.json();
      if (data.ok && data.result?.file_path) {
        return NextResponse.redirect(`https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`);
      }
    } catch {}
  }

  return new NextResponse("Video stream unavailable", { status: 404 });
}