// Close-up of one selector: node scripts/shoot-section.mjs "#configurator" out.png [mode] [clicks...]
import { chromium } from 'playwright';

const [selector, out = 'shots/section.png', mode = 'classic'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2400);
const idx = { classic: 0, modern: 1, noir: 2 }[mode];
if (idx > 0) {
  await page.evaluate((i) => document.querySelectorAll('.ms-btn')[i]?.click(), idx);
  await page.waitForTimeout(1900);
}
await page.evaluate(async (sel) => {
  const go = (y) => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 400) { go(y); await new Promise((r) => setTimeout(r, 50)); }
  const el = document.querySelector(sel);
  go(el.getBoundingClientRect().top + window.scrollY - 120);
}, selector);
await page.waitForTimeout(1300);
const el = page.locator(selector).first();
await el.screenshot({ path: out });
console.log('shot', out);
await browser.close();
