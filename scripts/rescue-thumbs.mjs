// Rescue the 206px Facebook grid thumbnails that are real product shots.
//
// 206px is far too small for a catalogue card, so each one is denoised
// (median kills the JPEG mosquito noise before it gets magnified), scaled
// with lanczos3, then unsharp-masked to put the edges back. The result is
// softer than a native photo but holds up at card size — verified against a
// native 1024px reference before any of these were added.
//
// `crop` is optional and only survives on the four rescues that predate the
// decision to stop cropping; everything added since is imported whole, burnt-in
// words and all, and the widths it produces are recorded for srcset.
import sharp from 'sharp';
import fs from 'node:fs';
import { readSizes, writeSizes, SIZES_FILE } from './img-sizes.mjs';

const OUT = 'public/img';
const A = 'assets';
const FULL = 640;                       // ~3.1x — past this the softness shows

const MANIFEST = [
  { src: '488712786_1251377830327047_4261485275635040682_n.jpg', out: 'cabinet-wood',    crop: [0, 0, 1, 0.89] },
  { src: '489006229_1251377810327049_7491661709415816003_n.jpg', out: 'cabinet-carved',  crop: [0, 0, 1, 0.85] },
  { src: '489028849_1253430670121763_4556565440412790620_n.jpg', out: 'wardrobe-light',  crop: [0, 0.08, 1, 1] },
  { src: '489031435_1253429823455181_846534373995314612_n.jpg',  out: 'wardrobe-fluted', crop: [0, 0.22, 1, 1] },
  // 489314337 (teal daybed) was tried and cut — it crops down to a cushion and
  // a rug — and goes to the feed strip instead, where 206px is native.

  // ---------- added to Modern ----------
  { src: '491832270_1263948362403327_74565567019733717_n.jpg',    out: 'sofa-bolster-cream' },
  { src: '617975832_1518889546909206_8894490353968158499_n.jpg',  out: 'chair-lounge-blue' },
  { src: '473222648_1068816478376606_248436287551556573_n.jpg',   out: 'sofa-divan' },
  // ---------- added to Noir ----------
  { src: '487171450_1241309371333893_1676895647074399691_n.jpg',  out: 'bed-leather-panel' },
  { src: '491038728_1261873919277438_6722909313788726982_n.jpg',  out: 'bed-carved-dark' },
  { src: '489769079_1252027256928771_2053032286453354656_n.jpg',  out: 'wardrobe-mirror' },
  { src: '513873650_1328935085904654_3174611049047654652_n.jpg',  out: 'chair-fanback' },
];

const sizes = readSizes();

for (const item of MANIFEST) {
  const img = sharp(`${A}/${item.src}`).rotate();
  const meta = await img.metadata();
  const [x0, y0, x1, y1] = item.crop ?? [0, 0, 1, 1];
  const region = {
    left: Math.round(meta.width * x0),
    top: Math.round(meta.height * y0),
    width: Math.round(meta.width * (x1 - x0)),
    height: Math.round(meta.height * (y1 - y0)),
  };
  const base = () => sharp(`${A}/${item.src}`)
    .rotate()
    .extract(region)
    .median(1)
    .modulate({ saturation: 0.92 });

  await base().resize({ width: FULL, kernel: 'lanczos3' })
    .sharpen({ sigma: 1.2, m1: 0.5, m2: 2.4 })
    .webp({ quality: 88 }).toFile(`${OUT}/${item.out}.webp`);
  await base().resize({ width: Math.round(FULL / 2), kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9, m1: 0.4, m2: 2 })
    .webp({ quality: 84 }).toFile(`${OUT}/${item.out}-sm.webp`);

  const done = await sharp(`${OUT}/${item.out}.webp`).metadata();
  sizes[item.out] = { w: done.width, h: done.height, sm: Math.round(FULL / 2) };
  console.log(`${item.out.padEnd(19)} 206x206 -> ${done.width}x${done.height}`);
}
console.log(`DONE — ${SIZES_FILE} updated (${writeSizes(sizes)} pictures)`);
