// Full sweep of the production build: every mode, every interaction,
// console errors and broken anchors.  node scripts/audit.mjs [url]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
page.on('pageerror', (e) => problems.push(`EXCEPTION ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`CONSOLE ${m.text()}`));
page.on('requestfailed', (r) => problems.push(`REQFAIL ${r.url()}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);

const sweep = async () => page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 350) { go(y); await new Promise((r) => setTimeout(r, 45)); }
  go(0);
});

for (const [i, mode] of ['classic', 'modern', 'noir'].entries()) {
  if (i > 0) {
    await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), i);
    await page.waitForTimeout(1800);
  }
  await sweep();
  await page.waitForTimeout(500);

  // every room on the plan, then a search, then quick view, then a hotspot
  const rooms = await page.locator('.fp-room').count();
  let roomOk = 0;
  for (let t = 0; t < rooms; t++) {
    await page.evaluate((n) => document.querySelectorAll('.fp-room')[n]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })), t);
    await page.waitForTimeout(420);
    if (await page.locator('.pc').count() > 0) roomOk++;
    await page.evaluate((n) => document.querySelectorAll('.fp-room')[n]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })), t);
    await page.waitForTimeout(380);
  }
  await page.fill('.col-search input', 'velvet');
  await page.waitForTimeout(500);
  const hits = await page.locator('.pc').count();
  await page.fill('.col-search input', '');
  await page.waitForTimeout(400);

  await page.evaluate(() => document.querySelector('.pc-hit')?.click());
  await page.waitForTimeout(700);
  const qvOpen = await page.locator('.qv-card').count();
  await page.evaluate(() => document.querySelectorAll('.qv-step button')[1]?.click());
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  await page.evaluate(() => document.querySelector('.str-dot')?.click());
  await page.waitForTimeout(700);
  const hotOpen = await page.locator('.qv-card').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  console.log(`${mode.padEnd(8)} rooms:${roomOk}/${rooms} velvet-hits:${hits} quickview:${qvOpen ? 'ok' : 'FAIL'} hotspot:${hotOpen ? 'ok' : 'FAIL'}`);
}

// anchors must resolve
const bad = await page.evaluate(() =>
  [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => h !== '#' && !document.querySelector(h)));
console.log('broken anchors:', bad.length ? bad.join(', ') : 'none');
console.log(problems.length ? `PROBLEMS:\n${[...new Set(problems)].join('\n')}` : 'clean: no console errors, no failed requests');
await browser.close();
