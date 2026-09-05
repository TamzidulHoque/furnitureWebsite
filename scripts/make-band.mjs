// The parallax band photographs, desaturated once here instead of by the
// browser on every scrolled frame — a CSS filter on a moving full-bleed
// image forces a re-raster each frame and costs about half the frame rate.
import sharp from 'sharp';

const OUT = 'public/img';
const BANDS = [
  { src: 'living-royal', sat: 0.7 },
  { src: 'office-conf', sat: 0.5, contrast: 1.05 },
  { src: 'dining-noir', sat: 0.7 },
];

for (const b of BANDS) {
  for (const [suffix, width] of [['', 1200], ['-sm', 600]]) {
    let img = sharp(`${OUT}/${b.src}.webp`).resize({ width, withoutEnlargement: true })
      .modulate({ saturation: b.sat });
    if (b.contrast) img = img.linear(b.contrast, -(128 * (b.contrast - 1)));
    await img.webp({ quality: 80 }).toFile(`${OUT}/${b.src}-band${suffix}.webp`);
  }
  console.log('band:', b.src);
}
