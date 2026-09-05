// Frame cost while scrolling through a section, on a throttled CPU.
// node scripts/probe-frames.mjs [#bespoke] [cssToDisable]
import { chromium } from 'playwright';
const rate = Number(process.argv[2] ?? 4);
const kill = process.argv[3] ?? '';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(2200);
if (kill) await p.addStyleTag({ content: kill });

const run = async (sel) => p.evaluate(async (s) => {
  const el = document.querySelector(s);
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.__lenis.scrollTo(top - window.innerHeight, { immediate: true, force: true });
  await new Promise((r) => setTimeout(r, 700));
  const frames = [];
  let last = performance.now();
  let stop = false;
  const tick = (t) => { frames.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  // scroll through the section the way a wheel would
  // one continuous smooth scroll through the section: every frame is real work
  const dist = el.offsetHeight + window.innerHeight;
  window.__lenis.scrollTo(window.scrollY + dist, { duration: 2.6, force: true });
  await new Promise((r) => setTimeout(r, 2900));
  stop = true;
  await new Promise((r) => setTimeout(r, 60));
  const f = frames.slice(3).sort((a, z) => a - z);
  const at = (q) => f[Math.floor(f.length * q)] ?? 0;
  return {
    frames: f.length,
    median: +at(0.5).toFixed(1),
    p95: +at(0.95).toFixed(1),
    worst: +(f[f.length - 1] ?? 0).toFixed(1),
    over32ms: f.filter((x) => x > 32).length,
  };
}, sel);

console.log('cpu x' + rate + (kill ? ' | disabled: ' + kill : ''));
for (const sel of ['#bespoke', '#why', '#collections']) {
  console.log(sel.padEnd(14), JSON.stringify(await run(sel)));
}
await b.close();
