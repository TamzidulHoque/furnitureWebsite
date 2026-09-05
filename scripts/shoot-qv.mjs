import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h, tag] of [[1280, 620, 'short'], [390, 780, 'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  await p.evaluate(async () => {
    const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
    for (let y = 0; y <= document.body.scrollHeight; y += 500) { g(y); await new Promise(r => setTimeout(r, 40)); }
    g(document.querySelector('#collections').getBoundingClientRect().top + window.scrollY);
  });
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.pc-hit').click());
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `shots/qv-${tag}.png` });
  console.log(tag, JSON.stringify(await p.evaluate(() => {
    const bar = document.querySelector('.qv-bar').getBoundingClientRect();
    const card = document.querySelector('.qv-card');
    return {
      barVisible: bar.top >= 0 && bar.bottom <= innerHeight,
      scrollable: card.scrollHeight > card.clientHeight,
      ctaNeedsScroll: document.querySelector('.config-cta').getBoundingClientRect().bottom > innerHeight,
    };
  })));
  await p.close();
}
await b.close();
