import { NextRequest, NextResponse } from "next/server";
import { extractWordsFromSubtitles } from "@/lib/subtitle-parser";
import { SubtitleEntry } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries, language } = body as {
      entries: SubtitleEntry[];
      language: string;
    };

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { error: "No subtitle entries provided" },
        { status: 400 }
      );
    }

    const words = extractWordsFromSubtitles(entries, language);

    return NextResponse.json({
      words,
      totalWords: words.length,
      language,
    });
  } catch (error) {
    console.error("Failed to extract vocabulary:", error);
    return NextResponse.json(
      { error: "Failed to extract vocabulary" },
      { status: 500 }
    );
  }
}