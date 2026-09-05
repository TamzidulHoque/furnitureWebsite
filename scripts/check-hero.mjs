// Press every rule under the hero picture, in all three worlds, on desktop and
// on a phone — and prove each press lands on its own picture.
//
//   npm run build && node scripts/check-hero.mjs
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';

const PORT = 4197;
const URL = `http://localhost:${PORT}`;
const MIN_TARGET = 24;          // px — the smallest thing a thumb can find

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* not up yet */ }
  await new Promise((r) => setTimeout(r, 500));
}

const stopServer = () => {
  // spawn(..., { shell: true }) on Windows puts a cmd.exe between us and vite,
  // and killing that leaves the server running and the port held. Every run
  // used to leak one. /T takes the whole tree.
  if (process.platform === 'win32') {
    try { spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* already gone */ }
  }
  server.kill();
};

const browser = await chromium.launch();
let bad = 0;
const fail = (msg) => { bad++; console.log('  !! ' + msg); };

for (const vp of [{ width: 1440, height: 900, label: 'desktop' }, { width: 390, height: 844, label: 'phone' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('EXCEPTION ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push('CONSOLE ' + m.text()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  for (const world of ['classic', 'modern', 'noir']) {
    if (world !== 'classic') {
      await page.locator('.mode-switch .ms-btn', { hasText: new RegExp(`^${world}`, 'i') }).first().click();
      await page.waitForTimeout(1800);
    }
    const dots = page.locator('.hs-dot');
    const n = await dots.count();
    const seen = [];
    for (let i = 0; i < n; i++) {
      const box = await dots.nth(i).boundingBox();
      await dots.nth(i).click();
      await page.waitForTimeout(900);
      const src = await page.locator('.hs-base img').getAttribute('src');
      const sel = await dots.evaluateAll((els) => els.findIndex((e) => e.classList.contains('active')));
      seen.push(src);
      const size = box ? `${Math.round(box.width)}x${Math.round(box.height)}` : 'none';
      if (!box || box.width < MIN_TARGET || box.height < MIN_TARGET) fail(`${vp.label} ${world} rule ${i}: target only ${size}`);
      if (sel !== i) fail(`${vp.label} ${world} rule ${i}: marked rule is ${sel}`);
      console.log(`${vp.label.padEnd(7)} ${world.padEnd(7)} rule ${i}  target ${size.padEnd(7)} -> ${src.split('/').pop()}`);
    }
    const uniq = new Set(seen);
    if (uniq.size !== n) fail(`${vp.label} ${world}: ${n} rules but only ${uniq.size} distinct pictures`);
    else console.log(`  ok ${vp.label} ${world}: ${n} rules, ${n} distinct pictures`);
  }
  if (errs.length) fail(`${vp.label} console: ${errs.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

await browser.close();
stopServer();
console.log(bad ? `\nFAIL (${bad})` : '\nALL GOOD');
process.exit(bad ? 1 : 0);
