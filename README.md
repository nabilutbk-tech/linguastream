# 🎬 LinguaStream - Language Learning Platform

Belajar bahasa dengan cara yang menyenangkan menggunakan video dengan subtitle interaktif!

## ✨ Features

- 🎥 **Video Player** dengan kontrol lengkap
- 📝 **Dual Subtitles** - Tampilkan 2 subtitle sekaligus (native + target language)
- 📚 **Vocabulary Extractor** - Ekstrak kata dari subtitle otomatis
- 💾 **Anki Export** - Export vocabulary ke Anki flashcards
- 🎯 **Interactive Quiz** - Test pemahaman vocabulary
- 📱 **Mobile Optimized** - Touch controls, long-press untuk 2x speed
- 🌐 **Auto Language Detection** - Deteksi bahasa subtitle otomatis
- 🎨 **Customizable Styling** - Atur font, size, color subtitle
- ⚡ **Subtitle Sync** - Offset timing untuk sinkronisasi
- 💾 **Local Storage** - IndexedDB untuk media files

## 🆓 Video Hosting - 100% GRATIS

**Tidak perlu bayar hosting!** LinguaStream mendukung berbagai provider gratis:

| Provider | Storage | File Size | Recommended |
|----------|---------|-----------|-------------|
| 📱 **Telegram Bot** | Unlimited | 2GB/file | ⭐⭐⭐⭐⭐ |
| 🐙 **GitHub Releases** | Unlimited | 2GB/file | ⭐⭐⭐⭐⭐ |
| 📚 **Internet Archive** | Unlimited | Unlimited | ⭐⭐⭐⭐ |
| ▲ **Vercel Blob** | 1GB free | 4.5MB/file | ⭐⭐⭐ |

👉 **[Lihat Setup Guide Lengkap](./SETUP_FREE_HOSTING.md)**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/nabilutbk-tech/mystream.git
cd mystream

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dan tambahkan credentials (lihat SETUP_FREE_HOSTING.md)

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Database**: Prisma + LibSQL (Turso)
- **Video**: HTML5 Video API
- **Storage**: IndexedDB + localStorage
- **Hosting**: Vercel (free tier)

## 🎯 Setup Video Hosting (Pilih Salah Satu)

### Option 1: Telegram Bot (PALING MUDAH)

**Keunggulan:**
- ✅ 100% Gratis, unlimited storage
- ✅ Up to 2GB per file
- ✅ Setup 5 menit
- ✅ No bandwidth limit

**Setup:**

