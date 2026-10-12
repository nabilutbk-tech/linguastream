import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

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
    return NextResponse.json([], { status: 200 });
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

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    await prisma.video.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, series, title, description } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof series === "string") {
      data.series = series.trim() ? series.trim() : null;
    }
    if (typeof title === "string" && title.trim()) {
      data.title = title.trim();
    }
    if (typeof description === "string") {
      data.description = description;
    }

    const video = await prisma.video.update({ where: { id }, data });
    return NextResponse.json(video);
  } catch (error) {
    console.error("Failed to update video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}