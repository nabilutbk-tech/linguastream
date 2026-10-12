#!/usr/bin/env node

// Video converter dengan 3 mode: fast, balanced, compress
// Optimized untuk anime & language learning videos

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const config = {
    input: args[0],
    mode: 'balanced', // default untuk anime
    quality: '1080p',
    output: null,
    deleteSource: false,
  };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--mode' && args[i + 1]) {
      config.mode = args[i + 1];
      i++;
    } else if (args[i] === '--quality' && args[i + 1]) {
      config.quality = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      config.output = args[i + 1];
      i++;
    } else if (args[i] === '--delete-source') {
      config.deleteSource = true;
    }
  }

  return config;
}

function printUsage() {
  console.log(`
${colors.bright}🎬 LinguaStream Video Converter${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node convert-video.js <input> [options]

${colors.cyan}Options:${colors.reset}
  --mode <mode>         Conversion mode: fast, balanced, compress
                        Default: balanced (recommended for anime)
  
  --quality <quality>   Output quality: 1080p, 720p, 480p
                        Default: 1080p
  
  --output <file>       Output filename
                        Default: same name with .mp4 extension
  
  --delete-source       Delete source file after successful conversion

${colors.cyan}Modes Explained:${colors.reset}
  ${colors.green}fast${colors.reset}       - No re-encoding (0% quality loss, same size)
              Best for: MKV with H.264 codec
              Speed: ⚡⚡⚡ Super fast
  
  ${colors.yellow}balanced${colors.reset}   - Re-encode with CRF 23 (5-10% quality loss)
              Best for: Anime, learning videos (RECOMMENDED)
              Speed: ⚡⚡ Moderate
              Size: ~30% smaller
  
  ${colors.blue}compress${colors.reset}   - Heavy compression (15-25% quality loss)
              Best for: Slow internet, storage limited
              Speed: ⚡ Slow
              Size: ~50% smaller

${colors.cyan}Examples:${colors.reset}
  # Fast copy (MKV → MP4, no quality loss):
  node convert-video.js anime.mkv --mode fast

  # Balanced conversion (recommended for anime):
  node convert-video.js anime.mkv --mode balanced

  # Compress to 720p (save storage):
  node convert-video.js anime.mov --mode compress --quality 720p

  # Custom output name:
  node convert-video.js input.avi --output my-video.mp4

  # Delete source after conversion:
  node convert-video.js old.mkv --mode balanced --delete-source
`);
}

function getConversionCommand(config) {
  const { input, mode, quality, output } = config;
  
  const commands = {
    fast: [
      '-i', input,
      '-c', 'copy',
      '-movflags', '+faststart', // Optimize for streaming
      output
    ],
    
    balanced: [
      '-i', input,
      '-vcodec', 'libx264',
      '-crf', '23', // High quality
      '-preset', 'medium',
      '-vf', `scale=${getResolution(quality)}`,
      '-acodec', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      output
    ],
    
    compress: [
      '-i', input,
      '-vcodec', 'libx264',
      '-crf', '28', // More compression
      '-preset', 'fast',
      '-vf', `scale=${getResolution(quality)}`,
      '-acodec', 'aac',
      '-b:a', '96k',
      '-movflags', '+faststart',
      output
    ]
  };

  return commands[mode] || commands.balanced;
}

