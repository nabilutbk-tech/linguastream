# 🎬 Video Conversion Guide - Untuk Anime & Learning Videos

## 🎯 Quick Reference

### **Untuk Video Anime (<2GB):**

```bash
# Single file (RECOMMENDED):
node scripts/convert-video.js anime-ep01.mkv --mode balanced

# Batch convert (semua episode):
node scripts/batch-convert.js "anime/*.mkv" --mode balanced
```

✅ **Hasil:**
- Quality: Sangat bagus (barely noticeable loss)
- Size: ~30% lebih kecil
- Perfect untuk subtitle reading

---

## 📊 Mode Comparison

### **Untuk Anime/Learning Videos (<2GB):**

| Input | Mode | Output Size | Quality | Upload Time* | Recommended |
|-------|------|-------------|---------|--------------|-------------|
| 1.5GB MKV | **fast** | 1.5GB | Perfect | 8 min | ⭐⭐⭐ |
| 1.5GB MKV | **balanced** | 1.0GB | Excellent | 5 min | ⭐⭐⭐⭐⭐ |
| 1.5GB MKV | **compress** | 500MB | Good | 3 min | ⭐⭐⭐⭐ |

*Upload time based on 5 Mbps internet

---

## 🎨 Quality Explained

### **Fast Mode** (No Re-encoding)
```bash
node scripts/convert-video.js video.mkv --mode fast
```

**Pros:**
- ✅ **0% quality loss** (perfect copy)
- ✅ Super fast (1 minute for 1GB)
- ✅ No CPU usage

**Cons:**
- ❌ Same file size
- ❌ Only works if codec already H.264

**Best for:**
- MKV files that already use H.264 codec
- You have fast internet
- Storage not a problem

---

### **Balanced Mode** (Recommended) ⭐
```bash
node scripts/convert-video.js video.mkv --mode balanced
```

**Pros:**
- ✅ Excellent quality (5-10% loss)
- ✅ 30% smaller file size
- ✅ Faster upload
- ✅ Perfect untuk anime/learning

**Cons:**
- ⚠️ Moderate CPU usage
- ⚠️ Takes time (2-3x video length)

**Best for:**
- **ANIME** (recommended!)
- Language learning videos
- Balance between quality & size
- Most use cases

**Visual Quality:**
```
Original:    ████████████████████ 100%
Balanced:    ███████████████████░  95%
Difference:  Barely noticeable!
```

---

### **Compress Mode** (Save Storage)
```bash
node scripts/convert-video.js video.mkv --mode compress --quality 720p
```

**Pros:**
- ✅ 50-70% smaller
- ✅ Very fast upload
- ✅ Good for slow internet

**Cons:**
- ⚠️ 15-25% quality loss
- ⚠️ Noticeable on large screens
- ⚠️ Takes longest time

**Best for:**
- Slow internet (<5 Mbps)
- Storage limited
- Mobile viewing
- Subtitle reading only (not HD viewing)

**Visual Quality:**
```
Original:    ████████████████████ 100%
Compress:    ███████████████░░░░░  80%
Difference:  Noticeable di layar besar
```

---

## 🎯 My Recommendation for You

### **Untuk Anime Collection:**

```bash
# Step 1: Convert semua anime dengan balanced mode
node scripts/batch-convert.js "D:/Anime/**/*.mkv" --mode balanced --output "D:/Anime-Converted/"

# Step 2: Upload hasil convert ke LinguaStream
# (via web UI: http://localhost:3000/library)
```

**Why Balanced?**
- ✅ Quality masih sangat bagus untuk subtitle reading
- ✅ File ~30% lebih kecil → upload lebih cepat
- ✅ Save bandwidth & storage
- ✅ Perfect balance!

---

## 📏 Resolution Guide

### **For Anime (<2GB source):**

```bash
# Keep 1080p (recommended for anime):
node scripts/convert-video.js anime.mkv --mode balanced --quality 1080p

# Downscale to 720p (if needed):
node scripts/convert-video.js anime.mkv --mode balanced --quality 720p
```

| Resolution | File Size* | Quality | Subtitle Reading | Recommended |
|------------|-----------|---------|------------------|-------------|
| **1080p** | 1.0GB | Excellent | Perfect | ⭐⭐⭐⭐⭐ |
| **720p** | 500MB | Good | Perfect | ⭐⭐⭐⭐ |
| **480p** | 250MB | OK | OK | ⭐⭐⭐ |

*For 24-minute anime episode, balanced mode

---

## 🚀 Batch Conversion Examples

### **Convert Anime Series:**

