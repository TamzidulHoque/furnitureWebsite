import { chromium } from 'playwright';
const b = await chromium.launch();

// 1. a returning visitor must not see Classic first
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p0 = await ctx.newPage();
await p0.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
await p0.waitForTimeout(2200);
await p0.evaluate(() => document.querySelectorAll('.ms-btn')[2].click());
await p0.waitForTimeout(1800);
const p1 = await ctx.newPage();
const early = [];
await p1.addInitScript(() => {
  document.addEventListener('DOMContentLoaded', () => {
    window.__earlyMode = document.documentElement.dataset.mode;
  });
});
await p1.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
console.log('saved noir -> mode at DOMContentLoaded:', await p1.evaluate(() => window.__earlyMode));
await ctx.close();

// 2..n on a fresh visit
const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
const jump = async () => p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 40)); }
});
await jump();

const counts = async () => p.evaluate(() => ({
  mode: document.documentElement.dataset.mode,
  pieces: document.querySelectorAll('.wall .pc').length,
  plan: [...document.querySelectorAll('.fp-count')].map((n) => n.textContent),
  switches: document.querySelectorAll('.ms-compact .ms-btn').length,
}));
console.log('classic:', JSON.stringify(await counts()));
await p.evaluate(() => document.querySelectorAll('.ms-compact .ms-btn')[1].click());
await p.waitForTimeout(2200);
console.log('modern :', JSON.stringify(await counts()));
await p.evaluate(() => document.querySelectorAll('.ms-compact .ms-btn')[2].click());
await p.waitForTimeout(2200);
console.log('noir   :', JSON.stringify(await counts()));

// an empty room says so
await p.evaluate(() => document.querySelectorAll('.ms-compact .ms-btn')[0].click());
await p.waitForTimeout(2200);
await p.evaluate(() => document.querySelectorAll('.fp-room')[3].dispatchEvent(new MouseEvent('click', { bubbles: true })));
await p.waitForTimeout(900);
console.log('classic office:', JSON.stringify(await p.evaluate(() => ({
  pieces: document.querySelectorAll('.wall .pc').length,
  says: document.querySelector('.pc-empty')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 90),
}))));

// quick view: prev / next visible without scrolling
await p.evaluate(() => document.querySelectorAll('.fp-room')[3].dispatchEvent(new MouseEvent('click', { bubbles: true })));
await p.waitForTimeout(700);
await p.evaluate(() => document.querySelector('.pc-hit').click());
await p.waitForTimeout(900);
console.log('quick view bar:', JSON.stringify(await p.evaluate(() => {
  const bar = document.querySelector('.qv-bar');
  const r = bar.getBoundingClientRect();
  return { inView: r.top >= 0 && r.bottom <= innerHeight, top: Math.round(r.top), buttons: bar.querySelectorAll('button').length };
})));
await p.keyboard.press('Escape');
await p.waitForTimeout(500);
await b.close();
