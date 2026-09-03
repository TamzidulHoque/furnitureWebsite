/* ═══════════════════════════════════════════════════════════════
   THE CATALOGUE — the only file you edit to change the shop.

   TO ADD A PIECE:
     1. Drop the photo into  public/img/   (WebP or JPG, ~1000px wide)
     2. Copy any block below, paste it, change the fields.
   TO REMOVE A PIECE: delete its block.
   TO REORDER: move the block up or down.

   FIELD GUIDE
     id       unique short name, letters and dashes only
     name     shown on the card
     cat      one of the CATEGORIES keys below (beds/sofas/chairs/…)
     img      path to the photo, always starts with /img/
     world    classic | modern | noir — which style world it belongs to
     blurb    one line under the name
     spec     the material/size line inside Quick View
     tags     extra search words (the search box reads these)
     finish   which swatch rows Quick View shows: ['wood'] ['fabric'] or both
     hot      true = badge on the card ("Most Asked For")
     pos      optional — which part of a wide photo the card should show,
              e.g. '25% 25%' pulls the crop to the upper left. Leave it out
              and the card centres the photo.
   ═══════════════════════════════════════════════════════════════ */

export const CATEGORIES = [
  { key: 'all', label: 'All Pieces', note: 'the whole workshop' },
  { key: 'beds', label: 'Beds', note: 'headboards & bedroom' },
  { key: 'sofas', label: 'Sofas', note: 'living & lounge' },
  { key: 'chairs', label: 'Chairs', note: 'seating of every kind' },
  { key: 'dining', label: 'Dining', note: 'tables & chairs' },
  { key: 'storage', label: 'Storage', note: 'cabinets & consoles' },
  { key: 'office', label: 'Office', note: 'desks & workspaces' },
];

// Finishes offered on any made-to-order piece.
export const WOODS = [
  { name: 'Antique Oak', css: '#9a7038' },
  { name: 'Walnut', css: '#5d3d24' },
  { name: 'Mahogany', css: '#6e3122' },
  { name: 'Gilded Ivory', css: '#e6d9b6' },
  { name: 'Black Lacquer', css: '#1b1714' },
];

export const FABRICS = [
  { name: 'Champagne Velvet', css: '#d8c8a6' },
  { name: 'Royal Blue', css: '#263d74' },
  { name: 'Emerald', css: '#1f4d3f' },
  { name: 'Blush Rose', css: '#c98f89' },
  { name: 'Charcoal Linen', css: '#3d3c39' },
  { name: 'Ivory Silk', css: '#efe6d4' },
];

