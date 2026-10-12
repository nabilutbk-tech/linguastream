// Helper functions untuk upload video ke berbagai provider

interface UploadResult {
  url: string;
  provider: string;
  fileId?: string;
}

// Helper: retry fetch untuk mengatasi ECONNRESET sesaat (khususnya upload besar)
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
  delayMs = 2000
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastError = err;
      const code = (err as { cause?: { code?: string } })?.cause?.code;
      console.log(
        `Fetch attempt ${attempt}/${retries} failed (${code || err})`
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

// ==========================================
// TELEGRAM BOT UPLOAD
// ==========================================
export async function uploadToTelegram(
  file: File
): Promise<UploadResult> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error(
      "Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (or TELEGRAM_CHANNEL_ID) in .env"
    );
  }

  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("video", file);
  formData.append("supports_streaming", "true");

  // Upload video (dengan retry untuk jaringan tidak stabil)
  const uploadRes = await fetchWithRetry(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
    {
      method: "POST",
      body: formData,
    }
  );

  const uploadData = await uploadRes.json();

  if (!uploadData.ok) {
    throw new Error(`Telegram upload failed: ${uploadData.description}`);
  }

  const fileId = uploadData.result.video.file_id;

  // Get file info for URL
  const fileRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const fileData = await fileRes.json();

  if (!fileData.ok) {
    throw new Error("Failed to get file info from Telegram");
  }

  return {
    url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`,
    provider: "telegram",
    fileId,
  };
}

// ==========================================
// GITHUB RELEASES UPLOAD
// ==========================================
export async function uploadToGitHub(
  file: File
): Promise<UploadResult> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error(
      "GitHub not configured. Set GITHUB_TOKEN and GITHUB_REPO in .env"
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const timestamp = Date.now();
  const tagName = `video-${timestamp}`;
  const baseHeaders = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  };

  // 1. Create release (dengan retry)
  let release: any;
  try {
    const releaseRes = await fetchWithRetry(
      `https://api.github.com/repos/${GITHUB_REPO}/releases`,
      {
        method: "POST",
        headers: {
          ...baseHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_name: tagName,
          name: file.name,
          body: `Video uploaded: ${file.name} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`,
          draft: false,
          prerelease: false,
        }),
      }
    );

    if (!releaseRes.ok) {
      const error = await releaseRes.json().catch(() => null);
      throw new Error(
        `GitHub release failed: ${error?.message || releaseRes.statusText}`
      );
    }
    release = await releaseRes.json();
  } catch (err) {
    throw new Error(
      `GitHub release failed: ${err instanceof Error ? err.message : err}`
    );
  }

  const uploadUrl = release.upload_url.replace(
    "{?name,label}",
    `?name=${encodeURIComponent(file.name)}`
  );

  // 2. Upload asset (dengan retry untuk file besar)
  let asset: any;
  try {
    const assetRes = await fetchWithRetry(
      uploadUrl,
      {
        method: "POST",
        headers: {
          ...baseHeaders,
          "Content-Type": file.type || "application/octet-stream",
          "Content-Length": String(buffer.length),
        },
        body: buffer,
      },
      3,
      3000
    );

    if (!assetRes.ok) {
      const error = await assetRes.json().catch(() => null);
      throw new Error(
        `GitHub asset upload failed: ${error?.message || assetRes.statusText}`
      );
    }
    asset = await assetRes.json();
  } catch (err) {
    // Bersihkan release yang gagal agar tidak menumpuk
    try {
      await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/${release.id}`,
        { method: "DELETE", headers: baseHeaders }
      );
    } catch {}
    throw new Error(
      `GitHub asset upload failed: ${err instanceof Error ? err.message : err}`
    );
  }

  return {
    url: asset.browser_download_url,
    provider: "github",
  };
}

// ==========================================
// INTERNET ARCHIVE UPLOAD
// ==========================================
export async function uploadToInternetArchive(
  file: File
): Promise<UploadResult> {
  const ACCESS_KEY = process.env.INTERNET_ARCHIVE_ACCESS_KEY;
  const SECRET_KEY = process.env.INTERNET_ARCHIVE_SECRET_KEY;

  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error(
      "Internet Archive not configured. Set INTERNET_ARCHIVE_ACCESS_KEY and INTERNET_ARCHIVE_SECRET_KEY"
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const identifier = `linguastream-${Date.now()}`;
  const url = `https://s3.us.archive.org/${identifier}/${file.name}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "x-archive-auto-make-bucket": "1",
      "x-archive-meta-mediatype": "movies",
      "x-archive-meta-title": file.name,
      "x-archive-meta-collection": "opensource_movies",
      "x-archive-meta-subject": "language learning;education",
      Authorization: `LOW ${ACCESS_KEY}:${SECRET_KEY}`,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`Internet Archive upload failed: ${response.statusText}`);
  }

  return {
    url: `https://archive.org/download/${identifier}/${file.name}`,
    provider: "internet-archive",
  };
}

// ==========================================
// VERCEL BLOB UPLOAD (requires @vercel/blob)
// ==========================================
export async function uploadToVercelBlob(
  file: File
): Promise<UploadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Vercel Blob not configured. Deploy to Vercel or set BLOB_READ_WRITE_TOKEN"
    );
  }

  // Dynamic import untuk avoid error jika tidak di Vercel
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      provider: "vercel-blob",
    };
  } catch (error) {
    throw new Error(
      "Vercel Blob upload failed. Make sure @vercel/blob is installed"
    );
  }
}

// ==========================================
// MAIN UPLOAD FUNCTION
// ==========================================
export async function uploadVideo(
  file: File,
  provider: string = "telegram"
): Promise<UploadResult> {
  console.log(`Uploading ${file.name} to ${provider}...`);

  switch (provider) {
    case "telegram":
      return uploadToTelegram(file);
    case "github":
      return uploadToGitHub(file);
    case "internet-archive":
      return uploadToInternetArchive(file);
    case "vercel-blob":
      return uploadToVercelBlob(file);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ==========================================
// GET VIDEO STREAM URL (untuk Telegram)
// ==========================================
export async function getTelegramStreamUrl(fileId: string): Promise<string> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const data = await res.json();

  if (!data.ok) {
    throw new Error("Failed to get Telegram file info");
  }

  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
}
