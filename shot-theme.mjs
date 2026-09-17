import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle', timeout: 20000 });
await page.getByPlaceholder(/user id/i).fill('1278544551');
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(3000);
await page.screenshot({ path: '/Users/si/Documents/wo-/theme-check.png' });
await browser.close();
