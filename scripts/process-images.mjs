// Every source photo, imported whole — no crop, no zoom, nothing cut away.
// Heaven's own logo, headlines and address strips stay in frame; they are the
// brand's marks and the client would rather see them than lose the picture.
//
// Two sizes come out of each source, plus src/data/img-sizes.js recording what
// they really measure. The page needs true widths in its srcset or the browser
// picks a small file for a big slot and the picture goes soft; it needs the
// heights because Shop The Room pins its hotspots to percentages of the
// photograph, and a photograph that changes shape moves every dot on it.
//
//   node scripts/process-images.mjs                      rebuild everything
//   node scripts/process-images.mjs dining-glass-round   rebuild one
import sharp from 'sharp';
import fs from 'node:fs';
import { readSizes, writeSizes, SIZES_FILE } from './img-sizes.mjs';

const OUT = 'public/img';
fs.mkdirSync(OUT, { recursive: true });

// Nothing is enlarged past its own pixels — that is where softness comes from —
// so this is a ceiling, not a target. 1600 covers the hero on a DPR-2 laptop.
const CAP = 1600;

// tests/catalog.test.mjs holds every photograph to 400KB. Rather than hand-tune
// the one or two frames that overshoot, the encoder steps its own quality down
// until the file fits — full size is kept, a little compression is spent.
const BUDGET = 400 * 1024;
const QUALITY = [84, 80, 76, 72, 68];

const A = 'assets';
const MANIFEST = [
  // ---------- CLASSIC cluster ----------
  { src: `${A}/747604772_1684144490383710_8069181014316575055_n.jpg`, out: 'living-royal' },
  { src: `${A}/761504076_1702070998591059_1878849163198993217_n.jpg`, out: 'living-floral' },
  { src: `${A}/768371614_1710462144418611_5698540196193769070_n.jpg`, out: 'sofa-grey-velvet' },
  { src: `${A}/758501475_1695949819203177_8539249593337200471_n.jpg`, out: 'sofa-cream' },
  { src: `${A}/751349978_1688125409985618_7348280562578590906_n.jpg`, out: 'dining-cream' },
  { src: `${A}/761596606_1700154842116008_2266593655759211928_n.jpg`, out: 'dining-floral' },
  { src: `${A}/768205284_1711404377657721_1644144981235924073_n.jpg`, out: 'cabinet-gold' },
  { src: `${A}/772521594_1714467227351436_1245435330287886749_n.jpg`, out: 'chairs-pair', sat: 1 },
  // ---------- NOIR cluster ----------
  { src: `${A}/768432878_1709553134509512_2759590473845537362_n.jpg`, out: 'console-noir' },
  { src: `${A}/773074508_1716547623810063_5708541284272618229_n.jpg`, out: 'dining-noir' },
  // ---------- MODERN cluster ----------
  { src: `${A}/736601104_1672336861564473_7570338895148197172_n.jpg`, out: 'office-lounge' },
  { src: `${A}/737191325_1672336838231142_2215111771442126262_n.jpg`, out: 'office-desk' },
  { src: `${A}/736989787_1672336724897820_6637246498013831067_n.jpg`, out: 'office-conf' },
  { src: `${A}/737046509_1672336761564483_389144073028099862_n.jpg`, out: 'office-director' },
  { src: `${A}/736449064_1670206528444173_4375750925473556720_n.jpg`, out: 'chair-ergo' },
  { src: `${A}/736675191_1672336771564482_1918114807941403944_n.jpg`, out: 'office-team' },
  { src: `${A}/736420675_1670206595110833_5351120681345196574_n.jpg`, out: 'chair-exec-wood' },
  // ---------- STUDIO product shots ----------
  { src: `${A}/489389872_1254504870014343_1566243613082510479_n.jpg`, out: 'chest-gilded' },
  { src: `${A}/490299398_1257364003061763_8109435534264629788_n.jpg`, out: 'dresser-carved' },
  { src: `${A}/496926353_1285606276904202_2460354133759773698_n.jpg`, out: 'chairs-barrel' },
  // ---------- REAL showroom photography ----------
  { src: `${A}/495450806_1285606443570852_7291400656447408694_n.jpg`, out: 'dining-marble-gold', sat: 0.95 },
  { src: `${A}/497458359_1289388343192662_3550378067329039407_n.jpg`, out: 'dining-glass-round', sat: 0.95 },
  { src: `${A}/637060112_1545124897619004_4741334533607390088_n.jpg`, out: 'chaise-gold', sat: 0.95 },
  { src: `${A}/651049436_1565230802275080_8697599286154393697_n.jpg`, out: 'dining-marble-oval', sat: 0.95 },
  // ---------- material swatches: the object pinned into Bespoke's corner ----------
  // Noir has no entry here: its belt is drawn in Bespoke.jsx. The photograph of
  // one sits on a white studio ground and looked pasted on against that page.
  { src: `${A}/images.jpg`,                                                             out: 'swatch-damask',  sat: 0.95 },
  { src: `${A}/Office-Chair-Caster-Wheels-Fit-Each-Other_f20905cc-1d84-45e5-bdab-38af5a844deb.webp`, out: 'swatch-casters' },
  { src: `${A}/629488201_1536163895181771_4585033742860212554_n.jpg`, out: 'centre-table-gilt', sat: 0.95 },
  { src: `${A}/532056526_1372615224869973_6520836994417592776_n.jpg`, out: 'chair-quilted-dining', sat: 0.95 },
  // ---------- REAL photography (clean, portrait) ----------
  { src: `${A}/494195147_1273440371454126_9553634298751690_n.jpg`, out: 'bed-hero', sat: 0.96 },
  { src: `${A}/498158806_1291260873005409_1550412438002136855_n.jpg`, out: 'showroom-real', sat: 0.95 },
  { src: `${A}/530936771_1372614688203360_6405153266756425585_n.jpg`, out: 'bed-gold' },
  { src: `${A}/705464084_1631795202285306_8620521032188713619_n.jpg`, out: 'bed-white' },
];

