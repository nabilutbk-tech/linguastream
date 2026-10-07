import { NextRequest, NextResponse } from "next/server";
import { generateAnkiTSV, generateAnkiCSV } from "@/lib/anki-generator";
import { VocabWord } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words, format = "tsv" } = body as {
      words: VocabWord[];
      format: "tsv" | "csv";
    };

    if (!words || words.length === 0) {
      return NextResponse.json({ error: "No words provided" }, { status: 400 });
    }

    const content = format === "tsv" ? generateAnkiTSV(words) : generateAnkiCSV(words);
    const mimeType = format === "tsv" ? "text/plain" : "text/csv";
    const filename = format === "tsv" ? "linguastream_anki.txt" : "linguastream_anki.csv";

    return new NextResponse(content, {
      headers: {
        "Content-Type": `${mimeType}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export:", error);
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 }
    );
  }
}