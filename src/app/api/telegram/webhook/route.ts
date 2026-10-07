import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || body.channel_post;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    // Video Post
    if (message.video) {
      const video = message.video;
      const caption = message.caption || "Untitled Video";

      let language = "en";
      if (caption.includes("#ja") || caption.includes("#japanese")) language = "ja";
      if (caption.includes("#id") || caption.includes("#indonesian")) language = "id";

      await prisma.video.create({
        data: {
          title: caption.replace(/#\w+/g, "").trim() || "Untitled Video",
          sourceType: "telegram",
          telegramFileId: video.file_id,
          telegramChatId: String(message.chat.id),
          telegramMessageId: message.message_id,
          duration: video.duration,
          language,
        },
      });
    }

    // Subtitle File Post (.srt/.ass)
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
            const caption = message.caption || "";
            let subLanguage = "en";
            if (caption.includes("#ja") || caption.includes("#japanese")) subLanguage = "ja";
            if (caption.includes("#id") || caption.includes("#indonesian")) subLanguage = "id";

            await prisma.subtitle.create({
              data: {
                videoId: existingVideo.id,
                language: subLanguage,
                label:
                  subLanguage === "ja"
                    ? "Japanese"
                    : subLanguage === "id"
                    ? "Indonesian"
                    : "English",
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