1. Buat bot di [@BotFather](https://t.me/BotFather)
2. Buat private channel, tambahkan bot sebagai admin
3. Dapatkan chat_id dengan [@userinfobot](https://t.me/userinfobot)
4. Update `.env`:

```env
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrs"
TELEGRAM_CHAT_ID="-1001234567890"
```

### Option 2: GitHub Releases

**Keunggulan:**
- ✅ 100% Gratis, unlimited
- ✅ Global CDN (fast)
- ✅ Private repos supported

**Setup:**

1. Buat repo private baru
2. Generate Personal Access Token (scope: `repo`)
3. Update `.env`:

```env
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
GITHUB_REPO="username/repo-name"
```

👉 **[Setup Guide Lengkap untuk Semua Provider](./SETUP_FREE_HOSTING.md)**

## 📂 Project Structure

```
linguastream/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # Home page
│   │   ├── library/        # Video library
│   │   ├── player/[id]/    # Video player
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── video/          # Video player components
│   │   ├── subtitle/       # Subtitle components
│   │   ├── library/        # Library components
│   │   └── ui/             # shadcn/ui components
│   ├── stores/             # Zustand stores
│   │   ├── usePlayerStore.ts
│   │   ├── useSubtitleStore.ts
│   │   └── useVocabStore.ts
│   ├── lib/                # Utilities
│   │   ├── subtitle-parser.ts
│   │   ├── anki-generator.ts
│   │   ├── video-upload-helpers.ts
│   │   └── idb.ts
│   └── types/              # TypeScript types
├── prisma/
│   └── schema.prisma       # Database schema
├── public/                 # Static assets
└── .env.example           # Environment template
```

## 🎬 Usage

### 1. Upload Video

1. Buka `/library`
2. Klik "Upload Video"
3. Pilih provider (Telegram/GitHub/dll)
4. Upload video + subtitle (optional)
5. Klik "Upload"

### 2. Watch & Learn

1. Buka video dari library
2. Upload 2 subtitle (native + target language)
3. Atur style & sync subtitle
4. Extract vocabulary dari subtitle
5. Export ke Anki atau test dengan quiz

### 3. Export Vocabulary

1. Buka Vocabulary Extractor
2. Pilih kata yang ingin dipelajari
3. Export ke Anki (TSV/CSV format)
4. Import ke Anki desktop/mobile

## 🔧 Configuration

### Subtitle Settings

```typescript
// Customize di UI atau programmatically:
const subtitleConfig = {
  fontSize: 24,        // 16-32px
  fontFamily: 'Arial',
  color: '#FFFFFF',
  backgroundColor: 'rgba(0,0,0,0.7)',
  position: 'bottom',  // top/bottom
  offset: 0,          // milliseconds
};
```

### Video Provider Priority

```env
# Set primary provider
DEFAULT_VIDEO_PROVIDER="telegram"

# Enable fallback
ENABLE_PROVIDER_FALLBACK="true"
```

## 🚀 Deployment

### Deploy to Vercel (Gratis)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Setup environment variables di Vercel dashboard
# Deploy production
vercel --prod
```

### Deploy to Netlify (Gratis)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy
```

## 📊 Database

### Local Development (SQLite)

```bash
npx prisma studio  # GUI untuk database
```

### Production (Turso - Gratis)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create linguastream

# Get connection string
turso db show linguastream --url

# Update .env
DATABASE_URL="libsql://linguastream-[username].turso.io"
```

## 🐛 Troubleshooting

### Video tidak bisa diupload

```bash
# Check provider credentials
# Telegram:
curl https://api.telegram.org/bot<TOKEN>/getMe

# GitHub:
curl -H "Authorization: Bearer <TOKEN>" https://api.github.com/user
```

### Subtitle tidak sync

- Gunakan offset adjustment di Subtitle Settings
- Range: -5000ms sampai +5000ms
- Fine-tune dengan keyboard: `←` / `→`

### Database error

```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

## 📝 Environment Variables

```env
# Required
DATABASE_URL="file:./dev.db"

# Video Hosting (pilih minimal 1)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
GITHUB_TOKEN=""
GITHUB_REPO=""
INTERNET_ARCHIVE_ACCESS_KEY=""
INTERNET_ARCHIVE_SECRET_KEY=""
BLOB_READ_WRITE_TOKEN=""

# Optional
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Prisma](https://www.prisma.io/)
- [Turso](https://turso.tech/)
- Telegram Bot API
- GitHub API
- Internet Archive

## 💰 Cost Comparison

### Traditional Hosting
- AWS S3 + CloudFront: **$50-100/month**
- Google Cloud Storage: **$40-80/month**
- Azure Blob Storage: **$45-90/month**

### LinguaStream (Free Options)
- Telegram Bot: **$0/month** ✅
- GitHub Releases: **$0/month** ✅
- Internet Archive: **$0/month** ✅
- **Total Savings: $50-100/month!**

## 📞 Support

- 📖 [Documentation](https://github.com/nabilutbk-tech/mystream/wiki)
- 🐛 [Report Issues](https://github.com/nabilutbk-tech/mystream/issues)
- 💬 [Discussions](https://github.com/nabilutbk-tech/mystream/discussions)

---

**Made with ❤️ for language learners**

⭐ Star this repo if you find it helpful!
