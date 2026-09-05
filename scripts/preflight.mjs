// Everything that must be true before this goes live, checked against the
// built site rather than asserted: no console errors, no failed requests, no
// broken pictures, no sideways scroll, in every world on desktop and phone.
//
//   npm run build && node scripts/preflight.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const PORT = 4231;
const URL = `http://localhost:${PORT}`;
const WORLDS = ['classic', 'modern', 'noir'];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(URL)).ok) break; } catch { /* not up */ }
  await new Promise((r) => setTimeout(r, 500));
}

let bad = 0;
const fail = (m) => { bad++; console.log('  FAIL ' + m); };
const ok = (m) => console.log('  ok   ' + m);

// ── the files a deploy needs at the root ──
for (const f of ['og.jpg', 'favicon.png', 'apple-touch-icon.png', 'robots.txt']) {
  fs.existsSync(`dist/${f}`) ? ok(`dist/${f}`) : fail(`dist/${f} is missing`);
}

const browser = await chromium.launch();
let bytes = 0;

for (const vp of [{ width: 1440, height: 900, label: 'desktop' }, { width: 390, height: 844, label: 'phone' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errs = [];
  const failed = [];
  page.on('pageerror', (e) => errs.push('EXCEPTION ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push('CONSOLE ' + m.text()));
  page.on('requestfailed', (r) => {
    // a media element that stops fetching once it has enough is not a failure
    if (r.failure()?.errorText === 'net::ERR_ABORTED' && /\.(mp4|webm)$/.test(r.url())) return;
    failed.push(`${r.url().split('/').pop()} — ${r.failure()?.errorText}`);
  });
  page.on('response', async (r) => {
    const len = Number(r.headers()['content-length'] || 0);
    if (vp.label === 'desktop') bytes += len;
    if (r.status() >= 400) failed.push(`${r.url().split('/').pop()} — HTTP ${r.status()}`);
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  for (const [i, world] of WORLDS.entries()) {
    if (i) {
      await page.locator('.mode-switch .ms-btn', { hasText: new RegExp(`^${world}`, 'i') }).first().click();
      await page.waitForTimeout(1800);
    }
    await page.evaluate(async () => {
      const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y));
      for (let y = 0; y <= document.body.scrollHeight; y += 400) { go(y); await new Promise((r) => setTimeout(r, 40)); }
      go(0);
    });
    await page.waitForTimeout(600);

    const state = await page.evaluate(() => ({
      broken: [...document.querySelectorAll('img')].filter((i) => i.currentSrc && !i.naturalWidth).map((i) => i.currentSrc.split('/').pop()),
      unrevealed: [...document.querySelectorAll('.rv, .rv-img')].filter((e) => !e.classList.contains('is-in')).length,
      sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      emptyText: [...document.querySelectorAll('h1, h2, h3')].filter((h) => !h.textContent.trim()).length,
    }));
    const tag = `${vp.label}/${world}`;
    state.broken.length ? fail(`${tag}: broken pictures — ${state.broken.slice(0, 4).join(', ')}`) : ok(`${tag}: no broken pictures`);
    state.unrevealed ? fail(`${tag}: ${state.unrevealed} sections never revealed`) : ok(`${tag}: everything revealed`);
    state.sideways ? fail(`${tag}: page scrolls sideways ${state.sideways}px`) : ok(`${tag}: no sideways scroll`);
    if (state.emptyText) fail(`${tag}: ${state.emptyText} empty headings`);
  }

  errs.length ? fail(`${vp.label}: ${errs.slice(0, 3).join(' | ')}`) : ok(`${vp.label}: no console errors`);
  failed.length ? fail(`${vp.label}: failed requests — ${[...new Set(failed)].slice(0, 4).join(' | ')}`) : ok(`${vp.label}: no failed requests`);
  await ctx.close();
}

console.log(`  --   first-load weight walked through every world: ${(bytes / 1024 / 1024).toFixed(1)}MB`);
await browser.close();
server.kill();
spawn('npx', ['kill-port', String(PORT)], { shell: true, stdio: 'ignore' }).unref?.();
console.log(bad ? `\nNOT READY (${bad})` : '\nREADY TO DEPLOY');
process.exit(bad ? 1 : 0);
