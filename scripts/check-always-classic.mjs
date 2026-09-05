// Whatever the visitor chose last time, the front door is Classic.
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);

// switch to Modern, then to Noir, like a visitor would
await p.evaluate(() => document.querySelectorAll('.ms-btn')[1].click());
await p.waitForTimeout(2000);
console.log('after choosing Modern :', await p.evaluate(() => document.documentElement.dataset.mode));

// a stale key from an older build must not survive either
await p.evaluate(() => { try { localStorage.setItem('heaven-mode', 'modern'); } catch (e) {} });

for (const n of [1, 2, 3]) {
  const q = await ctx.newPage();
  await q.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => { window.__early = document.documentElement.dataset.mode; });
  });
  await q.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
  const early = await q.evaluate(() => window.__early);
  await q.waitForTimeout(2200);
  const settled = await q.evaluate(() => ({
    mode: document.documentElement.dataset.mode,
    active: document.querySelector('.ms-btn.active span.ms-name')?.textContent,
    stored: (() => { try { return localStorage.getItem('heaven-mode'); } catch (e) { return 'blocked'; } })(),
  }));
  console.log(`reload ${n}: at DOMContentLoaded ${early} | settled ${settled.mode} | switch says ${settled.active} | stored ${settled.stored}`);
  await q.close();
}
await b.close();
