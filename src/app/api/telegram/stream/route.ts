import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  const videoId = searchParams.get("videoId");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // 1. Coba lewat Telegram Bot API dulu (untuk video kecil < 20MB)
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
      // Lanjut ke fallback jika file > 20MB
    }
  }

  // 2. Fallback untuk Video Besar (> 20MB) lewat Telegram Web Streamer
  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (video && video.telegramChatId && video.telegramMessageId) {
        let channelName = video.telegramChatId.replace("-100", "");

        // Ambil link embed publik Telegram
        const embedUrl = `https://t.me/c/${channelName}/${video.telegramMessageId}?embed=1`;
        const embedRes = await fetch(embedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const html = await embedRes.text();

        // Cari URL video stream asli dari Telegram CDN
        const match =
          html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
          html.match(/src=["'](https:\/\/[^"']+\.mp4[^"']*)["']/i);

        if (match && match[1]) {
          return NextResponse.redirect(match[1]);
        }
      }
    } catch (err) {
      console.error("Embed stream error:", err);
    }
  }

  return new NextResponse("Video file unavailable or exceeds limit", { status: 404 });
}