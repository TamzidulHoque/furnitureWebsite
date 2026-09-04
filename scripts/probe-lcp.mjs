// What does the entrance curtain cost? LCP with it and without it,
// on a 4x-throttled CPU (roughly what Lighthouse mobile emulates).
import { chromium } from 'playwright';
const browser = await chromium.launch();

const measure = async (skipCurtain) => {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  if (skipCurtain) await page.addInitScript(() => { try { sessionStorage.setItem('hfm-booted', '1'); } catch (e) {} });
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto('http://localhost:4173', { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const r = await page.evaluate(() => ({
    lcp: Math.round(window.__lcp),
    fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
  }));
  await ctx.close();
  return r;
};

console.log('with curtain   ', JSON.stringify(await measure(false)));
console.log('without curtain', JSON.stringify(await measure(true)));
await browser.close();