const only = process.argv.slice(2);
const QUEUE = only.length ? MANIFEST.filter((i) => only.includes(i.out)) : MANIFEST;
if (only.length && QUEUE.length !== only.length) {
  const missing = only.filter((n) => !MANIFEST.some((i) => i.out === n));
  throw new Error(`not in the manifest: ${missing.join(', ')}`);
}

// A partial run — and the other pipeline's pictures — must not be forgotten.
const sizes = readSizes();

for (const item of QUEUE) {
  const img = sharp(item.src).rotate(); // respect EXIF
  const meta = await img.metadata();
  const full = Math.min(item.w ?? CAP, meta.width);   // never enlarged
  const small = Math.round(full / 2);
  const sat = item.sat ?? 0.9;                  // gentle desaturation = editorial grade
  const base = img.modulate({ saturation: sat });
  const write = async (width, file) => {
    let q;
    for (q of QUALITY) {
      await base.clone().resize({ width, kernel: 'lanczos3' }).webp({ quality: q }).toFile(file);
      if (fs.statSync(file).size <= BUDGET) break;
    }
    return q;
  };
  const q = await write(full, `${OUT}/${item.out}.webp`);
  await write(small, `${OUT}/${item.out}-sm.webp`);
  const done = await sharp(`${OUT}/${item.out}.webp`).metadata();
  const kb = Math.round(fs.statSync(`${OUT}/${item.out}.webp`).size / 1024);
  sizes[item.out] = { w: done.width, h: done.height, sm: small };
  console.log(`${item.out.padEnd(18)} ${meta.width}x${meta.height} -> ${done.width}x${done.height}  q${q} ${kb}KB`);
}

console.log(`DONE — ${SIZES_FILE} updated (${writeSizes(sizes)} pictures)`);
