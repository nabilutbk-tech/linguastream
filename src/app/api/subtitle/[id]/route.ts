import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSRT, parseASS } from "@/lib/subtitle-parser";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sub = await prisma.subtitle.findUnique({ where: { id: params.id } });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Jika sudah pernah diparsing dan tersimpan di database
    if (sub.content && sub.content !== "[]") {
      return NextResponse.json({ entries: JSON.parse(sub.content) });
    }

    // Jika belum diparsing dan sumbernya dari Telegram
    if (sub.sourceType === "telegram" && sub.telegramFileId) {
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const getFileRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${sub.telegramFileId}`
      );
      const fileData = await getFileRes.json();

      if (fileData.ok) {
        const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
        const contentRes = await fetch(fileUrl);
        const textContent = await contentRes.text();

        const entries =
          sub.format === "ass" ? parseASS(textContent) : parseSRT(textContent);

        // Update database dengan hasil parsing agar tidak mendownload lagi kedepannya
        await prisma.subtitle.update({
          where: { id: sub.id },
          data: { content: JSON.stringify(entries) },
        });

        return NextResponse.json({ entries });
      }
    }

    return NextResponse.json({ entries: [] });
  } catch (error) {
    console.error("Fetch subtitle error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}