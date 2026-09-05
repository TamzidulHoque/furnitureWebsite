// The four rooms of the house the collection is browsed through: their walls
// (in the plan's own coordinate space), what each one holds, and the furniture
// glyphs drawn inside them. Plain data, so the tests can read it without a
// browser or a JSX loader.
export const PLAN_ROOMS = [
  {
    key: 'bedroom',
    label: 'Bedroom',
    note: 'beds · wardrobes · chests',
    x: 24, y: 24, w: 336, h: 232,
    glyphs: [
      { t: 'r', x: 120, y: 104, w: 148, h: 100 },    // bed
      { t: 'r', x: 92, y: 116, w: 22, h: 30 },       // side tables
      { t: 'r', x: 274, y: 116, w: 22, h: 30 },
      { t: 'r', x: 42, y: 214, w: 118, h: 28 },      // wardrobe run
      { t: 'r', x: 250, y: 214, w: 74, h: 28 },      // chest
    ],
  },
  {
    key: 'living',
    label: 'Living',
    note: 'sofas · chairs · showcases',
    x: 360, y: 24, w: 436, h: 232,
    glyphs: [
      { t: 'r', x: 404, y: 100, w: 176, h: 38 },     // long sofa
      { t: 'r', x: 404, y: 152, w: 38, h: 84 },      // return sofa
      { t: 'r', x: 462, y: 162, w: 92, h: 48 },      // centre table
      { t: 'c', x: 618, y: 126, r: 22 },             // armchairs
      { t: 'c', x: 618, y: 198, r: 22 },
      { t: 'r', x: 706, y: 100, w: 26, h: 136 },     // showcase against the wall
    ],
  },
  {
    key: 'dining',
    label: 'Dining',
    note: 'tables · chairs',
    x: 24, y: 256, w: 312, h: 190,
    glyphs: [
      { t: 'r', x: 108, y: 344, w: 148, h: 68 },     // table
      { t: 'r', x: 122, y: 326, w: 30, h: 12 },      // chairs
      { t: 'r', x: 168, y: 326, w: 30, h: 12 },
      { t: 'r', x: 214, y: 326, w: 30, h: 12 },
      { t: 'r', x: 122, y: 418, w: 30, h: 12 },
      { t: 'r', x: 168, y: 418, w: 30, h: 12 },
      { t: 'r', x: 214, y: 418, w: 30, h: 12 },
    ],
  },
  {
    key: 'office',
    label: 'Office',
    note: 'desks · seating · meeting',
    x: 336, y: 256, w: 460, h: 190,
    glyphs: [
      { t: 'r', x: 378, y: 330, w: 104, h: 40 },     // desks
      { t: 'c', x: 430, y: 390, r: 14 },
      { t: 'r', x: 510, y: 330, w: 104, h: 40 },
      { t: 'c', x: 562, y: 390, r: 14 },
      { t: 'r', x: 660, y: 330, w: 108, h: 86 },     // meeting table
    ],
  },
];
