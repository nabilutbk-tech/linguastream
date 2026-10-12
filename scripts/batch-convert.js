#!/usr/bin/env node

// Batch video converter untuk convert banyak video sekaligus
// Optimized untuk anime collections

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
    pattern: args[0],
    mode: 'balanced',
    quality: '1080p',
    outputDir: null,
    parallel: 2, // Convert 2 files at once
    skipExisting: true,
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
      config.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--parallel' && args[i + 1]) {
      config.parallel = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--no-skip') {
      config.skipExisting = false;
    } else if (args[i] === '--delete-source') {
      config.deleteSource = true;
    }
  }

  return config;
}

function printUsage() {
  console.log(`
${colors.bright}🎬 LinguaStream Batch Video Converter${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node batch-convert.js <pattern> [options]

${colors.cyan}Options:${colors.reset}
  --mode <mode>         Conversion mode: fast, balanced, compress
                        Default: balanced
  
  --quality <quality>   Output quality: 1080p, 720p, 480p
                        Default: 1080p
  
  --output <dir>        Output directory
                        Default: same directory as source
  
  --parallel <n>        Number of files to convert in parallel
                        Default: 2
  
  --no-skip             Re-convert existing MP4 files
  
  --delete-source       Delete source files after conversion

${colors.cyan}Examples:${colors.reset}
  # Convert all MKV files in current directory:
  node batch-convert.js "*.mkv" --mode balanced

  # Convert all videos in a folder:
  node batch-convert.js "./anime/**/*.mkv" --output ./converted/

  # Convert multiple formats:
  node batch-convert.js "./videos/*.{mkv,avi,mov}" --mode compress

  # Fast batch conversion (3 at once):
  node batch-convert.js "*.mkv" --parallel 3 --delete-source

${colors.cyan}Tips:${colors.reset}
  • Use quotes around patterns with wildcards
  • Use --parallel 1 for slow computers
  • Use --delete-source to save space (be careful!)
  • Converted files skip automatically (use --no-skip to re-convert)
`);
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
  return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

async function findFiles(pattern) {
  try {
    // Handle Windows paths
    const normalizedPattern = pattern.replace(/\\/g, '/');
    const files = await glob(normalizedPattern, { nodir: true });
    return files;
  } catch (error) {
    log(`❌ Error finding files: ${error.message}`, 'red');
    return [];
  }
}

function getOutputPath(inputPath, outputDir) {
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  
  if (outputDir) {
    // Create output directory if not exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    return path.join(outputDir, `${basename}.mp4`);
  } else {
    // Same directory as source
    const dir = path.dirname(inputPath);
    return path.join(dir, `${basename}.mp4`);
  }
}

function convertVideo(inputPath, outputPath, mode, quality) {
  return new Promise((resolve, reject) => {
    const args = ['-y', '-i', inputPath];

    // Add conversion parameters based on mode
    if (mode === 'fast') {
      args.push('-c', 'copy');
    } else if (mode === 'balanced') {
      args.push(
        '-vcodec', 'libx264',
        '-crf', '23',
        '-preset', 'medium',
        '-vf', `scale=${getResolution(quality)}`,
        '-acodec', 'aac',
        '-b:a', '128k'
      );
    } else if (mode === 'compress') {
      args.push(
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-vf', `scale=${getResolution(quality)}`,
        '-acodec', 'aac',
        '-b:a', '96k'
      );
    }

    args.push('-movflags', '+faststart', outputPath);

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let duration = 0;
    let lastProgress = '';

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Parse duration
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
      if (durationMatch && duration === 0) {
        const [, h, m, s] = durationMatch;
        duration = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
      }

      // Parse progress
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch && duration > 0) {
        const [, h, m, s] = timeMatch;
        const currentTime = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
        const progress = Math.min((currentTime / duration) * 100, 100);
        const progressStr = progress.toFixed(1);
        
        if (progressStr !== lastProgress) {
          lastProgress = progressStr;
          resolve({ progress: parseFloat(progressStr) });
        }
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(err);
    });
  });
}

function getResolution(quality) {
  const resolutions = {
    '1080p': '-1:1080',
    '720p': '-1:720',
    '480p': '-1:480',
  };
  return resolutions[quality] || resolutions['1080p'];
}

