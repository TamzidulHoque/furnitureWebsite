// Click each room on the plan and confirm the spread follows.
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'classic';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push(`EXCEPTION ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errs.push(`CONSOLE ${m.text()}`));
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
if (mode !== 'classic') {
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), { modern: 1, noir: 2 }[mode]);
  await page.waitForTimeout(2000);
}
await page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  const el = document.querySelector('#collections');
  go(el.getBoundingClientRect().top + window.scrollY - 10);
});
await page.waitForTimeout(1600);

const rooms = ['bedroom', 'living', 'dining', 'office'];
for (const [i, key] of rooms.entries()) {
  await page.evaluate((n) => document.querySelectorAll('.fp-room')[n].dispatchEvent(new MouseEvent('click', { bubbles: true })), i);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({
    n: document.querySelectorAll('.pc').length,
    label: document.querySelector('.plan-now-k').textContent,
    count: document.querySelector('.plan-now-n').textContent,
    on: document.querySelectorAll('.fp-room.on').length,
  }));
  console.log(`${key.padEnd(8)} -> ${String(r.n).padStart(2)} pieces | panel "${r.label}" ${r.count} | highlighted ${r.on}`);
  await page.evaluate((n) => document.querySelectorAll('.fp-room')[n].dispatchEvent(new MouseEvent('click', { bubbles: true })), i);
  await page.waitForTimeout(1200);
}
// hover peek
await page.evaluate(() => document.querySelectorAll('.fp-room')[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })));
await page.waitForTimeout(400);
const peek = await page.evaluate(() => ({
  peeking: document.querySelector('.pc-grid').classList.contains('peeking'),
  lit: document.querySelectorAll('.pc.lit').length,
}));
console.log('hover Living -> dimmed others:', peek.peeking, '| lit', peek.lit);
console.log(errs.length ? errs.join('\n') : 'no console errors');
await browser.close();
