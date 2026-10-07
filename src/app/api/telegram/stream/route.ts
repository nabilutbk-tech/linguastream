import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  const fileId = request.nextUrl.searchParams.get("fileId");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // 1. Jika ada videoUrl langsung (misal dari Catbox/Drive/Hosted)
  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (video?.videoUrl) {
        return NextResponse.redirect(video.videoUrl);
      }
    } catch (e) {
      console.error("Fetch videoUrl error:", e);
    }
  }

  // 2. Coba lewat Telegram Bot API getFile (< 20MB)
  if (fileId && BOT_TOKEN) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
      );
      const data = await res.json();
      if (data.ok && data.result?.file_path) {
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
        return NextResponse.redirect(fileUrl);
      }
    } catch {
      // Continue
    }
  }

  return new NextResponse(
    "Video stream unavailable. Please use a direct MP4 link in Telegram caption for large files.",
    { status: 404 }
  );
}