// Screenshot each 3D configurator preview for camera tuning.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE:', m.text().slice(0, 180)); });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2400);

const CASES = [
  { mode: 0, modeName: 'classic', pieceLabel: 'Damask Chair', out: 'shots/3d-damask.png' },
  { mode: 1, modeName: 'modern', pieceLabel: 'Lounge Chair', out: 'shots/3d-sheen.png' },
  { mode: 2, modeName: 'noir', pieceLabel: 'Leather Sofa', out: 'shots/3d-leather.png' },
];

for (const c of CASES) {
  await page.evaluate((i) => document.querySelectorAll('.ms-btn')[i]?.click(), c.mode);
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    const go = (y) => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
    for (let y = 0; y <= document.body.scrollHeight; y += 450) { go(y); await new Promise((r) => setTimeout(r, 35)); }
    const el = document.querySelector('#configurator');
    go(el.getBoundingClientRect().top + window.scrollY - 120);
  });
  await page.waitForTimeout(800);
  await page.evaluate((label) => {
    [...document.querySelectorAll('.piece-btn')].find((b) => b.textContent.includes(label))?.click();
  }, c.pieceLabel);
  await page.waitForTimeout(4500); // model load + first frames
  await page.locator('.config-canvas-wrap').screenshot({ path: c.out });
  console.log('shot', c.out);
}
await browser.close();
console.log('DONE');
