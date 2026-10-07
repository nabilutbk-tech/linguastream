import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  const fileId = searchParams.get("fileId");

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
    } catch (e) {
      console.log("Bot API fail (expected for large files)");
    }
  }

  // 2. SCRAPER KUAT untuk Video Besar (> 20MB)
  if (videoId) {
    try {
      const video = await prisma.video.findUnique({ where: { id: videoId } });
      if (video && video.telegramMessageId) {
        let username = video.telegramChatUsername;
        
        // Auto-fetch username jika kosong
        if (!username && video.telegramChatId && BOT_TOKEN) {
          const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${video.telegramChatId}`);
          const chatData = await chatRes.json();
          if (chatData.ok && chatData.result?.username) {
            username = chatData.result.username;
            await prisma.video.update({ where: { id: video.id }, data: { telegramChatUsername: username } });
          }
        }

        if (username) {
          const embedUrl = `https://t.me/${username}/${video.telegramMessageId}?embed=1&single=1`;
          
          // Gunakan Header Browser asli agar tidak diblokir Telegram
          const res = await fetch(embedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
          });
          const html = await res.text();

          // Taktik 1: Cari di atribut src video
          const videoMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
          if (videoMatch && videoMatch[1]) return NextResponse.redirect(videoMatch[1].replace(/&amp;/g, "&"));

          // Taktik 2: Cari link v.t.me
          const vtMeMatch = html.match(/https:\/\/v\.t\.me\/watch\/[^\s"'<]+/);
          if (vtMeMatch) return NextResponse.redirect(vtMeMatch[0].replace(/&amp;/g, "&"));

          // Taktik 3: Cari di meta tags (og:video)
          const ogMatch = html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i);
          if (ogMatch && ogMatch[1]) return NextResponse.redirect(ogMatch[1].replace(/&amp;/g, "&"));
          
          // Taktik 4: Cari link direct usercontent
          const directMatch = html.match(/https:\/\/[^"']+\.usercontent\.telegram\.org\/[^\s"'<]+/);
          if (directMatch) return NextResponse.redirect(directMatch[0].replace(/&amp;/g, "&"));
        }
      }
    } catch (err) {
      console.error("Scraper crash:", err);
    }
  }

  // Jika semua gagal, arahkan user ke link aslinya agar video ter-cache oleh browser mereka
  if (videoId) {
     const video = await prisma.video.findUnique({ where: { id: videoId } });
     if (video?.telegramChatUsername) {
        return NextResponse.redirect(`https://t.me/${video.telegramChatUsername}/${video.telegramMessageId}`);
     }
  }

  return new NextResponse("Unable to fetch video stream. Please ensure the channel is Public.", { status: 404 });
}