import { NextRequest, NextResponse } from "next/server";
import { parseSRT, parseASS, detectSubtitleFormat } from "@/lib/subtitle-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = (formData.get("language") as string) || "en";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const content = await file.text();
    const format = detectSubtitleFormat(file.name);
    const entries = format === "ass" ? parseASS(content) : parseSRT(content);

    return NextResponse.json({
      format,
      language,
      entries,
      filename: file.name,
      entryCount: entries.length,
    });
  } catch (error) {
    console.error("Failed to parse subtitle:", error);
    return NextResponse.json(
      { error: "Failed to parse subtitle" },
      { status: 500 }
    );
  }
}