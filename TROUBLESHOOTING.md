# 🔧 Troubleshooting Guide - LinguaStream

## 📱 Telegram Upload Issues

### Error: "Invalid bot token"

**Penyebab:**
- Bot token salah atau tidak valid
- Token expired atau revoked

**Solusi:**
```bash
# Test bot token
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# Response harus:
# {"ok":true,"result":{"id":123456789,"is_bot":true,...}}

# Jika error, buat bot baru:
# 1. Chat @BotFather
# 2. /newbot
# 3. Copy token baru
```

### Error: "Bad Request: chat not found"

**Penyebab:**
- Chat ID salah
- Bot belum ditambahkan ke channel
- Format chat ID salah

**Solusi:**
```bash
# Chat ID harus:
# - Dimulai dengan minus: -1001234567890
# - Untuk channel/group, BUKAN user ID

# Cara dapat chat ID:
1. Buat channel private
2. Tambahkan bot sebagai admin
3. Post message di channel
4. Forward message ke @userinfobot
5. Copy chat_id dari reply
```

### Error: "File too large"

**Penyebab:**
- File > 2GB (limit Telegram)

**Solusi:**
```bash
# Compress video dengan FFmpeg:
ffmpeg -i input.mp4 \
  -vcodec h264 \
  -acodec aac \
  -vf scale=1280:720 \
  -crf 23 \
  output.mp4

# Atau split video:
ffmpeg -i input.mp4 -c copy -map 0 -segment_time 3600 -f segment output%03d.mp4
```

### Error: "Upload timeout"

**Penyebab:**
- Koneksi lambat
- File terlalu besar

**Solusi:**
- Gunakan koneksi lebih cepat
- Compress video
- Upload di jam low-traffic

---

## 🐙 GitHub Upload Issues

### Error: "Bad credentials"

**Penyebab:**
- Token salah atau expired
- Token tidak punya scope `repo`

**Solusi:**
```bash
# Test token
curl -H "Authorization: Bearer <YOUR_TOKEN>" https://api.github.com/user

# Buat token baru:
# 1. GitHub Settings → Developer settings
# 2. Personal access tokens → Tokens (classic)
# 3. Generate new token
# 4. Pilih scope: repo (full control)
# 5. Copy token (SIMPAN, tidak bisa dilihat lagi!)
```

### Error: "Repository not found"

**Penyebab:**
- Nama repo salah
- Format salah
- Token tidak punya akses ke repo

**Solusi:**
```bash
# Format harus: username/repo-name
# Contoh: nabilutbk-tech/linguastream-videos

# Test akses:
curl -H "Authorization: Bearer <TOKEN>" \
  https://api.github.com/repos/username/repo-name
```

### Error: "Release creation failed"

**Penyebab:**
- Tag name sudah ada
- Tidak punya permission

**Solusi:**
```bash
# Check existing releases:
curl https://api.github.com/repos/username/repo-name/releases

# Delete old release jika perlu (via GitHub UI)
```

---

## 📚 Internet Archive Issues

### Error: "Access denied"

**Penyebab:**
- API keys salah
- Keys expired

**Solusi:**
```bash
# Generate new keys:
# 1. Login ke archive.org
# 2. https://archive.org/account/s3.php
# 3. Click "Generate keys"
# 4. Copy Access Key & Secret Key
```

### Error: "Upload failed"

**Penyebab:**
- File format tidak didukung
- Metadata salah

**Solusi:**
- Pastikan file video valid (mp4, mkv, avi, dll)
- Check metadata headers

---

## 🗄️ Database Issues

### Error: "Database not found"

**Penyebab:**
- Prisma belum generate
- Database belum dibuat

**Solusi:**
```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Check database
npx prisma studio
```

### Error: "Table does not exist"

**Penyebab:**
- Migration belum dijalankan
- Schema tidak sync

**Solusi:**
```bash
# Reset database (WARNING: data hilang)
rm prisma/dev.db
npx prisma db push

# Atau migrate:
npx prisma migrate dev
```

---

## 🎬 Video Player Issues

### Video tidak bisa diplay

**Penyebab:**
- URL tidak valid
- CORS error
- Format tidak didukung

**Solusi:**
```bash
# Test URL:
curl -I <VIDEO_URL>

# Check headers:
# - Content-Type: video/mp4 (atau video/*)
# - Access-Control-Allow-Origin: * (untuk CORS)

# Convert video ke format compatible:
ffmpeg -i input.mov -vcodec h264 -acodec aac output.mp4
```

