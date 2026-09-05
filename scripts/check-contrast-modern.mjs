// Contrast of the Bespoke text against the pixels actually painted.
// node scripts/check-contrast-modern.mjs 0|1|2   (classic|modern|noir)
import { chromium } from 'playwright';
import sharp from 'sharp';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
const MODE = Number(process.argv[2] ?? 1);
if (MODE) await p.evaluate((n) => document.querySelectorAll('.ms-btn')[n].click(), MODE);
await p.waitForTimeout(2200);
await p.evaluate(async () => {
  const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 400) { g(y); await new Promise(r => setTimeout(r, 45)); }
  const t = document.querySelector('#bespoke').getBoundingClientRect().top + window.scrollY;
  g(t - 60);
});
await p.waitForTimeout(700);
await p.screenshot({ path: 'shots/_contrast.png' });
const colours = await p.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { sel, color: getComputedStyle(el).color, box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
  };
  return ['.bespoke-head h2', '.bespoke-head .lede', '.step p', '.step h3', '.finder-ask', '.opt span'].map(pick).filter(Boolean);
});
const img = sharp('shots/_contrast.png');
const lum = (r, g, bl) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
for (const c of colours) {
  const [r, g, bl] = c.color.match(/\d+/g).map(Number);
  // sample the strip just right of the text block: same background, no glyphs
  const left = Math.min(1300, c.box.x + c.box.w + 12);
  const top = Math.max(0, Math.min(855, c.box.y));
  const box = { left, top, width: Math.max(4, Math.min(40, 1360 - left)), height: Math.max(4, Math.min(c.box.h, 860 - top)) };
  if (top + box.height > 860 || left + box.width > 1360) { console.log(c.sel, 'off screen'); continue; }
  if (box.width < 4 || box.height < 4) { console.log(c.sel, 'no room to sample'); continue; }
  const { data, info } = await img.clone().extract(box).raw().toBuffer({ resolveWithObject: true });
  let R = 0, G = 0, B = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) { R += data[i]; G += data[i + 1]; B += data[i + 2]; n++; }
  const lt = lum(r, g, bl), lb = lum(R / n, G / n, B / n);
  const ratio = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
  console.log(c.sel.padEnd(22), 'text', c.color.padEnd(20), 'bg rgb(' + [R / n | 0, G / n | 0, B / n | 0].join(',') + ')', 'contrast', ratio.toFixed(2) + ':1', ratio >= 4.5 ? 'OK' : (ratio >= 3 ? 'large-text only' : 'FAIL'));
}
await b.close();
