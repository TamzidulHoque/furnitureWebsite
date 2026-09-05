import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const reqs = [];
p.on('response', (r) => reqs.push({ url: r.url(), type: r.request().resourceType(), start: Date.now() }));
const t0 = Date.now();
await p.goto('http://localhost:4173', { waitUntil: 'load' });
const loadMs = Date.now() - t0;
const marks = await p.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const by = {};
  for (const r of res) {
    const k = r.initiatorType === 'img' ? 'img' : r.initiatorType;
    by[k] = by[k] || { n: 0, bytes: 0, last: 0 };
    by[k].n++; by[k].bytes += r.transferSize || 0; by[k].last = Math.max(by[k].last, r.responseEnd);
  }
  return {
    domContentLoaded: Math.round(n.domContentLoadedEventEnd),
    load: Math.round(n.loadEventEnd),
    fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
    by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, { n: v.n, kb: Math.round(v.bytes / 1024), lastMs: Math.round(v.last) }])),
  };
});
console.log('load event', loadMs + 'ms |', JSON.stringify(marks));
await p.waitForTimeout(3000);
console.log('images requested by 3s after load:', await p.evaluate(() =>
  performance.getEntriesByType('resource').filter((r) => r.initiatorType === 'img').length));
await b.close();
