// Drive the browsing flow and shoot each state.
//   node scripts/shoot-flow.mjs [mode] [viewport]
import { chromium } from 'playwright';
import fs from 'node:fs';

const mode = process.argv[2] ?? 'classic';
const wide = (process.argv[3] ?? 'desktop') === 'desktop';
const viewport = wide ? { width: 1440, height: 900 } : { width: 390, height: 844 };
const tag = `${mode}-${wide ? 'd' : 'm'}`;
fs.mkdirSync('shots', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
const errs = [];
page.on('pageerror', (e) => errs.push(`EXCEPTION: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errs.push(`CONSOLE: ${m.text()}`));

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2400);

if (mode !== 'classic') {
  const i = { modern: 1, noir: 2 }[mode];
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), i);
  await page.waitForTimeout(1900);
}

const scrollTo = async (sel, off = 90) =>
  page.evaluate(async ([s, o]) => {
    const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 500) { go(y); await new Promise((r) => setTimeout(r, 40)); }
    const el = document.querySelector(s);
    go(el.getBoundingClientRect().top + window.scrollY - o);
  }, [sel, off]);

// 1 — collection, filtered to Chairs
await scrollTo('#collections');
await page.waitForTimeout(900);
await page.evaluate(() => [...document.querySelectorAll('.cat-tab')].find((b) => b.textContent.includes('Chairs'))?.click());
await page.waitForTimeout(1100);
await page.locator('#collections').screenshot({ path: `shots/flow-${tag}-1-chairs.png` });

// 2 — search
await page.fill('.col-search input', 'velvet');
await page.waitForTimeout(1100);
await page.locator('#collections').screenshot({ path: `shots/flow-${tag}-2-search.png` });
await page.fill('.col-search input', '');
await page.waitForTimeout(800);

// 3 — quick view
await page.evaluate(() => document.querySelector('.pc-hit')?.click());
await page.waitForTimeout(900);
await page.screenshot({ path: `shots/flow-${tag}-3-quickview.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(500);

// 4 — finder, all three steps
await scrollTo('#finder');
await page.waitForTimeout(700);
await page.locator('#finder').screenshot({ path: `shots/flow-${tag}-4-finder-q1.png` });
await page.evaluate(() => document.querySelectorAll('.opt')[1]?.click());
await page.waitForTimeout(900);
await page.locator('#finder').screenshot({ path: `shots/flow-${tag}-5-finder-q2.png` });
await page.evaluate(() => document.querySelectorAll('.opt')[0]?.click());
await page.waitForTimeout(2600);
await scrollTo('#finder');
await page.waitForTimeout(700);
await page.locator('#finder').screenshot({ path: `shots/flow-${tag}-6-finder-result.png` });

// the WhatsApp payload the result would send
const wa = await page.evaluate(() => document.querySelector('#finder .btn-solid')?.getAttribute('href'));
console.log('WA:', decodeURIComponent((wa ?? '').split('text=')[1] ?? '(none)'));
console.log(errs.length ? errs.join('\n') : 'no console errors');
await browser.close();
