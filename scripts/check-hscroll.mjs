import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
await p.evaluate((n) => document.querySelectorAll('.ms-btn')[2]?.click(), 2);
await p.waitForTimeout(1900);
console.log(JSON.stringify(await p.evaluate(() => {
  window.scrollTo(9999, 0);
  document.documentElement.scrollLeft = 9999;
  document.body.scrollLeft = 9999;
  return {
    canScrollX: document.documentElement.scrollLeft || document.body.scrollLeft || window.scrollX,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
  };
})));
await b.close();
