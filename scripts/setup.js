#!/usr/bin/env node

// Interactive setup script untuk LinguaStream
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function printHeader() {
  console.clear();
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎬 LinguaStream Setup - 100% Free Hosting');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function printStep(step, total, message) {
  console.log(`\n[${step}/${total}] ${message}`);
}

function printSuccess(message) {
  console.log(`   ✅ ${message}`);
}

function printWarning(message) {
  console.log(`   ⚠️  ${message}`);
}

function printInfo(message) {
  console.log(`   ℹ️  ${message}`);
}

async function setupDatabase() {
  printStep(1, 5, 'Database Setup');
  
  const useLocal = await question('   Use local SQLite? (Y/n): ');
  
  if (useLocal.toLowerCase() === 'n') {
    printInfo('Using Turso (LibSQL)');
    const dbUrl = await question('   Enter DATABASE_URL: ');
    return { DATABASE_URL: dbUrl };
  } else {
    printSuccess('Using local SQLite');
    return { DATABASE_URL: 'file:./dev.db' };
  }
}

async function setupTelegram() {
  printStep(2, 5, 'Telegram Bot Setup (Recommended)');
  
  const useTelegram = await question('   Setup Telegram Bot? (Y/n): ');
  
  if (useTelegram.toLowerCase() === 'n') {
    printWarning('Skipping Telegram setup');
    return {};
  }
  
  console.log('\n   📱 How to get credentials:');
  console.log('   1. Chat with @BotFather on Telegram');
  console.log('   2. Send /newbot and follow instructions');
  console.log('   3. Copy the bot token');
  console.log('   4. Create a private channel');
  console.log('   5. Add your bot as admin');
  console.log('   6. Post a message, forward to @userinfobot');
  console.log('   7. Copy the chat_id (starts with -100)\n');
  
  const botToken = await question('   Enter Bot Token: ');
  const chatId = await question('   Enter Chat ID: ');
  
  if (!botToken || !chatId) {
    printWarning('Incomplete credentials, skipping');
    return {};
  }
  
  // Test connection
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json();
    
    if (data.ok) {
      printSuccess(`Connected as @${data.result.username}`);
      return {
        TELEGRAM_BOT_TOKEN: botToken,
        TELEGRAM_CHAT_ID: chatId,
      };
    } else {
      printWarning('Invalid bot token');
      return {};
    }
  } catch (error) {
    printWarning('Could not verify bot token');
    return {
      TELEGRAM_BOT_TOKEN: botToken,
      TELEGRAM_CHAT_ID: chatId,
    };
  }
}

async function setupGitHub() {
  printStep(3, 5, 'GitHub Releases Setup (Optional)');
  
  const useGitHub = await question('   Setup GitHub? (y/N): ');
  
  if (useGitHub.toLowerCase() !== 'y') {
    printInfo('Skipping GitHub setup');
    return {};
  }
  
  console.log('\n   🐙 How to get credentials:');
  console.log('   1. Create a new private repository');
  console.log('   2. Go to Settings → Developer settings');
  console.log('   3. Personal access tokens → Generate new');
  console.log('   4. Select scope: repo (full control)');
  console.log('   5. Copy the token\n');
  
  const token = await question('   Enter GitHub Token: ');
  const repo = await question('   Enter Repo (user/repo-name): ');
  
  if (!token || !repo) {
    printWarning('Incomplete credentials, skipping');
    return {};
  }
  
  // Test connection
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    
    if (data.login) {
      printSuccess(`Authenticated as ${data.login}`);
      return {
        GITHUB_TOKEN: token,
        GITHUB_REPO: repo,
      };
    } else {
      printWarning('Invalid token');
      return {};
    }
  } catch (error) {
    printWarning('Could not verify token');
    return {
      GITHUB_TOKEN: token,
      GITHUB_REPO: repo,
    };
  }
}

