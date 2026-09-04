import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  const el = document.querySelector('#collections');
  go(el.getBoundingClientRect().top + window.scrollY - 10);
});
await page.waitForTimeout(1500);
const box = await page.locator('.fp-room').nth(1).boundingBox();   // Living
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(600);
const r = await page.evaluate(() => ({
  peeking: document.querySelector('.pc-grid').classList.contains('peeking'),
  lit: document.querySelectorAll('.pc.lit').length,
  floor: getComputedStyle(document.querySelectorAll('.fp-floor')[1]).fillOpacity,
}));
console.log('hover Living ->', JSON.stringify(r));
await page.locator('.collection').screenshot({ path: 'shots/plan-peek.png', animations: 'allow' });
await browser.close();
