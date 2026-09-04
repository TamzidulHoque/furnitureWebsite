// Salon wall: full section per mode, plus a close crop and mobile.
import { chromium } from 'playwright';
const url = 'http://localhost:4173';
const browser = await chromium.launch();

for (const [i, mode] of ['classic', 'modern', 'noir'].entries()) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  if (i > 0) {
    await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), i);
    await page.waitForTimeout(1800);
  }
  await page.evaluate(async () => {
    const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
    for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 60)); }
  });
  await page.evaluate(() => {
    const el = document.querySelector('.salon');
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `shots/wall-${mode}.png` });
  await page.locator('.salon').screenshot({ path: `shots/wall-${mode}-full.png` });
  await page.close();
}

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await m.goto(url, { waitUntil: 'networkidle' });
await m.waitForTimeout(1800);
await m.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 55)); }
  const el = document.querySelector('.salon');
  go(el.getBoundingClientRect().top + window.scrollY - 40);
});
await m.waitForTimeout(900);
await m.screenshot({ path: 'shots/wall-mobile.png' });
await browser.close();
console.log('shot');
