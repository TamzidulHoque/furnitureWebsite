// Keyboard: is the focused thing always visibly focused?
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 45)); }
  go(document.querySelector('.plan-wrap').getBoundingClientRect().top + window.scrollY - 70);
});
await p.waitForTimeout(500);

// walk the plan with the keyboard
await p.locator('.fp-room').first().focus();
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/focus-plan.png' });
const outline = await p.evaluate(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el.querySelector('.fp-floor') || el);
  return { tag: el.tagName, cls: el.getAttribute('class'), stroke: s.stroke, w: s.strokeWidth };
});
console.log('plan focus:', JSON.stringify(outline));
await p.keyboard.press('Enter');
await p.waitForTimeout(900);
console.log('enter picks room ->', await p.locator('.wall .pc').count(), 'pieces');
await p.keyboard.press('Enter');
await p.waitForTimeout(900);
console.log('enter again ->', await p.locator('.wall .pc').count(), 'pieces');

// a piece on the wall
await p.locator('.wall .pc-hit').first().focus();
await p.waitForTimeout(400);
await p.screenshot({ path: 'shots/focus-card.png' });
console.log('card focus outline:', await p.evaluate(() => {
  const s = getComputedStyle(document.activeElement);
  return s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor;
}));
await p.keyboard.press('Enter');
await p.waitForTimeout(900);
console.log('quick view open:', await p.locator('.qv-card').count());
console.log('focus inside dialog:', await p.evaluate(() => !!document.activeElement.closest('.qv-card')));
await p.keyboard.press('Escape');
await p.waitForTimeout(600);
console.log('focus returned to the piece:', await p.evaluate(() => !!document.activeElement.closest('.wall')));
await b.close();
