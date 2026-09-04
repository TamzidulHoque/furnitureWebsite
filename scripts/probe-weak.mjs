// Tablet widths, empty state, reduced motion, image loading.
import { chromium } from 'playwright';
const browser = await chromium.launch();

for (const w of [1280, 1024, 900, 860]) {
  const p = await browser.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  await p.evaluate(async () => {
    const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
    for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 45)); }
    go(document.querySelector('.salon').getBoundingClientRect().top + window.scrollY - 60);
  });
  await p.waitForTimeout(700);
  const info = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.wall .pc')].slice(0, 6);
    const wall = document.querySelector('.wall').getBoundingClientRect();
    const plan = document.querySelector('.plan-wrap');
    return {
      wall: Math.round(wall.width),
      widths: cards.map((c) => Math.round(c.getBoundingClientRect().width)),
      planCols: getComputedStyle(plan).gridTemplateColumns,
    };
  });
  console.log(w, JSON.stringify(info));
  await p.screenshot({ path: `shots/tw-${w}.png` });
  await p.close();
}

// empty search state
const p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 45)); }
  go(document.querySelector('.plan-wrap').getBoundingClientRect().top + window.scrollY - 80);
});
await p.fill('.col-search input', 'zzzz');
await p.waitForTimeout(900);
await p.screenshot({ path: 'shots/empty-state.png' });
console.log('empty state cards:', await p.locator('.wall .pc').count());
await p.close();

// reduced motion
const r = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await r.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await r.waitForTimeout(1600);
await r.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(res => setTimeout(res, 45)); }
  go(document.querySelector('.salon').getBoundingClientRect().top + window.scrollY - 60);
});
await r.waitForTimeout(600);
console.log('reduced-motion visible pieces:', await r.evaluate(() =>
  [...document.querySelectorAll('.wall .pc')].filter(e => +getComputedStyle(e).opacity > 0.9).length));
await r.evaluate(() => document.querySelectorAll('.fp-room')[2].dispatchEvent(new MouseEvent('click', { bubbles: true })));
await r.waitForTimeout(600);
console.log('reduced-motion after picking Dining:', await r.locator('.wall .pc').count());
await r.screenshot({ path: 'shots/reduced.png' });
await r.close();
await browser.close();
