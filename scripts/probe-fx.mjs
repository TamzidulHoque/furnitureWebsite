// Sample the curtain / wipe geometry over time instead of screenshotting,
// which is too slow to land on a mid-transition frame.
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'classic';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
if (mode !== 'classic') {
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n]?.click(), { modern: 1, noir: 2 }[mode]);
  await page.waitForTimeout(2000);
}
const samples = await page.evaluate(async (mode) => {
  const dots = [...document.querySelectorAll('.hs-dot')];
  const cur = dots.findIndex((d) => d.classList.contains('active'));
  dots[(cur + 1) % dots.length].click();
  const read = () => {
    if (mode === 'classic') {
      const l = document.querySelector('.hs-half-l');
      const c = document.querySelector('.hs-curtain');
      return `curtain vis=${getComputedStyle(c).visibility} leftHalf=${getComputedStyle(l).transform}`;
    }
    if (mode === 'noir') {
      const f = document.querySelector('.hs-fx');
      const e = document.querySelector('.hs-edge');
      return `clip=${getComputedStyle(f).clipPath.slice(0, 60)} edge=${getComputedStyle(e).transform.slice(0, 46)}`;
    }
    return getComputedStyle(document.querySelector('.hs-fx')).transform;
  };
  const out = [];
  for (const t of [0, 150, 300, 500, 750, 1000, 1300]) {
    await new Promise((r) => setTimeout(r, t === 0 ? 30 : 0));
    out.push(`${String(t).padStart(4)}ms  ${read()}`);
    if (t !== 1300) await new Promise((r) => setTimeout(r, 150));
  }
  return out;
}, mode);
samples.forEach((s) => console.log(s));
await browser.close();
