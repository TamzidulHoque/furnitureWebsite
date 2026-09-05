import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
const go = async (y) => { await p.evaluate((v) => window.__lenis.scrollTo(v, { immediate: true, force: true }), y); await p.waitForTimeout(420); };
const topOf = (sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel);

// warm the whole page so nothing reveals late
await p.evaluate(async () => {
  const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { g(y); await new Promise(r => setTimeout(r, 40)); }
});
await p.waitForTimeout(600);

// collection head with the three worlds
const col = await topOf('#collections');
await go(col - 40);
await p.screenshot({ path: 'shots/t-collection-head.png' });

// the workshop darkening: three points through the wash
const bsp = await topOf('#bespoke');
for (const [i, off] of [-820, -430, -60].entries()) {
  await go(bsp + off);
  await p.screenshot({ path: `shots/t-bespoke-${i}.png` });
}

// the finder
await go(await topOf('#finder') - 120);
await p.screenshot({ path: 'shots/t-finder.png' });

// the order slip printing
const why = await topOf('#why');
for (const [i, off] of [-260, 120].entries()) {
  await go(why + off);
  await p.screenshot({ path: `shots/t-ledger-${i}.png` });
}
await b.close();
console.log('shot');
