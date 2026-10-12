# ⚡ Quick Commands Reference

## 🚀 Setup & Run

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Open app
# http://localhost:3000
```

---

## 🎬 Video Conversion

### **Convert Single File:**

```bash
# Balanced mode (recommended for anime):
npm run convert anime.mkv -- --mode balanced

# Fast mode (no quality loss):
npm run convert anime.mkv -- --mode fast

# Compress mode (smaller file):
npm run convert anime.mkv -- --mode compress --quality 720p
```

### **Batch Convert:**

```bash
# Convert all MKV in current folder:
npm run batch-convert "*.mkv" -- --mode balanced

# Convert all MKV in subfolder:
npm run batch-convert "anime/**/*.mkv" -- --mode balanced

# Convert to specific folder:
npm run batch-convert "*.mkv" -- --mode balanced --output ./converted/

# Convert 3 files at once:
npm run batch-convert "*.mkv" -- --parallel 3
```

**Note:** The `--` before options is required for npm scripts!

---

## 🧪 Testing

```bash
# Test Telegram upload:
npm run test-upload telegram test.mp4

# Test GitHub upload:
npm run test-upload github test.mp4

# Interactive setup wizard:
npm run setup
```

---

## 🗄️ Database

```bash
# Generate Prisma client:
npx prisma generate

# Push schema to database:
npx prisma db push

# Open database GUI:
npx prisma studio

# Reset database (WARNING: deletes all data!):
rm prisma/dev.db
npx prisma db push
```

---

## 🎯 Your Typical Workflow

### **Step 1: Convert Videos**
```bash
# Convert all anime to MP4:
npm run batch-convert "D:/Anime/**/*.mkv" -- --mode balanced --output "D:/Anime-MP4/"
```

### **Step 2: Run App**
```bash
npm run dev
```

### **Step 3: Upload**
```
1. Open http://localhost:3000/library
2. Click "Upload Video"
3. Select provider: Telegram Bot
4. Choose converted MP4 file
5. Add subtitles (optional)
6. Click Upload!
```

---

## 🔧 Troubleshooting

```bash
# Check FFmpeg installation:
ffmpeg -version

# Install FFmpeg (Windows):
winget install ffmpeg

# Clear Next.js cache:
rm -rf .next
npm run dev

# Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install

# Test Telegram connection:
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

---

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - 5-minute setup
- [VIDEO_CONVERSION_GUIDE.md](./VIDEO_CONVERSION_GUIDE.md) - Conversion guide
- [SETUP_FREE_HOSTING.md](./SETUP_FREE_HOSTING.md) - Provider setup
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Fix issues

---

## 💡 Pro Tips

```bash
# 1. Convert MKV to MP4 (fastest, no loss):
npm run convert video.mkv -- --mode fast

# 2. If file still large, optimize:
npm run convert video.mp4 -- --mode balanced

# 3. Batch convert entire folder:
npm run batch-convert "folder/**/*.mkv" -- --mode balanced --parallel 2

# 4. Test single file upload first:
npm run test-upload telegram video.mp4

# 5. Then upload via web UI for better experience
```

---

**Save this file for quick reference!** 📖
