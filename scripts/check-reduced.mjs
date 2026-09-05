import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
await p.evaluate(async () => {
  const g = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { g(y); await new Promise(r => setTimeout(r, 45)); }
  g(0);
});
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => ({
  wash: getComputedStyle(document.querySelector('.bsp-wash')).display,
  ledgerRowsVisible: [...document.querySelectorAll('.ledger-row')].filter(r => +getComputedStyle(r.querySelector('.ledger-copy')).opacity > 0.9).length,
  headingWords: [...document.querySelectorAll('.ledger-sticky .wm-in')].filter(w => getComputedStyle(w).transform === 'none' || getComputedStyle(w).transform.endsWith(', 0)')).length,
  finderVisible: getComputedStyle(document.querySelector('#finder')).opacity,
  pieces: document.querySelectorAll('.wall .pc').length,
  videoControls: document.querySelector('.proof-video video').controls,
  videoPaused: document.querySelector('.proof-video video').paused,
}))));
await b.close();