async function setupInternetArchive() {
  printStep(4, 5, 'Internet Archive Setup (Optional)');
  
  const useIA = await question('   Setup Internet Archive? (y/N): ');
  
  if (useIA.toLowerCase() !== 'y') {
    printInfo('Skipping Internet Archive setup');
    return {};
  }
  
  console.log('\n   📚 How to get credentials:');
  console.log('   1. Create account at archive.org');
  console.log('   2. Visit https://archive.org/account/s3.php');
  console.log('   3. Generate API keys\n');
  
  const accessKey = await question('   Enter Access Key: ');
  const secretKey = await question('   Enter Secret Key: ');
  
  if (!accessKey || !secretKey) {
    printWarning('Incomplete credentials, skipping');
    return {};
  }
  
  printSuccess('Internet Archive configured');
  return {
    INTERNET_ARCHIVE_ACCESS_KEY: accessKey,
    INTERNET_ARCHIVE_SECRET_KEY: secretKey,
  };
}

function writeEnvFile(config) {
  printStep(5, 5, 'Writing .env file');
  
  const envPath = path.join(__dirname, '..', '.env');
  let content = '# LinguaStream Environment Variables\n';
  content += '# Generated by setup script\n\n';
  
  content += '# Database\n';
  content += `DATABASE_URL="${config.DATABASE_URL}"\n\n`;
  
  if (config.TELEGRAM_BOT_TOKEN) {
    content += '# Telegram Bot\n';
    content += `TELEGRAM_BOT_TOKEN="${config.TELEGRAM_BOT_TOKEN}"\n`;
    content += `TELEGRAM_CHAT_ID="${config.TELEGRAM_CHAT_ID}"\n\n`;
  }
  
  if (config.GITHUB_TOKEN) {
    content += '# GitHub Releases\n';
    content += `GITHUB_TOKEN="${config.GITHUB_TOKEN}"\n`;
    content += `GITHUB_REPO="${config.GITHUB_REPO}"\n\n`;
  }
  
  if (config.INTERNET_ARCHIVE_ACCESS_KEY) {
    content += '# Internet Archive\n';
    content += `INTERNET_ARCHIVE_ACCESS_KEY="${config.INTERNET_ARCHIVE_ACCESS_KEY}"\n`;
    content += `INTERNET_ARCHIVE_SECRET_KEY="${config.INTERNET_ARCHIVE_SECRET_KEY}"\n\n`;
  }
  
  fs.writeFileSync(envPath, content);
  printSuccess('.env file created');
}

function printSummary(config) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Setup Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📊 Configuration Summary:\n');
  console.log(`   Database: ${config.DATABASE_URL}`);
  
  const providers = [];
  if (config.TELEGRAM_BOT_TOKEN) providers.push('Telegram');
  if (config.GITHUB_TOKEN) providers.push('GitHub');
  if (config.INTERNET_ARCHIVE_ACCESS_KEY) providers.push('Internet Archive');
  
  console.log(`   Video Providers: ${providers.join(', ') || 'None'}`);
  
  console.log('\n🚀 Next Steps:\n');
  console.log('   1. Install dependencies:');
  console.log('      npm install\n');
  console.log('   2. Setup database:');
  console.log('      npx prisma generate');
  console.log('      npx prisma db push\n');
  console.log('   3. Start development server:');
  console.log('      npm run dev\n');
  console.log('   4. Open http://localhost:3000\n');
  
  if (providers.length === 0) {
    console.log('⚠️  No video providers configured!');
    console.log('   You can add them later in .env file');
    console.log('   See SETUP_FREE_HOSTING.md for details\n');
  }
  
  console.log('📖 Documentation:');
  console.log('   - README.md - Main documentation');
  console.log('   - SETUP_FREE_HOSTING.md - Detailed provider setup');
  console.log('   - TROUBLESHOOTING.md - Common issues\n');
}

async function main() {
  printHeader();
  
  console.log('This script will help you setup LinguaStream.');
  console.log('You can always edit .env file later.\n');
  
  const proceed = await question('Continue? (Y/n): ');
  if (proceed.toLowerCase() === 'n') {
    console.log('\nSetup cancelled.');
    rl.close();
    return;
  }
  
  const config = {};
  
  // Step 1: Database
  Object.assign(config, await setupDatabase());
  
  // Step 2: Telegram
  Object.assign(config, await setupTelegram());
  
  // Step 3: GitHub
  Object.assign(config, await setupGitHub());
  
  // Step 4: Internet Archive
  Object.assign(config, await setupInternetArchive());
  
  // Step 5: Write .env
  writeEnvFile(config);
  
  // Summary
  printSummary(config);
  
  rl.close();
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
