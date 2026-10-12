# Changelog

All notable changes to LinguaStream will be documented in this file.

## [Unreleased] - 2026-10-09

### Added - Free Video Hosting Support 🎉

#### 🆓 Multiple Free Provider Support
- ✅ **Telegram Bot** - Unlimited storage, 2GB/file
- ✅ **GitHub Releases** - Unlimited storage, 2GB/file  
- ✅ **Internet Archive** - Unlimited storage, forever free
- ✅ **Vercel Blob** - Free tier: 1GB

#### 🎨 Enhanced Upload UI
- New `UploadModal` with provider selection
- Real-time file size display
- Upload progress indicator
- Error handling with user-friendly messages
- Provider status badges (Recommended/Optional)

#### 🔧 Core Features
- `video-upload-helpers.ts` - Upload abstraction for all providers
- `/api/videos/upload` - Unified upload endpoint
- Provider auto-detection and fallback
- Subtitle upload with video (dual subtitles supported)
- Video metadata extraction

#### 📖 Documentation
- `SETUP_FREE_HOSTING.md` - Complete setup guide for all providers
- `TROUBLESHOOTING.md` - Common issues and solutions
- `README.md` - Updated with free hosting info
- `.env.example` - Template with all provider credentials

#### 🛠️ Developer Tools
- `scripts/setup.js` - Interactive setup wizard
- `scripts/test-upload.js` - Test upload to any provider
- Environment validation
- Provider connection testing

### Changed

#### 📦 Database Schema
- Added `provider` field to Video model
- Support for multiple source types
- Enhanced metadata storage

#### 🎬 Library Page
- Updated to show provider badges
- Enhanced filtering and search
- Provider statistics display

### Fixed
- Video upload timeout issues
- CORS errors with external video sources
- Subtitle sync offset persistence
- IndexedDB cleanup on mobile

## [0.1.0] - 2024-XX-XX

### Initial Release

#### Core Features
- 🎥 HTML5 video player with custom controls
- 📝 Dual subtitle support (native + target language)
- 📚 Vocabulary extraction from subtitles
- 💾 Anki export (TSV/CSV format)
- 🎯 Interactive vocabulary quiz
- 📱 Mobile-optimized touch controls
- ⚡ 2x speed overlay (long-press)
- 🌐 Auto language detection (EN, JA, ID)
- 🎨 Customizable subtitle styling
- ⏱️ Subtitle sync offset adjustment

#### Technical Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- Prisma + LibSQL (Turso)
- IndexedDB for local storage

#### Supported Formats
- Video: MP4, WebM, OGG
- Subtitles: SRT, ASS/SSA
- Languages: English, Japanese, Indonesian

---

## Roadmap

### Version 0.2.0 (Planned)
- [ ] User authentication (NextAuth)
- [ ] Cloud sync for vocabulary
- [ ] Spaced repetition algorithm
- [ ] Progress tracking per video
- [ ] Community subtitle contributions
- [ ] Video series/playlists
- [ ] Advanced quiz modes

### Version 0.3.0 (Planned)
- [ ] AI-powered subtitle translation
- [ ] Speech recognition for pronunciation
- [ ] Real-time collaborative learning
- [ ] Mobile app (React Native)
- [ ] Chrome extension
- [ ] More language support

### Future Considerations
- [ ] YouTube integration
- [ ] Netflix subtitle extraction
- [ ] Podcast support
- [ ] Gamification (achievements, streaks)
- [ ] Social features (friends, leaderboards)
- [ ] Premium features (advanced analytics)

---

## Migration Guide

### From v0.1.0 to Current

#### 1. Update Dependencies
```bash
npm install
```

#### 2. Update Database Schema
```bash
npx prisma generate
npx prisma db push
```

#### 3. Setup Video Provider
- Choose at least one provider (Telegram recommended)
- Follow setup guide in `SETUP_FREE_HOSTING.md`
- Update `.env` with credentials

#### 4. Migrate Existing Videos (if any)
- Export video URLs from old database
- Re-upload using new upload modal
- Or manually update database with provider info

---

## Breaking Changes

None yet - this is the first major update!

---

## Contributors

- [@nabilutbk-tech](https://github.com/nabilutbk-tech) - Creator & Maintainer

---

## Support

- 📖 [Documentation](https://github.com/nabilutbk-tech/mystream/wiki)
- 🐛 [Report Issues](https://github.com/nabilutbk-tech/mystream/issues)
- 💬 [Discussions](https://github.com/nabilutbk-tech/mystream/discussions)

---

**[Unreleased]**: https://github.com/nabilutbk-tech/mystream/compare/v0.1.0...HEAD
