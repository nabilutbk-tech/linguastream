import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const msg = body.message || body.channel_post;

    if (!msg) {
      return NextResponse.json({ ok: true });
    }

    const caption = msg.caption || msg.document?.file_name || "";
    const lowerCaption = caption.toLowerCase();

    // Deteksi Bahasa
    const detectLang = (str: string) => {
      if (str.includes("#ja") || str.includes("#jpn") || str.includes("#japanese")) return "ja";
      if (str.includes("#id") || str.includes("#ind") || str.includes("#indonesian")) return "id";
      return "en";
    };

    // Deteksi Nama Folder/Series dari [Nama Folder]
    const seriesMatch = caption.match(/\[(.*?)\]/);
    const seriesName = seriesMatch ? seriesMatch[1].trim() : null;

    // Bersihkan Judul dari [Folder] dan #hashtag
    const cleanTitle = caption
      .replace(/\[.*?\]/g, "")
      .replace(/#\w+/g, "")
      .trim() || "Untitled Video";

    const isNativeVideo = !!msg.video;
    const isVideoDocument =
      msg.document &&
      (msg.document.mime_type?.startsWith("video/") ||
        /\.(mkv|mp4|avi|mov|webm)$/i.test(msg.document.file_name || ""));

    // 1. JIKA POSTINGAN ADALAH VIDEO
    if (isNativeVideo || isVideoDocument) {
      const fileId = isNativeVideo ? msg.video.file_id : msg.document.file_id;
      const duration = isNativeVideo ? msg.video.duration : null;
      const language = detectLang(lowerCaption);

      // Ambil Thumbnail Otomatis buatan Telegram
      let thumbFileId = null;
      if (isNativeVideo && msg.video.thumbnail) {
        thumbFileId = msg.video.thumbnail.file_id;
      } else if (msg.document?.thumbnail) {
        thumbFileId = msg.document.thumbnail.file_id;
      }

      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      let thumbnailUrl = null;

      // Ambil URL Gambar Thumbnail dari Telegram
      if (thumbFileId && BOT_TOKEN) {
        try {
          const thumbRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${thumbFileId}`
          );
          const thumbData = await thumbRes.json();
          if (thumbData.ok && thumbData.result?.file_path) {
            thumbnailUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${thumbData.result.file_path}`;
          }
        } catch (e) {
          console.error("Failed to fetch thumbnail", e);
        }
      }

      await prisma.video.create({
        data: {
          title: cleanTitle,
          series: seriesName,
          sourceType: "telegram",
          telegramFileId: fileId,
          telegramChatId: String(msg.chat.id),
          telegramChatUsername: msg.chat.username || null,
          telegramMessageId: msg.message_id,
          thumbnailUrl,
          duration,
          language,
        },
      });

      return NextResponse.json({ ok: true, status: "Video saved" });
    }

    // 2. JIKA REPLY VIDEO DENGAN FILE SUBTITLE
    if (msg.document) {
      const doc = msg.document;
      const fileName = doc.file_name || "";
      const isSubFile = /\.(srt|ass|ssa)$/i.test(fileName);

      if (isSubFile && msg.reply_to_message) {
        const replyMsg = msg.reply_to_message;
        const targetFileId = replyMsg.video?.file_id || replyMsg.document?.file_id;

        if (targetFileId) {
          const existingVideo = await prisma.video.findFirst({
            where: { telegramFileId: targetFileId },
          });

          if (existingVideo) {
            const subLanguage = detectLang(lowerCaption);
            const labelMap: Record<string, string> = {
              ja: "Japanese",
              id: "Indonesian",
              en: "English",
            };

            await prisma.subtitle.create({
              data: {
                videoId: existingVideo.id,
                language: subLanguage,
                label: labelMap[subLanguage] || "English",
                sourceType: "telegram",
                telegramFileId: doc.file_id,
                content: "[]",
                format: /\.(ass|ssa)$/i.test(fileName) ? "ass" : "srt",
              },
            });

            return NextResponse.json({ ok: true, status: "Subtitle saved" });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true, error: String(error) });
  }
}