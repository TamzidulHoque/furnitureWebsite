// Focus ring on the dark header and on the wall.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
await p.goto('http://localhost:4173', { waitUntil: 'networkidle' });
await p.waitForTimeout(1700);
await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/focus-header.png', clip: { x: 0, y: 0, width: 1280, height: 110 } });
console.log('header focus:', await p.evaluate(() => document.activeElement.textContent?.trim().slice(0, 30)));
await b.close();
