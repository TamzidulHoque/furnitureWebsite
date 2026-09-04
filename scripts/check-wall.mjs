// Does the wall rehang without collapsing, drift on scroll, and dim on peek?
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1800);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 50)); }
  go(document.querySelector('.salon').getBoundingClientRect().top + window.scrollY - 400);
});
await p.waitForTimeout(700);

const drift = await p.evaluate(async () => {
  const el = document.querySelector('.pw-d0 .pw-in');
  const a = getComputedStyle(el).transform;
  const y0 = document.querySelector('.salon').getBoundingClientRect().top + window.scrollY;
  window.__lenis.scrollTo(y0 + 1800, { immediate: true, force: true });
  await new Promise(r => setTimeout(r, 350));
  return { before: a, after: getComputedStyle(el).transform };
});
console.log('parallax band0:', drift.before, '->', drift.after);

// rehang: click Living on the plan and watch the wall height mid-flight
const flight = await p.evaluate(async () => {
  const wall = document.querySelector('.wall');
  const before = wall.offsetHeight;
  const rooms = [...document.querySelectorAll('.fp-room')];
  rooms[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 300));
  const mid = { h: wall.offsetHeight, inline: wall.style.height, cards: document.querySelectorAll('.pc').length };
  await new Promise(r => setTimeout(r, 1100));
  return { before, mid, after: { h: wall.offsetHeight, inline: wall.style.height, cards: document.querySelectorAll('.pc').length } };
});
console.log('rehang', JSON.stringify(flight));

const peek = await p.evaluate(async () => {
  const rooms = [...document.querySelectorAll('.fp-room')];
  rooms[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  await new Promise(r => setTimeout(r, 450));
  const lit = document.querySelectorAll('.wall .pc.lit').length;
  const dim = [...document.querySelectorAll('.wall .pc')].filter(e => +getComputedStyle(e).opacity < 0.6).length;
  return { peeking: document.querySelector('.wall').classList.contains('peeking'), lit, dim };
});
console.log('peek', JSON.stringify(peek));
await b.close();