### Video lag/buffering

**Penyebab:**
- Bitrate terlalu tinggi
- Koneksi lambat

**Solusi:**
```bash
# Optimize video:
ffmpeg -i input.mp4 \
  -vcodec h264 \
  -b:v 1M \
  -maxrate 1M \
  -bufsize 2M \
  -vf scale=1280:720 \
  output.mp4
```

---

## 📝 Subtitle Issues

### Subtitle tidak muncul

**Penyebab:**
- Format file salah
- Encoding salah (bukan UTF-8)
- Timing salah

**Solusi:**
```bash
# Convert ke UTF-8:
iconv -f ISO-8859-1 -t UTF-8 subtitle.srt > subtitle-utf8.srt

# Validate SRT format:
head -10 subtitle.srt
# Harus:
# 1
# 00:00:01,000 --> 00:00:03,000
# Text subtitle
```

### Subtitle tidak sync

**Solusi:**
- Gunakan Offset adjustment di UI
- Range: -5000ms sampai +5000ms
- Fine-tune dengan keyboard arrows

### Subtitle overlap/terlalu cepat

**Solusi:**
```bash
# Fix timing dengan subtitle tools:
# - Aegisub (free, GUI)
# - ffmpeg
# - Online tools: subtitletools.com
```

---

## 🌐 Deployment Issues

### Build failed on Vercel

**Penyebab:**
- Prisma generate failed
- Environment variables tidak set

**Solusi:**
```bash
# Pastikan build command:
npm run build  # atau: prisma generate && next build

# Set environment variables di Vercel:
# Project Settings → Environment Variables
# Add: DATABASE_URL, TELEGRAM_BOT_TOKEN, dll
```

### API route timeout

**Penyebab:**
- Upload terlalu lama (> 10s di Vercel free)
- File terlalu besar

**Solusi:**
- Upgrade Vercel plan
- Atau upload dari client-side langsung ke provider
- Atau gunakan background job

---

## 💾 Storage Issues

### IndexedDB quota exceeded

**Penyebab:**
- Terlalu banyak video di local storage

**Solusi:**
```javascript
// Clear old videos:
// Buka DevTools → Application → IndexedDB → linguastream
// Atau gunakan auto-cleanup (sudah built-in)
```

### localStorage full

**Solusi:**
```javascript
// Clear data:
localStorage.clear();

// Atau selective:
localStorage.removeItem('vocab-store');
```

---

## 🔍 Debug Mode

### Enable verbose logging

```bash
# Development:
DEBUG=* npm run dev

# Check browser console:
# F12 → Console tab

# Check network requests:
# F12 → Network tab → Filter: XHR/Fetch
```

### Test API endpoints

```bash
# Upload endpoint:
curl -X POST http://localhost:3000/api/videos/upload \
  -F "title=Test Video" \
  -F "language=en" \
  -F "provider=telegram" \
  -F "video=@test.mp4"

# Get videos:
curl http://localhost:3000/api/videos
```

---

## 🚨 Common Error Messages

### "Cannot read property 'X' of undefined"

**Solusi:**
- Check TypeScript types
- Add null checks
- Use optional chaining: `obj?.prop`

### "CORS error"

**Solusi:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

### "Module not found"

**Solusi:**
```bash
# Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache:
rm -rf .next
npm run dev
```

---

## 📞 Get Help

Jika masalah masih belum teratasi:

1. **Check logs:**
   - Browser console (F12)
   - Terminal output
   - Vercel/Netlify logs

2. **Search issues:**
   - https://github.com/nabilutbk-tech/mystream/issues

3. **Create new issue:**
   - Include: error message, steps to reproduce, environment
   - Attach: logs, screenshots

4. **Community:**
   - GitHub Discussions
   - Discord (coming soon)

---

## 🔧 Useful Commands

```bash
# Reset everything:
rm -rf node_modules .next prisma/dev.db
npm install
npx prisma generate
npx prisma db push
npm run dev

# Check database:
npx prisma studio

# Test upload:
node scripts/test-upload.js telegram ./test.mp4

# Build for production:
npm run build
npm start

# Check for updates:
npm outdated
npm update
```

---

**Last Updated:** 2026-10-09
