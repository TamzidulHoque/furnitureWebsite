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

// ---- 1b. reclaim enclosed background islands (wall/floor seen through
//          arm holes and table arches, unreachable by the border flood) ----
{
  // per-row mean of known bg, to compare against (bg is a smooth gradient)
  const rowMean = new Float64Array(H * 3), rowN = new Uint32Array(H);
  for (let i = 0; i < N; i++) if (bg[i]) {
    const y = (i / W) | 0;
    rowMean[y * 3] += R(i); rowMean[y * 3 + 1] += G(i); rowMean[y * 3 + 2] += B(i); rowN[y]++;
  }
  const seen = new Uint8Array(N);
  let reclaimed = 0;
  const comp = [];
  for (let s = 0; s < N; s++) {
    if (bg[s] || seen[s]) continue;
    // BFS one non-bg component
    comp.length = 0;
    const st = [s]; seen[s] = 1;
    let sum = [0, 0, 0];
    while (st.length) {
      const i = st.pop(); comp.push(i);
      sum[0] += R(i); sum[1] += G(i); sum[2] += B(i);
      const x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (!bg[j] && !seen[j]) { seen[j] = 1; st.push(j); }
      }
    }
    if (comp.length > 20000) continue; // real furniture is one huge component
    // does this small island look like the bg around its rows?
    let close = 0, denom = 0;
    for (const i of comp) {
      const y = (i / W) | 0;
      if (!rowN[y]) continue;
      denom++;
      const d = Math.hypot(
        R(i) - rowMean[y * 3] / rowN[y],
        G(i) - rowMean[y * 3 + 1] / rowN[y],
        B(i) - rowMean[y * 3 + 2] / rowN[y]
      );
      if (d < 58) close++;
    }
    if (denom && close / denom > 0.5) { for (const i of comp) bg[i] = 1; reclaimed += comp.length; }
  }
  console.log("islands reclaimed as bg:", reclaimed);
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
  // floor seen through the table-stem arch windows: inside these boxes only
  // strongly warm pixels are wood — the greyer floor shadow stays untinted
  const inArch = (x > 465 && x < 565 && y > 402 && y < 472) ||
                 (x > 475 && x < 555 && y > 488 && y < 548);
  if (inArch && r - b < 30) { nOther++; continue; }
  const warm = r - b;
  if (L < 112 && warm > 20) { wood[i] = 255; nWood++; }   // dark warm = wood frame
  else if (L >= 68 && warm > 13) { fabric[i] = 255; nFab++; } // warm cream only — grey wall/floor stays
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
