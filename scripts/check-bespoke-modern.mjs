import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
await p.evaluate(() => document.querySelectorAll('.ms-btn')[1].click());   // modern
await p.waitForTimeout(2200);
await p.evaluate(async () => {
  const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 400) { g(y); await new Promise(r => setTimeout(r, 45)); }
});
await p.waitForTimeout(600);
for (const [i, off] of [-820, -520, -240, -60].entries()) {
  await p.evaluate((o) => {
    const t = document.querySelector('#bespoke').getBoundingClientRect().top + window.scrollY;
    window.__lenis.scrollTo(t + o, { immediate: true, force: true });
  }, off);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `shots/bug-modern-${i}.png` });
}
console.log(JSON.stringify(await p.evaluate(() => {
  const s = getComputedStyle;
  const head = document.querySelector('.bespoke-head');
  const h2 = head.querySelector('h2');
  const wash = document.querySelector('.bsp-wash');
  const bg = document.querySelector('.bsp-bg img');
  return {
    headOpacity: s(head).opacity,
    headTransform: s(head).transform,
    h2Color: s(h2).color,
    sectionBg: s(document.querySelector('#bespoke')).backgroundColor,
    washTransform: s(wash).transform,
    washDisplay: s(wash).display,
    bgOpacity: s(bg).opacity,
    bgSrc: bg.currentSrc.split('/').pop(),
    stepsOpacity: [...document.querySelectorAll('.step')].map((e) => s(e).opacity),
  };
}, null)));
await b.close();
