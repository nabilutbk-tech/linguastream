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
      // Continue to fallback
    }
  }

  // 2. Fallback untuk Video Besar (> 20MB) dari Telegram Public Embed
  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });

      if (video && video.telegramMessageId) {
        let username = video.telegramChatUsername;

        if (!username && video.telegramChatId && BOT_TOKEN) {
          try {
            const chatRes = await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${video.telegramChatId}`
            );
            const chatData = await chatRes.json();
            if (chatData.ok && chatData.result?.username) {
              username = chatData.result.username;
              await prisma.video.update({
                where: { id: video.id },
                data: { telegramChatUsername: username },
              });
            }
          } catch (e) {
            console.error("Failed to fetch chat username", e);
          }
        }

        const candidateUrls: string[] = [];
        if (username) {
          candidateUrls.push(`https://t.me/${username}/${video.telegramMessageId}?embed=1`);
        }
        if (video.telegramChatId) {
          const cleanId = video.telegramChatId.replace("-100", "");
          candidateUrls.push(`https://t.me/c/${cleanId}/${video.telegramMessageId}?embed=1`);
        }

        for (const embedUrl of candidateUrls) {
          try {
            const res = await fetch(embedUrl, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              },
            });
            const html = await res.text();

            const match =
              html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
              html.match(/<source[^>]+src=["']([^"']+)["']/i) ||
              html.match(/src=["'](https:\/\/[^"']+\.(?:mp4|mkv|webm|mov)[^"']*)["']/i) ||
              html.match(/(https:\/\/v\.t\.me\/watch\/[^\s"'<]+)/) ||
              html.match(/(https:\/\/[^"']+\.usercontent\.telegram\.org[^\s"'<]+)/);

            if (match && match[1]) {
              const mediaUrl = match[1].replace(/&amp;/g, "&");
              return NextResponse.redirect(mediaUrl);
            }
          } catch (e) {
            console.error("Embed fetch error:", e);
          }
        }
      }
    } catch (err) {
      console.error("Stream route error:", err);
    }
  }

  return new NextResponse(
    "Video stream unavailable. Make sure the video on Telegram is in .mp4 format.",
    { status: 404 }
  );
}