function getResolution(quality) {
  const resolutions = {
    '1080p': '-1:1080',
    '720p': '-1:720',
    '480p': '-1:480',
  };
  return resolutions[quality] || resolutions['1080p'];
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

async function convertVideo(config) {
  const { input, output, mode, deleteSource } = config;

  // Validate input
  if (!fs.existsSync(input)) {
    log(`❌ Error: File not found: ${input}`, 'red');
    process.exit(1);
  }

  // Get file info
  const stats = fs.statSync(input);
  const inputSize = stats.size;
  const inputSizeMB = (inputSize / 1024 / 1024).toFixed(2);

  // Print header
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  🎬 Video Conversion Started', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  log(`📂 Input:  ${path.basename(input)}`, 'blue');
  log(`📦 Size:   ${inputSizeMB} MB`, 'blue');
  log(`🎯 Mode:   ${mode}`, 'yellow');
  log(`📝 Output: ${path.basename(output)}\n`, 'green');

  // Get FFmpeg command
  const ffmpegArgs = getConversionCommand(config);

  // Show quality info
  const qualityInfo = {
    fast: '⚡⚡⚡ Super Fast | 0% Quality Loss | Same Size',
    balanced: '⚡⚡ Moderate | 5-10% Loss | 30% Smaller',
    compress: '⚡ Slow | 15-25% Loss | 50% Smaller',
  };
  log(`ℹ️  ${qualityInfo[mode] || qualityInfo.balanced}\n`, 'cyan');

  // Start conversion
  const startTime = Date.now();
  let lastProgress = 0;

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y', '-progress', 'pipe:1', ...ffmpegArgs]);

    let duration = 0;
    let currentTime = 0;

    ffmpeg.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Parse duration
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
      if (durationMatch) {
        const [, h, m, s] = durationMatch;
        duration = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
      }

      // Parse progress
      const timeMatch = output.match(/out_time_ms=(\d+)/);
      if (timeMatch && duration > 0) {
        currentTime = parseInt(timeMatch[1]) / 1000000;
        const progress = Math.min((currentTime / duration) * 100, 100);
        
        if (progress - lastProgress >= 5 || progress >= 100) {
          const elapsed = (Date.now() - startTime) / 1000;
          const eta = progress > 0 ? (elapsed / progress) * (100 - progress) : 0;
          
          process.stdout.write(
            `\r🔄 Progress: ${progress.toFixed(1)}% | ` +
            `Elapsed: ${formatTime(elapsed)} | ` +
            `ETA: ${formatTime(eta)}   `
          );
          lastProgress = progress;
        }
      }
    });

    ffmpeg.stderr.on('data', (data) => {
      // FFmpeg outputs to stderr, parse it for duration
      const output = data.toString();
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
      if (durationMatch && duration === 0) {
        const [, h, m, s] = durationMatch;
        duration = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
      }
    });

    ffmpeg.on('close', (code) => {
      console.log(''); // New line after progress

      if (code === 0) {
        const outputStats = fs.statSync(output);
        const outputSize = outputStats.size;
        const outputSizeMB = (outputSize / 1024 / 1024).toFixed(2);
        const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;

        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        log('  ✅ Conversion Complete!', 'green');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

        log(`📊 Results:`, 'bright');
        log(`   Input:  ${inputSizeMB} MB`, 'blue');
        log(`   Output: ${outputSizeMB} MB`, 'green');
        log(`   Saved:  ${savings}% (${(inputSizeMB - outputSizeMB).toFixed(2)} MB)`, 'yellow');
        log(`   Time:   ${formatTime(elapsed)}\n`, 'cyan');

        log(`📁 Output file: ${output}\n`, 'green');

        // Delete source if requested
        if (deleteSource) {
          fs.unlinkSync(input);
          log(`🗑️  Deleted source file: ${input}\n`, 'yellow');
        }

        log(`🎯 Next step: Upload to LinguaStream!`, 'bright');
        log(`   npm run dev → http://localhost:3000/library\n`, 'cyan');

        resolve();
      } else {
        log('\n❌ Conversion failed!', 'red');
        log('\nPossible issues:', 'yellow');
        log('  1. FFmpeg not installed or not in PATH', 'yellow');
        log('  2. Invalid input file format', 'yellow');
        log('  3. Insufficient disk space', 'yellow');
        log('\nCheck FFmpeg installation:', 'cyan');
        log('  ffmpeg -version\n', 'cyan');
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      log('\n❌ Error starting FFmpeg!', 'red');
      log(`   ${err.message}\n`, 'red');
      log('Please install FFmpeg:', 'yellow');
      log('  Windows: winget install ffmpeg', 'cyan');
      log('  Mac:     brew install ffmpeg', 'cyan');
      log('  Linux:   sudo apt install ffmpeg\n', 'cyan');
      reject(err);
    });
  });
}

async function main() {
  const config = parseArgs();

  // Set default output if not specified
  if (!config.output) {
    const ext = path.extname(config.input);
    config.output = config.input.replace(ext, '.mp4');
    
    // If output same as input (already .mp4), add suffix
    if (config.output === config.input) {
      config.output = config.input.replace('.mp4', '-converted.mp4');
    }
  }

  try {
    await convertVideo(config);
  } catch (error) {
    process.exit(1);
  }
}

main();
