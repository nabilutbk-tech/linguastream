import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const video = await prisma.video.findUnique({
        where: { id },
        include: {
          subtitles: {
            select: {
              id: true,
              language: true,
              label: true,
              format: true,
            },
          },
        },
      });
      return NextResponse.json(video);
    }

    const videos = await prisma.video.findMany({
      include: {
        subtitles: {
          select: {
            id: true,
            language: true,
            label: true,
            format: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, language, videoUrl, sourceType, thumbnailUrl } = body;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        language: language || "en",
        videoUrl,
        sourceType: sourceType || "local",
        thumbnailUrl,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Failed to create video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}