export const CATALOG = [
  // ───────────────────────── BEDS ─────────────────────────
  {
    id: 'royal-poster-bed',
    name: 'Royal Four-Poster Bed',
    cat: 'beds',
    img: '/img/bed-hero.webp',
    world: 'classic',
    blurb: 'Carved posts, deep-buttoned velvet headboard.',
    spec: 'Solid hardwood frame · velvet headboard · king, queen or your own size',
    tags: ['bed', 'poster', 'velvet', 'royal', 'carved', 'bedroom'],
    finish: ['wood', 'fabric'],
    hot: true,
  },
  {
    id: 'gilded-tufted-bed',
    name: 'Gilded Tufted Bed & Bench',
    cat: 'beds',
    img: '/img/bed-gold.webp',
    world: 'classic',
    blurb: 'Button-tufted headboard with a matching foot bench.',
    spec: 'Hand-carved crest · gold leaf detailing · bench included',
    tags: ['bed', 'tufted', 'gold', 'bench', 'bedroom'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'linen-panel-bed',
    name: 'Linen Panel Bed',
    cat: 'beds',
    img: '/img/bed-white.webp',
    world: 'modern',
    blurb: 'A quiet arch headboard in painted hardwood.',
    spec: 'Painted or natural finish · low platform · storage drawers optional',
    tags: ['bed', 'white', 'minimal', 'panel', 'bedroom', 'modern'],
    finish: ['wood'],
  },
  {
    id: 'showroom-suite',
    name: 'Blush Bedroom Suite',
    cat: 'beds',
    img: '/img/showroom-real.webp',
    world: 'modern',
    blurb: 'Bed, side tables and lounge chair as one set.',
    spec: 'Photographed in our Agrabad showroom · sold as a suite or piece by piece',
    tags: ['bed', 'suite', 'showroom', 'set', 'bedroom'],
    finish: ['wood', 'fabric'],
  },

  // ───────────────────────── SOFAS ─────────────────────────
  {
    id: 'royal-tufted-sofa',
    name: 'Royal Tufted Sofa',
    cat: 'sofas',
    img: '/img/living-royal.webp',
    world: 'classic',
    blurb: 'Deep buttoning, gilded frame, ballroom presence.',
    spec: 'Carved hardwood frame · hand-buttoned velvet · 3, 5 or 7 seats',
    tags: ['sofa', 'blue', 'velvet', 'tufted', 'living', 'royal', 'gold'],
    finish: ['wood', 'fabric'],
    pos: '26% 24%',
    hot: true,
  },
  {
    id: 'floral-salon-sofa',
    name: 'Floral Salon Sofa',
    cat: 'sofas',
    img: '/img/living-floral.webp',
    world: 'classic',
    blurb: 'Brocade upholstery on a gold-leaf frame.',
    spec: 'Carved crest rail · brocade or plain velvet · custom length',
    tags: ['sofa', 'floral', 'brocade', 'gold', 'living', 'salon'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'cream-chesterfield',
    name: 'Cream Chesterfield Set',
    cat: 'sofas',
    img: '/img/sofa-cream.webp',
    world: 'classic',
    blurb: 'Ivory buttoning with a matching centre table.',
    spec: 'Sofa, two armchairs and table · cushions included',
    tags: ['sofa', 'cream', 'chesterfield', 'set', 'ivory', 'living'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'grey-velvet-sofa',
    name: 'Grey Velvet Divan',
    cat: 'sofas',
    img: '/img/sofa-grey-velvet.webp',
    world: 'noir',
    blurb: 'Embroidered bolsters on a low carved frame.',
    spec: 'Velvet over hardwood · embroidered cushions · lounge or living room',
    tags: ['sofa', 'grey', 'velvet', 'divan', 'embroidered', 'living'],
    finish: ['wood', 'fabric'],
  },

  // ───────────────────────── CHAIRS ─────────────────────────
  {
    id: 'carved-armchair-pair',
    name: 'Carved Armchair Pair',
    cat: 'chairs',
    img: '/img/chairs-pair.webp',
    world: 'classic',
    blurb: 'Two hand-carved chairs around a glass table.',
    spec: 'Mahogany carving · striped silk seats · glass table included',
    tags: ['chair', 'armchair', 'pair', 'carved', 'mahogany', 'living', 'table'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'exec-leather-chair',
    name: 'Executive Leather Chair',
    cat: 'chairs',
    img: '/img/chair-exec-black.webp',
    world: 'noir',
    blurb: 'Tufted leather back, polished steel arms.',
    spec: 'Genuine or faux leather · height adjustable · five-star base',
    tags: ['chair', 'office', 'leather', 'executive', 'black', 'desk'],
    finish: ['fabric'],
    hot: true,
  },
  {
    id: 'wood-arm-exec-chair',
    name: 'Wood-Arm Executive Chair',
    cat: 'chairs',
    img: '/img/chair-exec-wood.webp',
    world: 'noir',
    blurb: 'Leather and polished wood, built for long days.',
    spec: 'Padded lumbar · wooden armrests · recline and tilt lock',
    tags: ['chair', 'office', 'leather', 'wood', 'executive', 'desk'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'mesh-task-chair',
    name: 'Mesh Task Chair',
    cat: 'chairs',
    img: '/img/chair-ergo.webp',
    world: 'modern',
    blurb: 'Breathable mesh with full ergonomic adjustment.',
    spec: 'Lumbar support · adjustable arms and headrest · tilt lock',
    tags: ['chair', 'office', 'mesh', 'ergonomic', 'task', 'desk', 'modern'],
    finish: ['fabric'],
  },

  // ───────────────────────── DINING ─────────────────────────
  {
    id: 'ivory-dining-set',
    name: 'Ivory Carved Dining Set',
    cat: 'dining',
    img: '/img/dining-cream.webp',
    world: 'classic',
    blurb: 'Six carved chairs around a lacquered table.',
    spec: 'Seats 6 or 8 · marble or wood top · chairs upholstered to order',
    tags: ['dining', 'table', 'chairs', 'ivory', 'cream', 'set', 'carved'],
    finish: ['wood', 'fabric'],
  },
  {
    id: 'gold-dining-table',
    name: 'Gold Leaf Dining Table',
    cat: 'dining',
    img: '/img/dining-floral.webp',
    world: 'classic',
    blurb: 'Turned legs and a gilded apron.',
    spec: 'Seats 6–10 · gold leaf over hardwood · matching chairs available',
    tags: ['dining', 'table', 'gold', 'gilded', 'carved', 'set'],
    finish: ['wood', 'fabric'],
    pos: '40% 30%',
  },
  {
    id: 'marble-dining-noir',
    name: 'Marble & Velvet Dining',
    cat: 'dining',
    img: '/img/dining-noir.webp',
    world: 'noir',
    blurb: 'Marble top, diamond-quilted velvet chairs.',
    spec: 'Marble or engineered stone top · quilted chairs · seats 4–8',
    tags: ['dining', 'marble', 'velvet', 'blush', 'noir', 'table', 'chairs'],
    finish: ['wood', 'fabric'],
    hot: true,
  },

  // ───────────────────────── STORAGE ─────────────────────────
  {
    id: 'gilded-display-cabinet',
    name: 'Gilded Display Cabinet',
    cat: 'storage',
    img: '/img/cabinet-gold.webp',
    world: 'classic',
    blurb: 'Glazed doors, carved crown, lit shelves.',
    spec: 'Toughened glass · internal lighting · three or five bays',
    tags: ['cabinet', 'storage', 'display', 'gold', 'glass', 'showcase'],
    finish: ['wood'],
  },
  {
    id: 'lacquer-console',
    name: 'Lacquer & Brass Console',
    cat: 'storage',
    img: '/img/console-noir.webp',
    world: 'noir',
    blurb: 'Black lacquer with brass pulls and open display.',
    spec: 'High-gloss lacquer · brass hardware · closed and open storage',
    tags: ['console', 'storage', 'black', 'lacquer', 'brass', 'noir', 'cabinet'],
    finish: ['wood'],
  },

  // ───────────────────────── OFFICE ─────────────────────────
  {
    id: 'director-desk',
    name: "Director's Desk",
    cat: 'office',
    img: '/img/office-director.webp',
    world: 'modern',
    blurb: 'A clean private office, desk and storage in one line.',
    spec: 'Laminate or veneer top · cable management · side credenza',
    tags: ['desk', 'office', 'director', 'workspace', 'modern', 'storage'],
    finish: ['wood'],
  },
  {
    id: 'manager-desk',
    name: 'Manager Desk Row',
    cat: 'office',
    img: '/img/office-desk.webp',
    world: 'modern',
    blurb: 'Paired desks with drawer units under each.',
    spec: 'Made to your floor plan · drawers and pedestals included',
    tags: ['desk', 'office', 'manager', 'workspace', 'modern'],
    finish: ['wood'],
  },
  {
    id: 'workstation-bank',
    name: 'Workstation Bank',
    cat: 'office',
    img: '/img/office-team.webp',
    world: 'modern',
    blurb: 'Screened desks for a whole floor.',
    spec: 'Four, six or eight seats · privacy screens · power routing',
    tags: ['desk', 'office', 'workstation', 'team', 'cubicle', 'modern'],
    finish: ['wood'],
  },
  {
    id: 'conference-table',
    name: 'Conference Table',
    cat: 'office',
    img: '/img/office-conf.webp',
    world: 'modern',
    blurb: 'One continuous top, built to the room.',
    spec: 'Up to 16 seats · veneer or laminate · power and data grommets',
    tags: ['table', 'office', 'conference', 'meeting', 'boardroom', 'modern'],
    finish: ['wood'],
  },
  {
    id: 'lounge-round-table',
    name: 'Breakout Lounge Set',
    cat: 'office',
    img: '/img/office-lounge.webp',
    world: 'modern',
    blurb: 'Round table with four moulded chairs.',
    spec: 'Round or square top · four to six chairs · café or breakout use',
    tags: ['table', 'office', 'lounge', 'breakout', 'cafe', 'chairs', 'modern'],
    finish: ['wood', 'fabric'],
  },
];

// counts used by the filter tabs
export const countFor = (key) =>
  key === 'all' ? CATALOG.length : CATALOG.filter((p) => p.cat === key).length;

export const byId = (id) => CATALOG.find((p) => p.id === id);