async function processFile(file, config, index, total) {
  const outputPath = getOutputPath(file, config.outputDir);
  const basename = path.basename(file);

  // Skip if output already exists
  if (config.skipExisting && fs.existsSync(outputPath)) {
    log(`[${index}/${total}] ⏭️  Skipped: ${basename} (already converted)`, 'yellow');
    return { skipped: true, input: file, output: outputPath };
  }

  log(`[${index}/${total}] 🔄 Converting: ${basename}`, 'cyan');

  const startTime = Date.now();
  const inputStats = fs.statSync(file);
  const inputSize = inputStats.size;

  try {
    await convertVideo(file, outputPath, config.mode, config.quality);

    const elapsed = (Date.now() - startTime) / 1000;
    const outputStats = fs.statSync(outputPath);
    const outputSize = outputStats.size;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    log(
      `[${index}/${total}] ✅ Done: ${basename} ` +
      `(${formatBytes(inputSize)} → ${formatBytes(outputSize)}, ` +
      `saved ${savings}%, ${formatTime(elapsed)})`,
      'green'
    );

    // Delete source if requested
    if (config.deleteSource) {
      fs.unlinkSync(file);
      log(`[${index}/${total}] 🗑️  Deleted: ${basename}`, 'yellow');
    }

    return {
      success: true,
      input: file,
      output: outputPath,
      inputSize,
      outputSize,
      time: elapsed
    };
  } catch (error) {
    log(`[${index}/${total}] ❌ Failed: ${basename} - ${error.message}`, 'red');
    return { error: true, input: file, message: error.message };
  }
}

async function processInParallel(files, config) {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i += config.parallel) {
    const batch = files.slice(i, i + config.parallel);
    const promises = batch.map((file, batchIndex) => 
      processFile(file, config, i + batchIndex + 1, total)
    );
    
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  return results;
}

function printSummary(results, startTime) {
  const totalTime = (Date.now() - startTime) / 1000;
  
  const successful = results.filter(r => r.success);
  const skipped = results.filter(r => r.skipped);
  const failed = results.filter(r => r.error);

  const totalInputSize = successful.reduce((sum, r) => sum + (r.inputSize || 0), 0);
  const totalOutputSize = successful.reduce((sum, r) => sum + (r.outputSize || 0), 0);
  const totalSavings = totalInputSize > 0 ? ((1 - totalOutputSize / totalInputSize) * 100).toFixed(1) : 0;

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  📊 Batch Conversion Summary', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  log(`Total files:      ${results.length}`, 'blue');
  log(`✅ Converted:     ${successful.length}`, 'green');
  log(`⏭️  Skipped:       ${skipped.length}`, 'yellow');
  log(`❌ Failed:        ${failed.length}`, 'red');
  log(`\n⏱️  Total time:    ${formatTime(totalTime)}`, 'cyan');
  
  if (successful.length > 0) {
    log(`\n💾 Storage:`, 'bright');
    log(`   Input:  ${formatBytes(totalInputSize)}`, 'blue');
    log(`   Output: ${formatBytes(totalOutputSize)}`, 'green');
    log(`   Saved:  ${totalSavings}% (${formatBytes(totalInputSize - totalOutputSize)})`, 'yellow');
  }

  if (failed.length > 0) {
    log(`\n❌ Failed files:`, 'red');
    failed.forEach(f => log(`   - ${path.basename(f.input)}`, 'red'));
  }

  log('\n🎯 Next step: Upload to LinguaStream!', 'bright');
  log('   npm run dev → http://localhost:3000/library\n', 'cyan');
}

async function main() {
  const config = parseArgs();

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  🎬 Batch Video Conversion Started', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  log('🔍 Finding files...', 'yellow');
  const files = await findFiles(config.pattern);

  if (files.length === 0) {
    log('❌ No files found matching pattern!', 'red');
    log(`\n   Pattern: ${config.pattern}`, 'yellow');
    log('\n   Make sure to use quotes around patterns:', 'cyan');
    log('   node batch-convert.js "*.mkv"\n', 'cyan');
    process.exit(1);
  }

  log(`✅ Found ${files.length} file(s)\n`, 'green');
  log(`⚙️  Configuration:`, 'yellow');
  log(`   Mode:     ${config.mode}`, 'blue');
  log(`   Quality:  ${config.quality}`, 'blue');
  log(`   Parallel: ${config.parallel}`, 'blue');
  log(`   Output:   ${config.outputDir || 'Same directory'}\n`, 'blue');

  const startTime = Date.now();
  const results = await processInParallel(files, config);
  
  printSummary(results, startTime);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
