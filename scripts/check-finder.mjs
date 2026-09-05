// Does answering question 2 (which changes the world) leave the reader where
// they were, and does an outside world change send the finder back to step 1?
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
await p.evaluate(async () => {
  const go = (y) => window.__lenis.scrollTo(y, { immediate: true, force: true });
  for (let y = 0; y <= document.body.scrollHeight; y += 600) { go(y); await new Promise(r => setTimeout(r, 40)); }
  go(document.querySelector('#finder').getBoundingClientRect().top + window.scrollY - 90);
});
await p.waitForTimeout(900);

const where = () => p.evaluate(() => {
  const f = document.querySelector('#finder').getBoundingClientRect();
  return {
    finderTop: Math.round(f.top),
    step: document.querySelector('.finder-steps .on span')?.textContent,
    scrollY: Math.round(window.scrollY),
    pageH: document.documentElement.scrollHeight,
    colBottom: Math.round(document.querySelector('#collections').getBoundingClientRect().bottom),
  };
});
console.log('at the finder      :', JSON.stringify(await where()));
await p.locator('.finder-stage .opt').first().click();     // Q1: a bedroom
await p.waitForTimeout(900);
console.log('after question 1   :', JSON.stringify(await where()));
await p.locator('.finder-stage .opt').nth(2).click();      // Q2: dark & dramatic -> noir
await p.waitForTimeout(2600);
console.log('after question 2   :', JSON.stringify(await where()), '| picks:',
  await p.locator('.finder-picks .fp').count(), '| mode:', await p.evaluate(() => document.documentElement.dataset.mode));

// now change the world from somewhere else
await p.evaluate(() => document.querySelectorAll('.ms-compact .ms-btn')[0].click());
await p.waitForTimeout(2400);
console.log('after outside swap :', JSON.stringify(await where()), '| picks:', await p.locator('.finder-picks .fp').count());
await b.close();
