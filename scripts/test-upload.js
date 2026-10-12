// Test script untuk upload video ke berbagai provider
// Usage: node scripts/test-upload.js <provider> <video-path>

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const PROVIDERS = {
  telegram: testTelegram,
  github: testGitHub,
  'internet-archive': testInternetArchive,
};

async function testTelegram(filePath) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('❌ Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
  }

  console.log('📱 Testing Telegram upload...');
  console.log(`   Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
  console.log(`   Chat ID: ${CHAT_ID}`);

  // Test bot connection
  const botRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const botData = await botRes.json();

  if (!botData.ok) {
    throw new Error('❌ Invalid bot token');
  }

  console.log(`   ✅ Bot connected: @${botData.result.username}`);

  // Upload video
  const FormData = require('form-data');
  const form = new FormData();
  form.append('chat_id', CHAT_ID);
  form.append('video', fs.createReadStream(filePath));
  form.append('supports_streaming', 'true');

  console.log('   📤 Uploading video...');
  const uploadRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
    {
      method: 'POST',
      body: form,
    }
  );

  const uploadData = await uploadRes.json();

  if (!uploadData.ok) {
    throw new Error(`❌ Upload failed: ${uploadData.description}`);
  }

  const fileId = uploadData.result.video.file_id;
  console.log(`   ✅ Upload successful!`);
  console.log(`   File ID: ${fileId}`);

  // Get file URL
  const fileRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
  );
  const fileData = await fileRes.json();

  if (fileData.ok) {
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    console.log(`   📺 Video URL: ${url.substring(0, 60)}...`);
  }

  return true;
}

async function testGitHub(filePath) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error('❌ GitHub not configured. Set GITHUB_TOKEN and GITHUB_REPO');
  }

  console.log('🐙 Testing GitHub upload...');
  console.log(`   Token: ${GITHUB_TOKEN.substring(0, 10)}...`);
  console.log(`   Repo: ${GITHUB_REPO}`);

  // Test GitHub connection
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  if (!userRes.ok) {
    throw new Error('❌ Invalid GitHub token');
  }

  const userData = await userRes.json();
  console.log(`   ✅ Authenticated as: ${userData.login}`);

  // Create release
  const tagName = `video-${Date.now()}`;
  const fileName = path.basename(filePath);

  console.log('   📦 Creating release...');
  const releaseRes = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/releases`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag_name: tagName,
        name: fileName,
        body: `Test upload: ${fileName}`,
        draft: false,
      }),
    }
  );

  if (!releaseRes.ok) {
    const error = await releaseRes.json();
    throw new Error(`❌ Release creation failed: ${error.message}`);
  }

  const release = await releaseRes.json();
  console.log(`   ✅ Release created: ${tagName}`);

  // Upload asset
  console.log('   📤 Uploading video...');
  const uploadUrl = release.upload_url.replace(
    '{?name,label}',
    `?name=${encodeURIComponent(fileName)}`
  );

  const buffer = fs.readFileSync(filePath);
  const assetRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer,
  });

  if (!assetRes.ok) {
    throw new Error('❌ Asset upload failed');
  }

  const asset = await assetRes.json();
  console.log(`   ✅ Upload successful!`);
  console.log(`   📺 Video URL: ${asset.browser_download_url}`);

  return true;
}

async function testInternetArchive(filePath) {
  const ACCESS_KEY = process.env.INTERNET_ARCHIVE_ACCESS_KEY;
  const SECRET_KEY = process.env.INTERNET_ARCHIVE_SECRET_KEY;

  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error(
      '❌ Internet Archive not configured. Set INTERNET_ARCHIVE_ACCESS_KEY and INTERNET_ARCHIVE_SECRET_KEY'
    );
  }

  console.log('📚 Testing Internet Archive upload...');
  console.log(`   Access Key: ${ACCESS_KEY.substring(0, 10)}...`);

  const identifier = `linguastream-test-${Date.now()}`;
  const fileName = path.basename(filePath);
  const url = `https://s3.us.archive.org/${identifier}/${fileName}`;

  console.log('   📤 Uploading video...');
  const buffer = fs.readFileSync(filePath);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'x-archive-auto-make-bucket': '1',
      'x-archive-meta-mediatype': 'movies',
      'x-archive-meta-title': fileName,
      'x-archive-meta-collection': 'opensource_movies',
      Authorization: `LOW ${ACCESS_KEY}:${SECRET_KEY}`,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`❌ Upload failed: ${response.statusText}`);
  }

  console.log(`   ✅ Upload successful!`);
  console.log(`   📺 Video URL: https://archive.org/download/${identifier}/${fileName}`);
  console.log(`   🌐 Archive page: https://archive.org/details/${identifier}`);

  return true;
}

async function main() {
  const provider = process.argv[2];
  const filePath = process.argv[3];

  if (!provider || !filePath) {
    console.log('Usage: node scripts/test-upload.js <provider> <video-path>');
    console.log('\nAvailable providers:');
    console.log('  - telegram');
    console.log('  - github');
    console.log('  - internet-archive');
    console.log('\nExample:');
    console.log('  node scripts/test-upload.js telegram ./test-video.mp4');
    process.exit(1);
  }

  if (!PROVIDERS[provider]) {
    console.error(`❌ Unknown provider: ${provider}`);
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const stats = fs.statSync(filePath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log('\n🎬 LinguaStream Upload Test\n');
  console.log(`Provider: ${provider}`);
  console.log(`File: ${path.basename(filePath)}`);
  console.log(`Size: ${fileSizeMB} MB\n`);

  try {
    await PROVIDERS[provider](filePath);
    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

main();
