/**
 * Puppeteer screenshot generator for Realm's Keep
 * Generates screenshots of pages after build for social media/previews
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const OUTPUT_DIR = path.join(process.cwd(), 'screenshots');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  { path: '/', name: 'homepage', width: 1920, height: 1080 },
  { path: '/lore', name: 'lore-index', width: 1920, height: 1080 },
  { path: '/shop', name: 'shop', width: 1920, height: 1080 },
  { path: '/faq', name: 'faq', width: 1920, height: 1080 },
];

async function takeScreenshot(page, url, name, width, height) {
  console.log(`📸 Capturing ${name}...`);
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait a bit for any animations/transitions
  await page.waitForTimeout(2000);
  
  const filepath = path.join(OUTPUT_DIR, `${name}-${width}x${height}.png`);
  await page.screenshot({
    path: filepath,
    width,
    height,
    fullPage: false,
  });
  
  console.log(`✅ Saved: ${filepath}`);
}

async function main() {
  console.log('🚀 Starting screenshot generation...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    for (const pageConfig of pages) {
      const url = `${BASE_URL}${pageConfig.path}`;
      await takeScreenshot(
        page,
        url,
        pageConfig.name,
        pageConfig.width,
        pageConfig.height
      );
    }
    
    console.log('✨ Screenshot generation complete!');
  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
