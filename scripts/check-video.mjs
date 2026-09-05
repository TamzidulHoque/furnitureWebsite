// The film should start itself, muted and looping, when it comes into view.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const fails = [];
p.on('requestfailed', (r) => fails.push(`${r.url().split('/').pop()} ${r.failure()?.errorText}`));
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1600);
console.log('before reaching it:', JSON.stringify(await p.evaluate(() => {
  const v = document.querySelector('.proof-video video');
  return { exists: !!v, paused: v?.paused, networkState: v?.networkState };
})));
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 45)); }
  go(document.querySelector('.proof-video').getBoundingClientRect().top + window.scrollY - 200);
});
await p.waitForTimeout(3500);
console.log('in view:', JSON.stringify(await p.evaluate(() => {
  const v = document.querySelector('.proof-video video');
  return { paused: v.paused, muted: v.muted, loop: v.loop, currentTime: +v.currentTime.toFixed(2), readyState: v.readyState };
})));
await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true, force: true }));
await p.waitForTimeout(900);
console.log('scrolled away:', JSON.stringify(await p.evaluate(() => {
  const v = document.querySelector('.proof-video video');
  return { paused: v.paused };
})));
console.log('failed requests:', fails.length ? fails.join(' | ') : 'none');
await b.close();
