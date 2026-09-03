// Rescue the 206px Facebook grid thumbnails that are real product shots.
//
// 206px is far too small for a catalogue card, so each one is denoised
// (median kills the JPEG mosquito noise before it gets magnified), scaled
// with lanczos3, then unsharp-masked to put the edges back. The result is
// softer than a native photo but holds up at card size — verified against a
// native 1024px reference before any of these were added.
//
// Crops cut the burnt-in watermark / phone number, in fractions of the frame.
import sharp from 'sharp';
import fs from 'node:fs';

const OUT = 'public/img';
const A = 'assets';
const FULL = 640;                       // ~3.1x — past this the softness shows

const MANIFEST = [
  { src: '488712786_1251377830327047_4261485275635040682_n.jpg', out: 'cabinet-wood',    crop: [0, 0, 1, 0.89] },
  { src: '489006229_1251377810327049_7491661709415816003_n.jpg', out: 'cabinet-carved',  crop: [0, 0, 1, 0.85] },
  { src: '489028849_1253430670121763_4556565440412790620_n.jpg', out: 'wardrobe-light',  crop: [0, 0.08, 1, 1] },
  { src: '489031435_1253429823455181_846534373995314612_n.jpg',  out: 'wardrobe-fluted', crop: [0, 0.22, 1, 1] },
  // Two more were tried and cut, not for resolution but for the frame:
  // 489769079 (wardrobe + mirror) is tilted and shows the room through the
  // glass; 489314337 (teal daybed) crops down to a cushion and a rug. Both
  // go to the feed strip instead, where 206px is native and they read fine.
];

for (const item of MANIFEST) {
  const img = sharp(`${A}/${item.src}`).rotate();
  const meta = await img.metadata();
  const [x0, y0, x1, y1] = item.crop;
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

  console.log(`${item.out.padEnd(17)} 206x206 -> ${region.width}x${region.height} @${FULL}w`);
}
console.log('DONE');
