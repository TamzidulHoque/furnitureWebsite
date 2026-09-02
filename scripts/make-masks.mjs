// Segment the configurator base photo (chairs-studio) into
// wood / fabric masks, offline, where we can eyeball the result.
//  bg   : gradient-tolerant flood fill from the borders
//  wood : warm dark pixels of what's left
//  fabric: the rest (minus green plant / near-white pot)
import sharp from 'sharp';

const SRC = 'public/img/chairs-studio.webp';
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const N = W * H;
const R = (i) => data[i * C], G = (i) => data[i * C + 1], B = (i) => data[i * C + 2];
const lum = (i) => 0.299 * R(i) + 0.587 * G(i) + 0.114 * B(i);

// ---- 1. background flood fill (BFS), tolerant to smooth gradients ----
const bg = new Uint8Array(N);
const q = [];
const STEP_TOL = 9;      // max per-step neighbour delta on a smooth surface
const push = (i) => { if (!bg[i]) { bg[i] = 1; q.push(i); } };
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
while (q.length) {
  const i = q.pop();
  const x = i % W, y = (i / W) | 0;
  const r = R(i), g = G(i), b = B(i);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (bg[j]) continue;
    const d = Math.max(Math.abs(R(j) - r), Math.abs(G(j) - g), Math.abs(B(j) - b));
    if (d <= STEP_TOL) { bg[j] = 1; q.push(j); }
  }
}

// ---- 2. classify the furniture pixels ----
const wood = new Uint8Array(N);
const fabric = new Uint8Array(N);
let nBg = 0, nWood = 0, nFab = 0, nOther = 0;
for (let i = 0; i < N; i++) {
  if (bg[i]) { nBg++; continue; }
  const r = R(i), g = G(i), b = B(i), L = lum(i);
  const x = i % W, y = (i / W) | 0;
  const isGreen = g > r * 1.02 && g > b;                 // bright foliage
  const isPlantZone = x < 118 && y < 240;                // shadowed leaves, clear of the chair
  const isPotZone = x < 74 && y > 245 && y < 415;        // white ceramic pot
  if (isGreen || isPlantZone || isPotZone) { nOther++; continue; }
  // glass tabletop ellipse: what shows through it keeps its original pixels
  const ex = (x - 505) / 205, ey = (y - 300) / 92;
  if (ex * ex + ey * ey < 1) { nOther++; continue; }
  const warm = r - b;
  if (L < 112 && warm > 18) { wood[i] = 255; nWood++; }   // dark warm = wood frame
  else if (L >= 68 && warm > -14) { fabric[i] = 255; nFab++; }
  else nOther++;
}

// despeckle: strip isolated flecks so stripes/shadows don't get the wrong material
function despeckle(sel, other) {
  for (let pass = 0; pass < 2; pass++) {
    const copy = Uint8Array.from(sel);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (!copy[i]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) n += copy[i + dy * W + dx] ? 1 : 0;
      }
      if (n < 3) { sel[i] = 0; if (other[i] !== undefined) other[i] = 255; }
    }
  }
}
despeckle(wood, fabric);   // stray wood flecks inside cushions become fabric
despeckle(fabric, {});     // stray fabric flecks just drop out
console.log({ nBg, nWood, nFab, nOther, pctBg: (100 * nBg / N).toFixed(1) });

// ---- 3. save masks (alpha = selection, feathered) + debug overlay ----
async function saveMask(sel, name) {
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    rgba[i * 4] = 255; rgba[i * 4 + 1] = 255; rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = sel[i];
  }
  await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .blur(1.2)
    .png()
    .toFile(`public/img/${name}.png`);
}
await saveMask(wood, 'mask-wood');
await saveMask(fabric, 'mask-fabric');

// debug: wood → red, fabric → blue, bg dimmed
const dbg = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  if (wood[i]) { dbg[i * 3] = 220; dbg[i * 3 + 1] = 40; dbg[i * 3 + 2] = 40; }
  else if (fabric[i]) { dbg[i * 3] = 50; dbg[i * 3 + 1] = 90; dbg[i * 3 + 2] = 220; }
  else {
    const f = bg[i] ? 0.35 : 1;
    dbg[i * 3] = R(i) * f; dbg[i * 3 + 1] = G(i) * f; dbg[i * 3 + 2] = B(i) * f;
  }
}
await sharp(dbg, { raw: { width: W, height: H, channels: 3 } })
  .png().toFile('scripts/_masks-debug.png');
console.log('WROTE mask-wood.png, mask-fabric.png, _masks-debug.png');
