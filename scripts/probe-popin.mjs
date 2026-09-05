// Scroll at a human speed and count pictures that are still blank on screen.
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 40, downloadThroughput: (8 * 1024 * 1024) / 8, uploadThroughput: 1e6,
});
await p.goto('http://localhost:4173', { waitUntil: 'load' });
await p.waitForTimeout(1500);
const worst = await p.evaluate(async () => {
  let blanks = 0, samples = 0, worstAt = 0;
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += 380) {
    window.__lenis.scrollTo(y, { immediate: true, force: true });
    await new Promise((r) => setTimeout(r, 130));
    const inView = [...document.images].filter((im) => {
      const r = im.getBoundingClientRect();
      return im.currentSrc !== '' && r.bottom > 0 && r.top < innerHeight && r.width > 40;
    });
    const blank = inView.filter((im) => !im.complete || im.naturalWidth === 0);
    blanks += blank.length; samples += inView.length;
    if (blank.length > worstAt) worstAt = blank.length;
    for (const im of blank) {
      const where = im.closest('[class*="wall"],[class*="feedrail"],[class*="str-"],[class*="intro"],[class*="finder"],[class*="hero"],[class*="proof"]');
      const k = where ? where.className.toString().split(' ')[0] : 'other';
      window.__by = window.__by || {}; window.__by[k] = (window.__by[k] || 0) + 1;
    }
  }
  return { blanks, samples, worstAt, by: window.__by || {} };
});
console.log('while scrolling at 8Mbps:', JSON.stringify(worst));
await b.close();
