import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseSRT, parseASS } from "@/lib/subtitle-parser";
import { LANGUAGES, LanguageCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoId = formData.get("videoId") as string;
    const subtitleFile = formData.get("subtitle") as File | null;
    const language = (formData.get("language") as string) || "en";

    // Validation
    if (!videoId || !subtitleFile) {
      return NextResponse.json(
        { error: "Missing required fields: videoId and subtitle file" },
        { status: 400 }
      );
    }

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Parse subtitle content (disimpan sebagai JSON entries, konsisten dengan GET /api/subtitle/[id])
    const text = await subtitleFile.text();
    const format = /\.(ass|ssa)$/i.test(subtitleFile.name) ? "ass" : "srt";
    const entries = format === "ass" ? parseASS(text) : parseSRT(text);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "Subtitle file could not be parsed (kosong / format tidak dikenali)" },
        { status: 400 }
      );
    }

    const langInfo = LANGUAGES[language as LanguageCode];
    const label = `${langInfo?.label || language} (${subtitleFile.name})`;

    const subtitle = await prisma.subtitle.create({
      data: {
        videoId,
        language,
        label,
        sourceType: "file",
        content: JSON.stringify(entries),
        format,
      },
    });

    return NextResponse.json(
      {
        id: subtitle.id,
        language: subtitle.language,
        label: subtitle.label,
        format: subtitle.format,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add subtitle error:", error);
    return NextResponse.json(
      { error: "Failed to add subtitle" },
      { status: 500 }
    );
  }
}