```bash
# All episodes in a folder:
node scripts/batch-convert.js "./Anime/*.mkv" --mode balanced

# Specific pattern:
node scripts/batch-convert.js "./Anime/Episode*.mkv" --mode balanced

# Recursive (all subfolders):
node scripts/batch-convert.js "./Anime/**/*.mkv" --mode balanced

# Multiple formats:
node scripts/batch-convert.js "./Videos/*.{mkv,avi,mov}" --mode balanced
```

### **Advanced Options:**

```bash
# Convert 3 files at once (faster, more CPU):
node scripts/batch-convert.js "*.mkv" --parallel 3

# Save to different folder:
node scripts/batch-convert.js "*.mkv" --output ./converted/

# Delete source after conversion (CAREFUL!):
node scripts/batch-convert.js "*.mkv" --delete-source

# Compress all to 720p:
node scripts/batch-convert.js "*.mkv" --mode compress --quality 720p
```

---

## 💾 Storage Savings Calculator

### **Example: 50 Anime Episodes**

| Mode | Per Episode | Total 50 Episodes | Savings |
|------|-------------|-------------------|----------|
| Original MKV | 1.5GB | 75GB | - |
| **Fast** | 1.5GB | 75GB | 0GB |
| **Balanced** | 1.0GB | 50GB | **25GB** ✅ |
| **Compress 1080p** | 700MB | 35GB | **40GB** |
| **Compress 720p** | 500MB | 25GB | **50GB** |

---

## ⚡ Speed Comparison

### **For 1.5GB Anime Episode:**

| Mode | Conversion Time | Upload Time* | Total Time |
|------|----------------|--------------|------------|
| **Fast** | 1 min | 40 min | 41 min |
| **Balanced** | 15 min | 27 min | **42 min** |
| **Compress** | 30 min | 13 min | 43 min |

*Based on 5 Mbps upload speed

**Insight:** All modes take similar total time, but **balanced gives best quality/size ratio!**

---

## 🎓 Best Practices

### **1. Test First**
```bash
# Convert 1 episode first:
node scripts/convert-video.js anime-ep01.mkv --mode balanced

# Watch it, check quality
# If satisfied, batch convert all
```

### **2. Backup Important Files**
```bash
# Never use --delete-source on originals!
# Keep source until you verify quality
```

### **3. Use Right Mode**
```bash
# Anime/Learning: balanced
# Movies/High quality: fast
# Slow internet: compress
```

### **4. Organize Output**
```bash
# Separate converted files:
node scripts/batch-convert.js "*.mkv" --output ./converted/

# Keep folder structure
```

---

## 🐛 Troubleshooting

### **Error: FFmpeg not found**
```bash
# Install FFmpeg:
# Windows:
winget install ffmpeg

# Or download from: https://www.gyan.dev/ffmpeg/builds/
# Add to PATH

# Test:
ffmpeg -version
```

### **Error: File too large**
```bash
# Use compress mode:
node scripts/convert-video.js large.mkv --mode compress --quality 720p
```

### **Error: Conversion too slow**
```bash
# Use faster preset:
node scripts/convert-video.js video.mkv --mode fast

# Or reduce parallel:
node scripts/batch-convert.js "*.mkv" --parallel 1
```

### **Quality not good enough**
```bash
# Use fast mode (0% loss):
node scripts/convert-video.js video.mkv --mode fast

# Or balanced with 1080p:
node scripts/convert-video.js video.mkv --mode balanced --quality 1080p
```

---

## 📊 Quality Comparison Images

### **Balanced Mode (CRF 23):**
```
Original:     Sharp, detailed, 1.5GB
Balanced:     Sharp, detailed, 1.0GB  ← Can't tell the difference!
Compress:     Slightly soft, 500MB   ← Noticeable if you look closely
```

### **For Subtitle Reading:**
```
✅ Fast:      Perfect text clarity
✅ Balanced:  Perfect text clarity  ← RECOMMENDED
✅ Compress:  Perfect text clarity (720p+)
⚠️ Compress:  OK text clarity (480p)
```

---

## 🎯 Final Recommendation

### **Untuk Koleksi Anime Anda:**

```bash
# 1. Convert dengan balanced mode:
node scripts/batch-convert.js "D:/Anime/**/*.mkv" \
  --mode balanced \
  --quality 1080p \
  --output "D:/Anime-MP4/" \
  --parallel 2

# 2. Verify beberapa file
# 3. Jika puas, delete original (optional)
# 4. Upload semua ke LinguaStream!
```

**Result:**
- ✅ Quality: Excellent (95% of original)
- ✅ Size: 30% lebih kecil
- ✅ Perfect untuk learning
- ✅ Upload lebih cepat
- ✅ Save storage

---

## 🆘 Need Help?

Lihat [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) untuk masalah umum.

---

**Happy Converting! 🎬**
