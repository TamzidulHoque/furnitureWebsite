// Typing should redraw the plan: counts per room, empty rooms stepping back.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 45)); }
  go(document.querySelector('.plan-wrap').getBoundingClientRect().top + window.scrollY - 70);
});
await p.waitForTimeout(600);
const read = () => p.evaluate(() => ({
  counts: [...document.querySelectorAll('.fp-count')].map(n => n.textContent),
  empty: [...document.querySelectorAll('.fp-room')].map(n => n.classList.contains('empty')),
  cards: document.querySelectorAll('.wall .pc').length,
  panel: document.querySelector('.plan-now-n').textContent,
}));
console.log('idle  ', JSON.stringify(await read()));
for (const term of ['velvet', 'desk', 'wardrobe']) {
  await p.fill('.col-search input', term);
  await p.waitForTimeout(800);
  console.log(term.padEnd(8), JSON.stringify(await read()));
}
await p.screenshot({ path: 'shots/search-plan.png' });
await p.fill('.col-search input', '');
await p.waitForTimeout(700);
console.log('cleared', JSON.stringify(await read()));
await b.close();
