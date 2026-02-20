/**
 * Puppeteer page validation script
 * Checks that pages load correctly and have expected content
 */

const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

const pages = [
  {
    path: '/',
    checks: [
      { selector: 'h1', text: 'Equip Your Stronghold' },
      { selector: '.testimonials-section', exists: true },
      { selector: '.hero', exists: true },
    ],
  },
  {
    path: '/lore',
    checks: [
      { selector: 'h2', text: 'The Lore' },
    ],
  },
  {
    path: '/shop',
    checks: [
      { selector: 'h2', text: 'Shop' },
    ],
  },
  {
    path: '/faq',
    checks: [
      { selector: 'h1', text: 'FAQ' },
    ],
  },
];

async function testPage(page, url, checks) {
  console.log(`\n🔍 Testing: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      if (check.exists !== undefined) {
        const element = await page.$(check.selector);
        if (check.exists && element) {
          console.log(`  ✅ ${check.selector} exists`);
          passed++;
        } else if (!check.exists && !element) {
          console.log(`  ✅ ${check.selector} does not exist`);
          passed++;
        } else {
          console.log(`  ❌ ${check.selector} existence check failed`);
          failed++;
        }
      } else if (check.text) {
        const text = await page.$eval(check.selector, (el) => el.textContent);
        if (text.includes(check.text)) {
          console.log(`  ✅ Found text "${check.text}" in ${check.selector}`);
          passed++;
        } else {
          console.log(`  ❌ Expected "${check.text}" in ${check.selector}, got "${text}"`);
          failed++;
        }
      }
    }
    
    return { passed, failed };
  } catch (error) {
    console.error(`  ❌ Error loading page: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

async function main() {
  console.log('🧪 Starting page validation tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const pageConfig of pages) {
      const url = `${BASE_URL}${pageConfig.path}`;
      const result = await testPage(page, url, pageConfig.checks);
      totalPassed += result.passed;
      totalFailed += result.failed;
    }
    
    console.log(`\n📊 Results: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalFailed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
