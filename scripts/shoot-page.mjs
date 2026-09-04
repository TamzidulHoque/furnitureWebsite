// Whole page, one tall image per mode, scaled down for a read-through.
import { chromium } from 'playwright';
import sharp from 'sharp';
const browser = await chromium.launch();
for (const [i, mode] of ['classic', 'modern', 'noir'].entries()) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1700);
  if (i > 0) {
    await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), i);
    await page.waitForTimeout(1900);
  }
  await page.evaluate(async () => {
    const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
    for (let y = 0; y <= document.body.scrollHeight; y += 400) { go(y); await new Promise(r => setTimeout(r, 55)); }
    go(0);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `shots/page-${mode}.png`, fullPage: true });
  await sharp(`shots/page-${mode}.png`).resize({ height: 2600, fit: 'inside' })
    .png().toFile(`shots/page-${mode}-mini.png`);
  await page.close();
}
await browser.close();
console.log('page shots done');
