import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

await page.goto('http://localhost:3001/casino-simulator', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: '/Users/si/Documents/wo-/coinflip-check.png' });
console.log('ERRORS', JSON.stringify(errors.slice(0, 15)));
await browser.close();
