// The dialog only overflows on a short viewport — that is where the old
// Lenis wheel capture made it impossible to reach the CTA.
import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const vp of [{ width: 1280, height: 620 }, { width: 390, height: 780 }]) {
  const page = await browser.newPage({ viewport: vp });
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2400);
  await page.evaluate(async () => {
    const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
    for (let y = 0; y <= document.body.scrollHeight; y += 500) { go(y); await new Promise((r) => setTimeout(r, 30)); }
    const el = document.querySelector('#collections');
    go(el.getBoundingClientRect().top + window.scrollY - 10);
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('.pc-hit').click());
  await page.waitForTimeout(1100);
  const box = await page.locator('.qv-card').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const c = document.querySelector('.qv-card');
    const cta = c.querySelector('.config-cta');
    return {
      top: Math.round(c.scrollTop),
      max: Math.round(c.scrollHeight - c.clientHeight),
      ctaVisible: cta.getBoundingClientRect().bottom <= window.innerHeight + 2,
    };
  });
  console.log(`${vp.width}x${vp.height}  scrollTop ${r.top}/${r.max}  ` +
    (r.max === 0 ? 'fits' : r.top > 0 ? 'SCROLLS ok' : 'STUCK') + `  cta reachable: ${r.ctaVisible}`);
  await page.locator('.qv-card').screenshot({ path: `shots/qv-${vp.width}.png`, animations: 'allow' });
  await page.close();
}
await browser.close();
