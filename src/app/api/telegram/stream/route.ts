import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  const fileId = request.nextUrl.searchParams.get("fileId");

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // 1. Coba lewat Telegram Bot API getFile (< 20MB)
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

  // 2. Telegram Web Embed Extractor untuk Video Besar (> 20MB)
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
          candidateUrls.push(`https://t.me/${username}/${video.telegramMessageId}?embed=1&single=1`);
        }
        if (video.telegramChatId) {
          const cleanId = video.telegramChatId.replace("-100", "");
          candidateUrls.push(`https://t.me/c/${cleanId}/${video.telegramMessageId}?embed=1&single=1`);
        }

        // Gunakan User-Agent TelegramBot agar bypass CAPTCHA & tidak diblokir
        const headers = {
          "User-Agent": "TelegramBot (like TwitterBot)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        };

        for (const embedUrl of candidateUrls) {
          try {
            const res = await fetch(embedUrl, { headers, redirect: "follow" });
            const html = await res.text();

            const match =
              html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
              html.match(/<source[^>]+src=["']([^"']+)["']/i) ||
              html.match(/src=["'](https:\/\/[^"']+\.(?:mp4|mkv|webm|mov)[^"']*)["']/i) ||
              html.match(/(https:\/\/v\.t\.me\/watch\/[^\s"'<]+)/) ||
              html.match(/(https:\/\/[^"']+\.usercontent\.telegram\.org\/[^\s"'<]+)/);

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
    "Video stream unavailable. Ensure channel is Public and video was posted as native video.",
    { status: 404 }
  );
}