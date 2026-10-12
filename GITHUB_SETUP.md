# 🐙 GitHub Releases Hosting - Setup Guide

Hosting video gratis dengan limit **2GB per file** — tanpa batas bandwidth, tanpa biaya.

## ⚠️ PENTING: Repo Harus PUBLIC

Agar player video bisa streaming **tanpa login/sesi** (tag `<video>` tidak bisa kirim token auth ke GitHub), repo video **harus public**. Konsekuensi: video bisa diakses publik — sama seperti channel Telegram public Anda.

---

## Langkah 1: Buat GitHub Personal Access Token

1. Buka: https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. Isi:
   - **Note:** `linguastream-videos`
   - **Expiration:** No expiration (atau 90 hari, silakan)
4. Centang scope: **`repo`** (full control of private repositories)
5. Klik **"Generate token"**
6. **COPY TOKEN SEKARANG!** (tidak akan ditampilkan lagi)
   - Format: `ghp_xxxxx...`

⚠️ Jangan commit token ini ke git!

---

## Langkah 2: Buat Repository Public (sekali saja)

**Manual via web:**
1. Buka https://github.com/new
2. Repository name: `linguastream-videos`
3. Visibility: **Public**
4. Jangan init apa-apa (kosong saja)
5. Klik **Create repository**

**Atau otomatis (jika sudah punya token):**
```bash
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer ghp_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"name":"linguastream-videos","visibility":"public"}'
```

---

## Langkah 3: Setup .env

Edit file `.env` di `D:\linguastream`:

```env
GITHUB_TOKEN="ghp_your_token_here"
GITHUB_REPO="nabilutbk-tech/linguastream-videos"
```

Format repo: `username/repo-name`

---

## Langkah 4: Test

```bash
# Test koneksi
curl -H "Authorization: Bearer ghp_xxx" https://api.github.com/user

# Harus return: {"login":"nabilutbk-tech",...}
```

Lalu upload via web UI: http://localhost:3000/library → pilih **GitHub Releases**.

---

## Cara Kerja di Belakang Layar

```
Upload video (web UI)
        ↓
POST /api/videos/upload (provider=github)
        ↓
1. Buat Release baru  →  video-<timestamp>
2. Upload file sbg asset release
        ↓
URL = https://github.com/user/repo/releases/download/video-xxx/video.mp4
        ↓
Player streaming langsung dari GitHub CDN
(redirect otomatis ke fast CDN + support seek/range)
```

---

## Troubleshooting

### ❌ "Bad credentials"
Token salah/expired → buat ulang token.

### ❌ "Repository not found"
- Repo belum dibuat → buat dulu
- Format salah → harus `username/repo-name`

### ❌ "Release failed: Validation Failed"
- Tag name bentrok → hapus release lama dengan tag sama, atau tunggu 1 detik lalu retry (app sudah auto-retry 3x)

### ❌ Streaming tidak bisa di Vercel
- Pastikan repo **public**. Repo private tidak bisa di-stream oleh `<video>` tanpa auth.