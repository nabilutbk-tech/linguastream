import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Tangkap pesan dari pesan pribadi maupun Channel Post
    const msg = body.message || body.channel_post;

    if (!msg) {
      return NextResponse.json({ ok: true });
    }

    const caption = (msg.caption || "").toLowerCase();

    // Fungsi pembantu deteksi hashtag bahasa
    const detectLang = (str: string) => {
      if (str.includes("#ja") || str.includes("#jpn") || str.includes("#japanese")) return "ja";
      if (str.includes("#id") || str.includes("#ind") || str.includes("#indonesian")) return "id";
      return "en";
    };

    // Cek apakah lampiran adalah Video biasa ATAU File Dokumen Video (.mkv, .mp4, .avi, dll)
    const isNativeVideo = !!msg.video;
    const isVideoDocument =
      msg.document &&
      (msg.document.mime_type?.startsWith("video/") ||
        /\.(mkv|mp4|avi|mov|webm)$/i.test(msg.document.file_name || ""));

    // 1. JIKA POSTINGAN ADALAH VIDEO (BAIK NATIVE MAUPUN DOKUMEN FILE)
    if (isNativeVideo || isVideoDocument) {
      const fileId = isNativeVideo ? msg.video.file_id : msg.document.file_id;
      const duration = isNativeVideo ? msg.video.duration : null;
      const rawTitle = msg.caption || msg.document?.file_name || "Untitled Video";
      const cleanTitle = rawTitle.replace(/#\w+/g, "").trim() || "Untitled Video";
      const language = detectLang(caption);

      await prisma.video.create({
        data: {
          title: cleanTitle,
          sourceType: "telegram",
          telegramFileId: fileId,
          telegramChatId: String(msg.chat.id),
          telegramMessageId: msg.message_id,
          duration,
          language,
        },
      });

      return NextResponse.json({ ok: true, status: "Video saved" });
    }

    // 2. JIKA REPLY VIDEO DENGAN FILE SUBTITLE (.srt / .ass / .ssa)
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
            const subLanguage = detectLang(caption);
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