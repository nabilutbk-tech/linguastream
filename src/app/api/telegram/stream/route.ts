import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("Missing fileId", { status: 400 });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    return new NextResponse("Bot token not configured", { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    const data = await res.json();

    if (!data.ok) {
      return new NextResponse("Failed to get file from Telegram", { status: 404 });
    }

    const filePath = data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    console.error("Telegram stream error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}