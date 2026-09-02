// Render the 1200x630 social share card in the browser (site fonts loaded),
// screenshot it, save as public/og.jpg
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

await page.evaluate(() => {
  const el = document.createElement('div');
  el.id = 'ogcard';
  el.innerHTML = `
    <div style="position:fixed;inset:0;z-index:99999;background:#22403d;width:1200px;height:630px;
                display:flex;overflow:hidden;font-family:'Jost',sans-serif;">
      <div style="flex:1;padding:64px 20px 64px 72px;display:flex;flex-direction:column;justify-content:center;position:relative;">
        <img src="/img/logo-light.png" style="width:300px;margin-bottom:44px;" />
        <div style="font-family:'Cormorant Garamond',serif;font-size:58px;line-height:1.08;color:#f2ede1;font-weight:500;">
          Furniture, Crafted<br/><em style="color:#d4a94f;">Around You.</em>
        </div>
        <div style="margin-top:34px;font-size:15px;letter-spacing:0.24em;text-transform:uppercase;color:#b8c5bf;">
          Bespoke Furniture &middot; Agrabad, Chattogram
        </div>
        <div style="position:absolute;left:72px;bottom:40px;right:0;height:1px;background:rgba(212,169,79,0.4);width:200px;"></div>
      </div>
      <div style="width:460px;position:relative;margin:36px 36px 36px 12px;border-radius:4px;overflow:hidden;
                  outline:1px solid rgba(212,169,79,0.5);outline-offset:8px;">
        <img src="/img/bed-hero.webp" style="width:100%;height:100%;object-fit:cover;" />
      </div>
    </div>`;
  document.body.appendChild(el);
});
await page.waitForTimeout(900);
await page.locator('#ogcard > div').screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 88 });
console.log('og.jpg written');
await browser.close();
