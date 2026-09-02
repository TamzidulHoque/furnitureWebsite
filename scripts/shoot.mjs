// Screenshot harness: capture the page in every mode, desktop + mobile.
// Usage: node scripts/shoot.mjs [url] [--modes classic,modern,noir] [--mobile]
import { chromium } from 'playwright';
import fs from 'node:fs';

const url = process.argv[2]?.startsWith('http') ? process.argv[2] : 'http://localhost:5173';
const modesArg = process.argv.find((a) => a.startsWith('--modes='));
const MODES = modesArg ? modesArg.split('=')[1].split(',') : ['classic', 'modern', 'noir'];
const MOBILE = process.argv.includes('--mobile');

fs.mkdirSync('shots', { recursive: true });
const browser = await chromium.launch();

async function shootMode(page, mode, label) {
  // switch mode via the hero buttons (order: classic, modern, noir)
  const idx = { classic: 0, modern: 1, noir: 2 }[mode];
  await page.evaluate((i) => document.querySelectorAll('.ms-btn')[i]?.click(), idx);
  await page.waitForTimeout(1900); // wipe finishes
  // walk the page so once-only scroll reveals fire
  await page.evaluate(async () => {
    const go = (y) =>
      window.__lenis
        ? window.__lenis.scrollTo(y, { immediate: true, force: true })
        : window.scrollTo(0, y);
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      go(y);
      await new Promise((r) => setTimeout(r, 60));
    }
    go(0);
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `shots/${label}-${mode}-hero.png` });
  await page.screenshot({ path: `shots/${label}-${mode}-full.png`, fullPage: true });
  console.log(`shot: ${label}-${mode}`);
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
desktop.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await desktop.goto(url, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(2600); // hero intro
for (const m of MODES) await shootMode(desktop, m, 'desktop');
await desktop.close();

if (MOBILE) {
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await mobile.goto(url, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(2600);
  for (const m of MODES) await shootMode(mobile, m, 'mobile');
  await mobile.close();
}

await browser.close();
console.log('DONE');
