// Verifies the three reported bugs are gone.
import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('shots', { recursive: true });
const say = (...a) => console.log(...a);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(`EXCEPTION ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errs.push(`CONSOLE ${m.text()}`));
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2600);
say('· loaded');

await page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  const el = document.querySelector('#collections');
  go(el.getBoundingClientRect().top + window.scrollY - 10);
});
await page.waitForTimeout(800);
say('· at the collection');

await page.evaluate(() => { window.__gsap.globalTimeline.timeScale(0.12); });
await page.evaluate(() => [...document.querySelectorAll('.cat-tab')].find((b) => b.textContent.includes('Beds')).click());
await page.waitForTimeout(1500);
const mid = await page.evaluate(() => {
  const g = document.querySelector('.pc-grid');
  return { h: Math.round(g.getBoundingClientRect().height), inline: g.style.height };
});
say('· filter mid-flight  grid height', mid.h, '| inline', mid.inline || '(none)');
await page.locator('.collection').screenshot({ path: 'shots/fix-filter-mid.png', animations: 'allow' });
await page.evaluate(() => { window.__gsap.globalTimeline.timeScale(1); });
await page.waitForTimeout(1400);
const after = await page.evaluate(() => {
  const g = document.querySelector('.pc-grid');
  return { h: Math.round(g.getBoundingClientRect().height), inline: g.style.height, n: g.querySelectorAll('.pc').length };
});
say('· filter settled     grid height', after.h, '| inline', after.inline || '(cleared)', '| cards', after.n);

await page.evaluate(() => document.querySelector('.pc-hit').click());
await page.waitForTimeout(1200);
await page.locator('.qv-card').screenshot({ path: 'shots/fix-qv-open.png', animations: 'allow' });
const box = await page.locator('.qv-card').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(700);
const sc = await page.evaluate(() => {
  const c = document.querySelector('.qv-card');
  return { top: Math.round(c.scrollTop), max: Math.round(c.scrollHeight - c.clientHeight) };
});
say('· quick view wheel   scrollTop', sc.top, 'of', sc.max, sc.max === 0 ? '(fits — nothing to scroll)' : sc.top > 0 ? '=> SCROLLS' : '=> STUCK');
say(errs.length ? errs.join('\n') : '· no console errors');
await browser.close();
