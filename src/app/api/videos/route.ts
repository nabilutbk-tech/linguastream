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
    return NextResponse.json([], { status: 200 }); // Return empty array safely on error
  }
}