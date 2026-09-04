// Frame-by-frame capture of a hero transition, plus the filter and dialog checks.
//   node scripts/shoot-fx.mjs [mode]
import { chromium } from 'playwright';
import fs from 'node:fs';

const mode = process.argv[2] ?? 'classic';
fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(`EXCEPTION ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errs.push(`CONSOLE ${m.text()}`));
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
if (mode !== 'classic') {
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), { modern: 1, noir: 2 }[mode]);
  await page.waitForTimeout(2000);
}
// trigger a change to the *next* dot, whatever the carousel is showing now
await page.evaluate(() => {
  const dots = [...document.querySelectorAll('.hs-dot')];
  const cur = dots.findIndex((d) => d.classList.contains('active'));
  dots[(cur + 1) % dots.length].click();
});
const stage = page.locator('.hero-stage');
for (let i = 0; i < 5; i++) {
  await page.waitForTimeout(i === 0 ? 150 : 190);
  await stage.screenshot({ path: `shots/fx-${mode}-${i}.png` });
}
console.log(errs.length ? errs.join('\n') : 'no errors');
await browser.close();
