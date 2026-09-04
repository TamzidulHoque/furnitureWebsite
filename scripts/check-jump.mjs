// A room hotspot and the Finder must both land on the right room of the plan.
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(`EXCEPTION ${e.message}`));
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const sweep = () => page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
});
await sweep();

// classic hotspot 2 is the centre table -> living
await page.evaluate(() => {
  const el = document.querySelector('#room');
  const y = el.getBoundingClientRect().top + window.scrollY - 90;
  window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
});
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelectorAll('.str-dot')[1].click());
await page.waitForTimeout(1800);
let r = await page.evaluate(() => ({
  panel: document.querySelector('.plan-now-k').textContent,
  n: document.querySelectorAll('.pc').length,
}));
console.log('hotspot "Gilded Centre Table" ->', r.panel, `(${r.n} pieces)`);

// finder: living room + classic
await page.evaluate(() => {
  const el = document.querySelector('#finder');
  const y = el.getBoundingClientRect().top + window.scrollY - 90;
  window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y);
});
await page.waitForTimeout(700);
await page.evaluate(() => document.querySelectorAll('.opt')[1].click());   // A living room
await page.waitForTimeout(900);
await page.evaluate(() => document.querySelectorAll('.opt')[0].click());   // Ornate & carved
await page.waitForTimeout(2600);
const link = await page.evaluate(() => [...document.querySelectorAll('#finder .linkish')][0].textContent);
await page.evaluate(() => [...document.querySelectorAll('#finder .linkish')][0].click());
await page.waitForTimeout(2000);
r = await page.evaluate(() => ({
  panel: document.querySelector('.plan-now-k').textContent,
  n: document.querySelectorAll('.pc').length,
}));
console.log(`finder "${link.trim()}" ->`, r.panel, `(${r.n} pieces)`);
console.log(errs.length ? errs.join('\n') : 'no page errors');
await browser.close();
