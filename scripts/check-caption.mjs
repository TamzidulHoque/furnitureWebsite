// The caption must name the picture that is actually on screen.
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2600);
for (let i = 0; i < 4; i++) {
  const r = await page.evaluate(() => ({
    src: document.querySelector('.hs-base img').getAttribute('src').split('/').pop(),
    cap: document.querySelector('.hero-caption').textContent,
    dot: [...document.querySelectorAll('.hs-dot')].findIndex((d) => d.classList.contains('active')),
  }));
  console.log(`dot ${r.dot}  ${r.src.padEnd(26)} ${r.cap}`);
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('.hs-dot')];
    d[(d.findIndex((x) => x.classList.contains('active')) + 1) % d.length].click();
  });
  await page.waitForTimeout(1600);
}
await browser.close();
