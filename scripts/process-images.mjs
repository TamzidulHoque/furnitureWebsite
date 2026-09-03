// Crop burnt-in watermarks/text, grade subtly, emit responsive WebP.
// Crops are fractional [x0, y0, x1, y1] of the source frame.
import sharp from 'sharp';
import fs from 'node:fs';

const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

const A = 'assets';
const MANIFEST = [
  // ---------- CLASSIC cluster (AI-rendered squares, watermarked) ----------
  { src: `${A}/747604772_1684144490383710_8069181014316575055_n.jpg`, out: 'living-royal',    crop: [0, 0.26, 1, 0.836] },
  { src: `${A}/761504076_1702070998591059_1878849163198993217_n.jpg`, out: 'living-floral',   crop: [0, 0.27, 1, 0.864] },
  { src: `${A}/768371614_1710462144418611_5698540196193769070_n.jpg`, out: 'sofa-grey-velvet',crop: [0, 0.27, 1, 0.873] },
  { src: `${A}/758501475_1695949819203177_8539249593337200471_n.jpg`, out: 'sofa-cream',      crop: [0, 0.27, 1, 0.873] },
  { src: `${A}/751349978_1688125409985618_7348280562578590906_n.jpg`, out: 'dining-cream',    crop: [0, 0.29, 1, 0.875] },
  { src: `${A}/761596606_1700154842116008_2266593655759211928_n.jpg`, out: 'dining-floral',   crop: [0, 0.29, 1, 0.866] },
  { src: `${A}/768205284_1711404377657721_1644144981235924073_n.jpg`, out: 'cabinet-gold',    crop: [0, 0.29, 1, 0.848] },
  { src: `${A}/772521594_1714467227351436_1245435330287886749_n.jpg`, out: 'chairs-pair',     crop: [0, 0.30, 1, 1], sat: 1 },   // banner text sits in the top third
  // ---------- NOIR cluster ----------
  { src: `${A}/768432878_1709553134509512_2759590473845537362_n.jpg`, out: 'console-noir',    crop: [0, 0.29, 1, 0.853] },
  { src: `${A}/773074508_1716547623810063_5708541284272618229_n.jpg`, out: 'dining-noir',     crop: [0, 0.27, 1, 0.846] },
  // ---------- MODERN cluster (small corner label only) ----------
  { src: `${A}/736601104_1672336861564473_7570338895148197172_n.jpg`, out: 'office-lounge',   crop: [0, 0.03, 1, 0.862] },
  { src: `${A}/737191325_1672336838231142_2215111771442126262_n.jpg`, out: 'office-desk',     crop: [0, 0, 1, 0.862] },
  { src: `${A}/736989787_1672336724897820_6637246498013831067_n.jpg`, out: 'office-conf',     crop: [0, 0, 1, 0.862] },
  { src: `${A}/737046509_1672336761564483_389144073028099862_n.jpg`,  out: 'office-director', crop: [0, 0, 1, 0.862] },
  { src: `${A}/736449064_1670206528444173_4375750925473556720_n.jpg`, out: 'chair-ergo',      crop: [0.45, 0, 1, 1] },   // text on left half
  { src: `${A}/736675191_1672336771564482_1918114807941403944_n.jpg`, out: 'office-team',     crop: [0, 0, 0.58, 1] },   // text on right half
  // promo copy fills the left half of both — crop past it for a tight product shot
  { src: `${A}/734008893_1670206525110840_4556845434530645596_n.jpg`, out: 'chair-exec-black',crop: [0.505, 0.16, 0.96, 1] },
  { src: `${A}/736420675_1670206595110833_5351120681345196574_n.jpg`, out: 'chair-exec-wood', crop: [0.505, 0.14, 1, 1] },
  // ---------- REAL photography (clean, portrait) ----------
  { src: `${A}/494195147_1273440371454126_9553634298751690_n.jpg`,    out: 'bed-hero',        crop: [0, 0, 1, 1], sat: 0.96, w: 1600 },
  { src: `${A}/498158806_1291260873005409_1550412438002136855_n.jpg`, out: 'showroom-real',   crop: [0, 0, 1, 1], sat: 0.95, w: 1400 },
  { src: `${A}/530936771_1372614688203360_6405153266756425585_n.jpg`, out: 'bed-gold',        crop: [0.02, 0.10, 1, 0.98], w: 1400 },
  { src: `${A}/705464084_1631795202285306_8620521032188713619_n.jpg`, out: 'bed-white',       crop: [0, 0.29, 1, 1] },
];

for (const item of MANIFEST) {
  const img = sharp(item.src).rotate(); // respect EXIF
  const meta = await img.metadata();
  const [x0, y0, x1, y1] = item.crop;
  const region = {
    left: Math.round(meta.width * x0),
    top: Math.round(meta.height * y0),
    width: Math.round(meta.width * (x1 - x0)),
    height: Math.round(meta.height * (y1 - y0)),
  };
  const sat = item.sat ?? 0.9;                  // gentle desaturation = editorial grade
  const maxW = Math.min(item.w ?? 1200, region.width);
  const base = img.extract(region).modulate({ saturation: sat });
  await base.clone().resize({ width: maxW }).webp({ quality: 82 }).toFile(`${OUT}/${item.out}.webp`);
  await base.clone().resize({ width: Math.round(maxW / 2) }).webp({ quality: 78 }).toFile(`${OUT}/${item.out}-sm.webp`);
  console.log(`${item.out.padEnd(18)} ${meta.width}x${meta.height} -> ${region.width}x${region.height} @${maxW}w`);
}
console.log('DONE');
