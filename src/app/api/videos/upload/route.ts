import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadVideo } from "@/lib/video-upload-helpers";
import { parseSRT, parseASS } from "@/lib/subtitle-parser";

// Parse subtitle file -> simpan entries JSON (sesuai GET /api/subtitle/[id])
async function parseSubtitle(file: File) {
  const text = await file.text();
  const format = /\.(ass|ssa)$/i.test(file.name) ? "ass" : "srt";
  const entries = format === "ass" ? parseASS(text) : parseSRT(text);
  return { format, content: JSON.stringify(entries) };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const language = formData.get("language") as string;
    const series = formData.get("series") as string | null;
    const videoFile = formData.get("video") as File;
    const provider = (formData.get("provider") as string) || "telegram";
    const subFile1 = formData.get("subtitle1") as File | null;
    const subLang1 = formData.get("subLang1") as string;
    const subFile2 = formData.get("subtitle2") as File | null;
    const subLang2 = formData.get("subLang2") as string;

    // Validation
    if (!videoFile || !title || !language) {
      return NextResponse.json(
        { error: "Missing required fields: title, language, and video file" },
        { status: 400 }
      );
    }

    // Check file size (optional, adjust as needed)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: "Video file too large. Maximum size is 2GB" },
        { status: 400 }
      );
    }

    console.log(`Uploading video: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(1)}MB) to ${provider}`);

    // Upload video to selected provider
    const uploadResult = await uploadVideo(videoFile, provider);

    console.log(`Upload successful: ${uploadResult.url}`);

    // Process subtitles
    const subtitles = [];
    if (subFile1) {
      const sub1 = await parseSubtitle(subFile1);
      subtitles.push({
        language: subLang1,
        label: `Subtitle 1 (${subLang1})`,
        format: sub1.format,
        content: sub1.content,
      });
    }
    if (subFile2) {
      const sub2 = await parseSubtitle(subFile2);
      subtitles.push({
        language: subLang2,
        label: `Subtitle 2 (${subLang2})`,
        format: sub2.format,
        content: sub2.content,
      });
    }

    // Save to database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        language,
        series: series?.trim() ? series.trim() : null,
        videoUrl: uploadResult.url,
        sourceType: "hosted",
        telegramFileId: uploadResult.fileId || null,
        subtitles: {
          create: subtitles.map((sub, idx) => ({
            id: `${Date.now()}-${idx}`,
            language: sub.language,
            label: sub.label,
            format: sub.format,
            content: sub.content,
          })),
        },
      },
      include: {
        subtitles: true,
      },
    });

    console.log(`Video saved to database: ${video.id}`);

    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Upload failed",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
