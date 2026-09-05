import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1360, height: 900 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
const printed = () => p.evaluate(() =>
  [...document.querySelectorAll('.ledger-copy')].filter((e) => +getComputedStyle(e).opacity > 0.9).length);
await p.evaluate(async () => {
  const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 300) { g(y); await new Promise(r => setTimeout(r, 45)); }
});
await p.waitForTimeout(700);
console.log('after scrolling through:', await printed(), 'of 7');
await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true, force: true }));
await p.waitForTimeout(800);
console.log('after scrolling back up:', await printed(), 'of 7');
await b.close();
