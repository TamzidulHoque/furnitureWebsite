// One contact sheet per world, numbered, so the assignments can be checked
// against the photographs rather than against the tags.
import sharp from 'sharp';
import { CATALOG } from '../src/data/catalog.js';

for (const w of ['classic', 'modern', 'noir']) {
  const list = CATALOG.filter((r) => r.world === w);
  const W = 300, H = 210, cols = 4;
  const rowsN = Math.ceil(list.length / cols) || 1;
  const tiles = [];
  for (let i = 0; i < list.length; i++) {
    const buf = await sharp('public' + list[i].img).resize(W, H, { fit: 'cover' }).toBuffer();
    tiles.push({ input: buf, left: (i % cols) * (W + 8), top: Math.floor(i / cols) * (H + 26) });
    const name = String(list[i].name).slice(0, 34).replace(/[&<>]/g, ' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="24">`
      + `<rect width="${W}" height="24" fill="#111"/>`
      + `<text x="4" y="16" font-family="monospace" font-size="13" fill="#eee">${i + 1}. ${name}</text></svg>`;
    tiles.push({ input: Buffer.from(svg), left: (i % cols) * (W + 8), top: Math.floor(i / cols) * (H + 26) + H });
  }
  await sharp({ create: { width: cols * (W + 8), height: rowsN * (H + 26), channels: 3, background: '#111' } })
    .composite(tiles).png().toFile(`shots/world-${w}.png`);
  console.log(w.padEnd(8), list.length, list.map((r, i) => `${i + 1}.${r.id}`).join(' '));
}
