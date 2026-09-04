import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  const el = document.querySelector('#collections');
  go(el.getBoundingClientRect().top + window.scrollY - 10);
});
await page.waitForTimeout(1800);
await page.screenshot({ path: 'shots/plan-mobile.png', animations: 'allow' });
await browser.close();
console.log('done');
