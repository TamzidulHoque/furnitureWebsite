import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [i, mode] of ['classic', 'modern', 'noir'].entries()) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1600);
  if (i > 0) { await p.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), i); await p.waitForTimeout(1900); }
  await p.evaluate(async () => {
    const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
    for (let y = 0; y <= document.body.scrollHeight; y += 500) { g(y); await new Promise(r => setTimeout(r, 40)); }
    g(0);
  });
  await p.waitForTimeout(500);
  const out = await p.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > w + 1) {
        bad.push(`${el.tagName.toLowerCase()}.${(el.className.baseVal ?? el.className ?? '').toString().split(' ').filter(Boolean).slice(0,2).join('.')} right=${Math.round(r.right)}`);
      }
    });
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, bad: [...new Set(bad)].slice(0, 8) };
  });
  console.log(mode, JSON.stringify(out));
  await p.close();
}
await b.close();
