// The same page, dev server vs production build: how long images take and
// how the scroll actually runs.
import { chromium } from 'playwright';
const b = await chromium.launch();

const measure = async (url, label) => {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const imgs = [];
  p.on('response', async (r) => {
    const t = r.request().timing();
    if (/\.(webp|jpg|png|mp4)$/.test(r.url())) {
      imgs.push({ url: r.url().split('/').pop(), ms: Math.round(t.responseEnd - t.requestStart), bytes: Number(r.headers()['content-length'] ?? 0) });
    }
  });
  const t0 = Date.now();
  await p.goto(url, { waitUntil: 'networkidle' });
  const loaded = Date.now() - t0;
  await p.waitForTimeout(1500);

  // scroll the whole page smoothly and record frames
  const frames = await p.evaluate(async () => {
    const f = [];
    let last = performance.now(), stop = false;
    const tick = (t) => { f.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    window.__lenis.scrollTo(document.body.scrollHeight, { duration: 6, force: true });
    await new Promise((r) => setTimeout(r, 6400));
    stop = true;
    const s = f.slice(5).sort((a, z) => a - z);
    return { n: s.length, median: +(s[Math.floor(s.length / 2)] ?? 0).toFixed(1), p95: +(s[Math.floor(s.length * 0.95)] ?? 0).toFixed(1), worst: +(s[s.length - 1] ?? 0).toFixed(1) };
  });
  const slow = imgs.filter((i) => i.ms > 300).sort((a, z) => z.ms - a.ms).slice(0, 5);
  console.log(`${label}: networkidle ${loaded}ms | images ${imgs.length} | frames n=${frames.n} median ${frames.median}ms p95 ${frames.p95}ms worst ${frames.worst}ms`);
  console.log('   slowest:', slow.map((i) => `${i.url} ${i.ms}ms`).join(', ') || 'none over 300ms');
  await ctx.close();
};

await measure('http://localhost:4173', 'PROD ');
await measure('http://localhost:5173', 'DEV  ');
await b.close();
