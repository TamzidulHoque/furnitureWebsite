import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2600);
await page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  const el = document.querySelector('#collections');
  go(el.getBoundingClientRect().top + window.scrollY - 10);
});
await page.waitForTimeout(1800);
const r = await page.evaluate(() => {
  const g = document.querySelector('.fp-glyph');
  const c = document.querySelector('.fp-count');
  const s = document.querySelector('.plan-side .col-search');
  const cs = getComputedStyle;
  return {
    glyphs: document.querySelectorAll('.fp-glyph').length,
    glyphOpacity: g && cs(g).opacity,
    glyphVis: g && cs(g).visibility,
    glyphBox: g && JSON.stringify(g.getBoundingClientRect().toJSON()),
    counts: document.querySelectorAll('.fp-count').length,
    countText: c && c.textContent,
    countOpacity: c && cs(c).opacity,
    countFill: c && cs(c).fill,
    countBox: c && JSON.stringify(c.getBoundingClientRect().toJSON()),
    searchH: s && Math.round(s.getBoundingClientRect().height),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
