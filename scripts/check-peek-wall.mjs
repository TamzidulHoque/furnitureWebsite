import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 50)); }
  go(document.querySelector('.plan-wrap').getBoundingClientRect().top + window.scrollY - 120);
});
await p.waitForTimeout(700);
await p.locator('.fp-room').nth(1).hover();
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => ({
  peeking: document.querySelector('.wall').classList.contains('peeking'),
  lit: document.querySelectorAll('.wall .pc.lit').length,
  dim: [...document.querySelectorAll('.wall .pc')].filter(e => +getComputedStyle(e).opacity < 0.6).length,
}))));
await p.screenshot({ path: 'shots/wall-peek.png' });
await b.close();
