import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const fileId = searchParams.get("fileId");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // 1. Coba lewat Telegram Bot API getFile (Untuk file kecil < 20MB)
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
      // Lanjut ke fallback jika > 20MB
    }
  }

  // 2. Fallback untuk Video Besar (> 20MB) dari Telegram Public Embed
  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });

      if (video && video.telegramMessageId) {
        let username = video.telegramChatUsername;

        // Jika video lama durasinya belum punya username di DB, panggil getChat
        if (!username && video.telegramChatId && BOT_TOKEN) {
          try {
            const chatRes = await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${video.telegramChatId}`
            );
            const chatData = await chatRes.json();
            if (chatData.ok && chatData.result?.username) {
              username = chatData.result.username;
              // Simpan ke DB agar selanjutnya instant
              await prisma.video.update({
                where: { id: video.id },
                data: { telegramChatUsername: username },
              });
            }
          } catch (e) {
            console.error("Failed to fetch chat username", e);
          }
        }

        if (username) {
          const embedUrl = `https://t.me/${username}/${video.telegramMessageId}?embed=1`;
          const res = await fetch(embedUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          const html = await res.text();

          // Ekstrak URL Video CDN dari HTML Embed Telegram
          const match =
            html.match(/src=["'](https:\/\/[^"']+\.(?:mp4|mkv|webm)[^"']*)["']/i) ||
            html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
            html.match(/(https:\/\/v\.t\.me\/watch\/[^\s"'<]+)/) ||
            html.match(/(https:\/\/[^"']+\.usercontent\.telegram\.org[^\s"'<]+)/);

          if (match && match[1]) {
            return NextResponse.redirect(match[1]);
          }
        }
      }
    } catch (err) {
      console.error("Embed stream error:", err);
    }
  }

  return new NextResponse(
    "Video unavailable. Make sure the Telegram channel is PUBLIC with a username link.",
    { status: 404 }
  );
}