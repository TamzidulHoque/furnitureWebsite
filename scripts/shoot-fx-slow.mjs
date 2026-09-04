// Slow GSAP's global clock so a screenshot can land mid-transition.
//   node scripts/shoot-fx-slow.mjs [mode]
import { chromium } from 'playwright';
import fs from 'node:fs';

const mode = process.argv[2] ?? 'noir';
fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
if (mode !== 'classic') {
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), { modern: 1, noir: 2 }[mode]);
  await page.waitForTimeout(2200);
}
await page.evaluate(() => { window.__gsap.globalTimeline.timeScale(0.09); });
await page.evaluate(() => {
  const dots = [...document.querySelectorAll('.hs-dot')];
  const cur = dots.findIndex((d) => d.classList.contains('active'));
  dots[(cur + 1) % dots.length].click();
});
const stage = page.locator('.hero-stage');
for (let i = 0; i < 4; i++) {
  await page.waitForTimeout(i === 0 ? 900 : 2200);
  await stage.screenshot({ path: `shots/slow-${mode}-${i}.png`, animations: 'allow' });
}
await page.evaluate(() => { window.__gsap.globalTimeline.timeScale(1); });
await browser.close();
console.log('done');
