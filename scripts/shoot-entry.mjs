// What the reader actually sees while scrolling into the workshop section.
import { chromium } from 'playwright';
import sharp from 'sharp';
const b = await chromium.launch();
for (const [i, mode] of ['classic', 'modern', 'noir'].entries()) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1700);
  if (i > 0) { await p.evaluate((n) => document.querySelectorAll('.ms-btn')[n].click(), i); await p.waitForTimeout(2100); }
  await p.evaluate(async () => {
    const g = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
    for (let y = 0; y <= document.body.scrollHeight; y += 500) { g(y); await new Promise(r => setTimeout(r, 40)); }
  });
  await p.waitForTimeout(500);
  const shots = [];
  for (const off of [-620, -400, -200, 0, 200, 420]) {
    await p.evaluate((o) => {
      const t = document.querySelector('#bespoke').getBoundingClientRect().top + window.scrollY;
      window.__lenis.scrollTo(t + o, { immediate: true, force: true });
    }, off);
    await p.waitForTimeout(420);
    shots.push(await p.screenshot());
  }
  const W = 400, H = 225;
  const tiles = [];
  for (let k = 0; k < shots.length; k++) {
    tiles.push({ input: await sharp(shots[k]).resize(W, H, { fit: 'inside' }).toBuffer(), left: (k % 3) * (W + 6), top: Math.floor(k / 3) * (H + 6) });
  }
  await sharp({ create: { width: 3 * (W + 6), height: 2 * (H + 6), channels: 3, background: '#222' } })
    .composite(tiles).png().toFile(`shots/entry-${mode}.png`);
  await p.close();
}
await b.close();
console.log('entry strips written');
