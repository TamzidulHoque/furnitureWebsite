// Extract frames from a screen recording so they can be looked at.
// node scripts/watch-clip.mjs "<path to mp4>" [frames]
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
const N = Number(process.argv[3] ?? 24);
const size = fs.statSync(file).size;

const server = http.createServer((req, res) => {
  console.log('req', req.url, req.headers.range ?? '');
  const range = req.headers.range;
  if (range) {
    const [s, e] = range.replace(/bytes=/, '').split('-');
    const start = Number(s);
    const end = e ? Number(e) : Math.min(start + 4_000_000, size - 1);
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(file, { start, end }).pipe(res);
  } else if (req.url === '/page') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!doctype html><meta charset=utf-8><title>clip</title>');
  } else {
    res.writeHead(200, { 'Content-Length': size, 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  }
});
server.on('error', (e) => { console.error('server error', e.message); process.exit(1); });
await new Promise((r) => server.listen(4890, r));

// real Chrome: the bundled Chromium has no H.264 demuxer
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
console.log('browser', browser.version());
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on('console', (m) => console.log('page:', m.text()));
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('requestfailed', (r) => console.log('reqfail:', r.url(), r.failure()?.errorText));
await page.goto('http://localhost:4890/page');
await page.evaluate(() => {
  const v = document.createElement('video');
  v.id = 'v'; v.src = '/clip.mp4'; v.preload = 'auto'; v.muted = true;
  v.style.cssText = 'width:100%;display:block';
  v.addEventListener('error', () => console.log('video error', v.error && v.error.code, v.error && v.error.message));
  document.body.style.margin = '0';
  document.body.appendChild(v);
});
await page.waitForFunction(() => {
  const v = document.getElementById('v');
  return v.readyState >= 1 && v.duration > 0;
}, null, { timeout: 30000 });

const info = await page.evaluate(() => {
  const v = document.getElementById('v');
  return { duration: v.duration, w: v.videoWidth, h: v.videoHeight };
});
console.log('duration', info.duration.toFixed(1) + 's', info.w + 'x' + info.h);

const out = 'shots/clip';
fs.mkdirSync(out, { recursive: true });
for (let i = 0; i < N; i++) {
  const t = (info.duration * (i + 0.5)) / N;
  await page.evaluate(async (time) => {
    const v = document.getElementById('v');
    v.currentTime = time;
    await new Promise((r) => v.addEventListener('seeked', r, { once: true }));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t);
  await page.locator('#v').screenshot({ path: path.join(out, `f${String(i).padStart(2, '0')}_${t.toFixed(1)}s.png`) });
}
console.log('frames written to', out);
await browser.close();
server.close();
