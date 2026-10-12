# 🎉 Setup Video Hosting 100% GRATIS

## 📋 Daftar Provider Gratis

| Provider | Storage | File Size | Speed | Rekomendasi |
|----------|---------|-----------|-------|-------------|
| 🏆 **Telegram Bot** | Unlimited | 2GB/file | Fast | ⭐⭐⭐⭐⭐ |
| 🏆 **GitHub Releases** | Unlimited | 2GB/file | Fast | ⭐⭐⭐⭐⭐ |
| **Internet Archive** | Unlimited | Unlimited | Medium | ⭐⭐⭐⭐ |
| **Vercel Blob** | 1GB (free) | 4.5MB/file | Fast | ⭐⭐⭐ |

---

## 🤖 Option 1: Telegram Bot (PALING MUDAH)

### Kenapa Telegram?
- ✅ **100% Gratis**, unlimited storage
- ✅ Up to **2GB per file**
- ✅ Fast streaming
- ✅ Private & secure
- ✅ No bandwidth limit

### Setup Step-by-Step:

#### 1. Buat Bot Telegram
```
1. Buka Telegram, cari @BotFather
2. Kirim perintah: /newbot
3. Ikuti instruksi, pilih nama bot
4. Copy TOKEN yang diberikan (contoh: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
```

#### 2. Buat Channel Private
```
1. Buat channel baru (private)
2. Tambahkan bot Anda sebagai admin
3. Posting pesan apapun di channel
```

#### 3. Dapatkan Chat ID
```
1. Forward pesan dari channel ke @userinfobot
2. Bot akan reply dengan info, copy chat_id (contoh: -1001234567890)
```

#### 4. Setup Environment Variables
Buka `.env` file dan tambahkan:
```env
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="-1001234567890"
```

#### 5. Test Upload
```bash
npm run dev
# Buka http://localhost:3000/library
# Upload video dengan provider: Telegram Bot
```

---

## 🐙 Option 2: GitHub Releases

### Kenapa GitHub?
- ✅ **100% Gratis**, unlimited
- ✅ Up to **2GB per file**
- ✅ Global CDN (fast)
- ✅ Private repos supported
- ✅ Version control

### Setup Step-by-Step:

#### 1. Buat Repository
```
1. Login ke GitHub.com
2. Klik "New Repository"
3. Nama: linguastream-videos (atau apapun)
4. Pilih "Private" untuk privacy
5. Create repository
```

#### 2. Buat Personal Access Token
```
1. GitHub Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Pilih scope: repo (full control)
5. Generate token, COPY sekarang!
```

#### 3. Setup Environment Variables
```env
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
GITHUB_REPO="username/linguastream-videos"
```

#### 4. Test Upload
```bash
npm run dev
# Upload video dengan provider: GitHub Releases
```

---

## 📚 Option 3: Internet Archive

### Kenapa Internet Archive?
- ✅ **Forever storage** (never deleted)
- ✅ **Unlimited** storage & file size
- ✅ Public domain friendly
- ⚠️ Videos akan public (ada di archive.org)

### Setup Step-by-Step:

#### 1. Daftar Account
```
1. Buka https://archive.org/account/login
2. Create account (gratis)
3. Verify email
```

#### 2. Generate API Keys
```
1. Login ke archive.org
2. Buka https://archive.org/account/s3.php
3. Click "Generate keys"
4. Copy Access Key & Secret Key
```

#### 3. Setup Environment Variables
```env
INTERNET_ARCHIVE_ACCESS_KEY="your_access_key"
INTERNET_ARCHIVE_SECRET_KEY="your_secret_key"
```

---

## ▲ Option 4: Vercel Blob (Jika deploy di Vercel)

### Setup:
```
1. Deploy project ke Vercel
2. Project Settings → Storage → Create Blob Store
3. Environment variables otomatis ditambahkan
```

⚠️ **Limitation**: Free tier hanya 1GB total

---

## 🚀 Quick Start (Telegram - Tercepat)

### 1. Clone & Install
```bash
git clone https://github.com/nabilutbk-tech/mystream.git
cd mystream
npm install
```

