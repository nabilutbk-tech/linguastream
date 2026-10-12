# ⚡ Quick Start - 5 Menit Setup!

## 🎯 Langkah Cepat (Telegram Bot)

### 1️⃣ Install & Setup (2 menit)

```bash
git clone https://github.com/nabilutbk-tech/mystream.git
cd mystream
npm install
cp .env.example .env
```

### 2️⃣ Buat Telegram Bot (2 menit)

1. **Buka Telegram** → Cari `@BotFather`
2. **Kirim:** `/newbot`
3. **Ikuti instruksi**, pilih nama bot
4. **Copy token** (contoh: `123456789:ABCdefGHI...`)

### 3️⃣ Setup Channel (1 menit)

1. **Buat channel private** di Telegram
2. **Tambahkan bot** sebagai admin (Settings → Administrators → Add Admin)
3. **Post message** apapun di channel
4. **Forward message** ke `@userinfobot`
5. **Copy chat_id** dari reply (contoh: `-1001234567890`)

### 4️⃣ Update .env

```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN="paste_token_disini"
TELEGRAM_CHAT_ID="paste_chat_id_disini"
```

### 5️⃣ Run!

```bash
npx prisma generate
npx prisma db push
npm run dev
```

**Buka:** http://localhost:3000/library

---

## 🎬 Upload Video Pertama

1. Klik **"Upload Video"**
2. Pilih provider: **Telegram Bot**
3. Isi:
   - Title: Nama video
   - Language: Bahasa konten
   - Video file: Browse file video
   - Subtitle 1 (optional): File .srt atau .ass
   - Subtitle 2 (optional): File subtitle bahasa kedua
4. Klik **"Upload to Telegram Bot"**
5. Tunggu upload selesai
6. Video muncul di library! 🎉

---

## 🧪 Test Upload

```bash
# Test koneksi
node scripts/test-upload.js telegram path/to/video.mp4
```

---

## 🚨 Troubleshooting Cepat

### ❌ "Invalid bot token"
```bash
# Test token:
curl https://api.telegram.org/bot<TOKEN>/getMe

# Harus return: {"ok":true,...}
# Jika error, buat bot baru di @BotFather
```

### ❌ "Chat not found"
```bash
# Pastikan:
1. Chat ID benar (harus ada minus: -1001234567890)
2. Bot sudah jadi admin di channel
3. Bot tidak di-block
```

### ❌ "Upload failed"
```bash
# Check:
1. File size < 2GB
2. Internet connection stable
3. .env file benar
```

---

## 📚 Dokumentasi Lengkap

- 📖 [README.md](./README.md) - Main documentation
- 🔧 [SETUP_FREE_HOSTING.md](./SETUP_FREE_HOSTING.md) - Semua provider
- 🐛 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- 📝 [CHANGELOG.md](./CHANGELOG.md) - Version history

---

## 💰 Hemat Biaya

| Service | Biaya/Bulan |
|---------|-------------|
| AWS S3 | $50-100 |
| Google Cloud | $40-80 |
| Azure | $45-90 |
| **LinguaStream** | **$0** ✅ |

**Total Savings: $500-1200/tahun!**

---

## ⚡ Commands Cheatsheet

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio        # Open database GUI

# Testing
node scripts/test-upload.js telegram video.mp4
node scripts/test-upload.js github video.mp4

# Setup
node scripts/setup.js    # Interactive setup wizard
```

---

## 🎯 Next Steps

1. ✅ Upload video pertama
2. ✅ Test playback
3. ✅ Upload subtitle
4. ✅ Extract vocabulary
5. ✅ Export ke Anki
6. 🚀 Deploy to production (Vercel/Netlify)

---

## 🆘 Need Help?

- 🐛 [Report Issue](https://github.com/nabilutbk-tech/mystream/issues)
- 💬 [Ask Question](https://github.com/nabilutbk-tech/mystream/discussions)
- 📧 Email: support@linguastream.com

---

**Happy Learning! 🎓**
