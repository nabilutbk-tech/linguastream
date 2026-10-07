import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || body.channel_post;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // 1. JIKA MEMPOSTING VIDEO
    if (message.video) {
      const video = message.video;
      const caption = (message.caption || "").toLowerCase();

      // Deteksi bahasa dari hashtag caption
      let language = "en"; // default English
      if (caption.includes("#ja") || caption.includes("#jpn") || caption.includes("#japanese")) {
        language = "ja";
      } else if (caption.includes("#id") || caption.includes("#ind") || caption.includes("#indonesian")) {
        language = "id";
      } else if (caption.includes("#en") || caption.includes("#eng") || caption.includes("#english")) {
        language = "en";
      }

      // Bersihkan hashtag dari Judul Video
      const cleanTitle = (message.caption || "Untitled Video")
        .replace(/#\w+/g, "")
        .trim() || "Untitled Video";

      await prisma.video.create({
        data: {
          title: cleanTitle,
          sourceType: "telegram",
          telegramFileId: video.file_id,
          telegramChatId: String(message.chat.id),
          telegramMessageId: message.message_id,
          duration: video.duration,
          language,
        },
      });
    }

    // 2. JIKA MEMBALAS (REPLY) VIDEO DENGAN FILE SUBTITLE (.srt / .ass)
    if (message.document) {
      const doc = message.document;
      const fileName = doc.file_name || "";

      if (
        fileName.endsWith(".srt") ||
        fileName.endsWith(".ass") ||
        fileName.endsWith(".ssa")
      ) {
        const replyToMessage = message.reply_to_message;
        if (replyToMessage?.video) {
          const existingVideo = await prisma.video.findFirst({
            where: {
              telegramFileId: replyToMessage.video.file_id,
            },
          });

          if (existingVideo) {
            const caption = (message.caption || "").toLowerCase();
            let subLanguage = "en";
            if (caption.includes("#ja") || caption.includes("#jpn") || caption.includes("#japanese")) {
              subLanguage = "ja";
            } else if (caption.includes("#id") || caption.includes("#ind") || caption.includes("#indonesian")) {
              subLanguage = "id";
            } else if (caption.includes("#en") || caption.includes("#eng") || caption.includes("#english")) {
              subLanguage = "en";
            }

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
                format: fileName.endsWith(".ass") || fileName.endsWith(".ssa") ? "ass" : "srt",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}