### 2. Setup Database
```bash
cp .env.example .env
npx prisma generate
npx prisma db push
```

### 3. Setup Telegram Bot (5 menit)
```bash
# 1. Chat with @BotFather, create bot
# 2. Create private channel, add bot as admin
# 3. Forward message to @userinfobot untuk dapat chat_id
```

### 4. Update .env
```env
TELEGRAM_BOT_TOKEN="paste_token_here"
TELEGRAM_CHAT_ID="paste_chat_id_here"
```

### 5. Run & Upload!
```bash
npm run dev
# Buka http://localhost:3000/library
# Klik "Upload Video"
# Pilih provider: Telegram Bot
# Upload video Anda!
```

---

## 🎬 Upload dari Telegram ke Library

### Cara 1: Via Bot Upload
1. Upload video seperti biasa di aplikasi
2. Bot akan simpan di channel
3. Video otomatis masuk ke library

### Cara 2: Via URL (dari video yang sudah ada)
1. Upload video ke channel Telegram manual
2. Get file_id dari video
3. Input file_id di form upload

### Cara 3: Via Direct Link
```javascript
// Jika video sudah ada di Telegram:
const telegramUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;
```

---

## 🔧 Update Prisma Schema

Tambahkan field `provider` ke model Video:

```prisma
model Video {
  id          String   @id @default(cuid())
  title       String
  videoUrl    String
  provider    String   @default("telegram") // NEW
  sourceType  String
  language    String
  subtitles   Subtitle[]
  createdAt   DateTime @default(now())
}
```

Jalankan:
```bash
npx prisma db push
```

---

## 🐛 Troubleshooting

### Error: "Telegram upload failed"
```bash
# Check:
1. Bot token benar?
2. Bot sudah jadi admin di channel?
3. Chat ID benar? (harus ada minus: -1001234567890)
```

### Error: "GitHub upload failed"
```bash
# Check:
1. Token masih valid?
2. Token punya scope "repo"?
3. Repo name format: username/repo-name
```

### Error: "File too large"
```bash
# Solution:
1. Kompres video dengan HandBrake/FFmpeg
2. Target: 720p, H.264, ~500MB untuk 1 jam
3. Atau split video jadi beberapa part
```

---

## 💡 Tips & Best Practices

### 1. Video Compression
```bash
# Menggunakan FFmpeg (gratis)
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -vf scale=1280:720 -crf 23 output.mp4
```

### 2. Multiple Providers
Setup semua provider untuk backup:
```env
# Setup semua
TELEGRAM_BOT_TOKEN="..."
GITHUB_TOKEN="..."
INTERNET_ARCHIVE_ACCESS_KEY="..."
```

### 3. Auto Backup
Video otomatis backup ke multiple providers dengan cron job.

### 4. Bandwidth Optimization
- Gunakan Telegram untuk streaming (unlimited bandwidth)
- GitHub untuk download
- Internet Archive untuk archival

---

## 📊 Perbandingan Biaya

| Service | Cost/Month | Storage | Bandwidth |
|---------|------------|---------|----------|
| **Telegram** | **$0** | Unlimited | Unlimited |
| **GitHub** | **$0** | Unlimited | Unlimited |
| AWS S3 | $23+ | 100GB | 1TB |
| Google Cloud | $20+ | 100GB | 1TB |
| Cloudflare R2 | $1.5+ | 10GB free | Free egress |

**Kesimpulan**: Save $20-50/month dengan setup ini! 🎉

---

## 🎯 Next Steps

1. ✅ Setup salah satu provider (Telegram recommended)
2. ✅ Update Prisma schema
3. ✅ Test upload video
4. ✅ Configure subtitle auto-upload
5. ✅ Deploy to Vercel/Netlify (gratis)

---

## 🆘 Butuh Bantuan?

- 📖 [Documentation](https://github.com/nabilutbk-tech/mystream/wiki)
- 💬 [GitHub Issues](https://github.com/nabilutbk-tech/mystream/issues)
- 📧 Email: support@linguastream.com

---

**Happy Learning! 🎓**
