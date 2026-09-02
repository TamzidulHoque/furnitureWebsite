// Extract brand palette + transparent logo PNGs from assets/logo.jpg
// The logo is flat art on a solid charcoal-teal ground, so we can:
//  1. sample the ground -> brand teal token
//  2. chroma-unmix every pixel against the ground -> clean alpha edges
//  3. sample the gold "A" -> brand gold token
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'assets/logo.jpg';
const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const px = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2]];
};

// --- 1. background = average of the four corner patches ---
let bg = [0, 0, 0], n = 0;
for (const [cx, cy] of [[8, 8], [W - 40, 8], [8, H - 40], [W - 40, H - 40]]) {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const p = px(cx + x, cy + y);
    bg[0] += p[0]; bg[1] += p[1]; bg[2] += p[2]; n++;
  }
}
bg = bg.map(v => Math.round(v / n));

// --- 2. unmix against bg -> RGBA ---
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const T0 = 14, T1 = 90; // alpha ramp thresholds
const rgba = Buffer.alloc(W * H * 4);
let minX = W, minY = H, maxX = 0, maxY = 0;
let gold = [0, 0, 0], gn = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = px(x, y);
  const d = dist(p, bg);
  let a = Math.max(0, Math.min(1, (d - T0) / (T1 - T0)));
  const o = (y * W + x) * 4;
  if (a > 0) {
    // unmix: recover foreground color from the blend with bg
    for (let c = 0; c < 3; c++) {
      rgba[o + c] = Math.max(0, Math.min(255, Math.round((p[c] - (1 - a) * bg[c]) / a)));
    }
    rgba[o + 3] = Math.round(a * 255);
    if (a > 0.9) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    // collect gold samples: warm pixels (r noticeably above b)
    if (a > 0.95 && p[0] > 140 && p[0] - p[2] > 60) { gold[0] += p[0]; gold[1] += p[1]; gold[2] += p[2]; gn++; }
  }
}
gold = gn ? gold.map(v => Math.round(v / gn)) : [212, 160, 62];

const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
console.log('BRAND TEAL :', hex(bg));
console.log('BRAND GOLD :', hex(gold), `(${gn} px sampled)`);
console.log('logo bounds:', { minX, minY, maxX, maxY, W, H });

// --- 3. crop to content + margin, save light version (white text, for dark grounds) ---
const pad = 24;
const region = {
  left: Math.max(0, minX - pad),
  top: Math.max(0, minY - pad),
  width: Math.min(W, maxX + pad) - Math.max(0, minX - pad),
  height: Math.min(H, maxY + pad) - Math.max(0, minY - pad),
};
const base = sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract(region);
await base.clone().png().toFile(`${OUT}/logo-light.png`);

// --- 4. dark version: recolor near-white pixels to brand teal, keep the gold A ---
const { data: ld, info: li } = await base.clone().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < ld.length; i += 4) {
  if (ld[i + 3] > 0) {
    const r = ld[i], g = ld[i + 1], b = ld[i + 2];
    const isGold = r - b > 45 && r > 130;
    if (!isGold) { ld[i] = bg[0]; ld[i + 1] = bg[1]; ld[i + 2] = bg[2]; }
  }
}
await sharp(ld, { raw: { width: li.width, height: li.height, channels: 4 } })
  .png().toFile(`${OUT}/logo-dark.png`);

// --- 5. favicon: just the gold-A region is hard to isolate; use full mark on teal disc ---
const size = 128;
const disc = Buffer.from(
  `<svg width="${size}" height="${size}"><circle cx="64" cy="64" r="64" fill="${hex(bg)}"/></svg>`);
const mark = await base.clone().resize({ width: 100 }).png().toBuffer();
const markMeta = await sharp(mark).metadata();
await sharp(disc)
  .composite([{ input: mark, top: Math.round((size - markMeta.height) / 2), left: 14 }])
  .png().toFile('public/favicon.png');

fs.writeFileSync('scripts/palette.json', JSON.stringify({ teal: hex(bg), gold: hex(gold) }, null, 2));
console.log('WROTE logo-light.png, logo-dark.png, favicon.png, scripts/palette.json');
