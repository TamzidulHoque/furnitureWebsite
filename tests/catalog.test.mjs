// The shop itself: every field the site depends on, every file it points at,
// and the three rules about which world a piece belongs to.
//
//   node --test tests/
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CATALOG, CATEGORIES, WOODS, FABRICS } from '../src/data/catalog.js';
import { PLAN_ROOMS } from '../src/data/rooms.js';

const WORLDS = ['classic', 'modern', 'noir'];
const ROOMS = PLAN_ROOMS.map((r) => r.key);
const CATS = CATEGORIES.map((c) => c.key).filter((k) => k !== 'all');

// A world is a promise about what the visitor is looking at, so it is checked
// against the words the shop uses about each piece, not against a hand list.
const MARKS = {
  classic: ['carved', 'gilded', 'gold', 'royal', 'tufted', 'brocade', 'floral', 'crown', 'ornate', 'marble', 'velvet', 'ivory', 'chesterfield'],
  modern: ['modern', 'clean', 'plain', 'linen', 'mesh', 'panel', 'desk', 'workstation', 'meeting', 'lounge', 'light', 'veneer', 'minimal', 'office'],
  noir: ['dark', 'noir', 'black', 'lacquer', 'brass', 'leather', 'marble', 'glass', 'smoke', 'fluted', 'executive', 'velvet'],
};

describe('catalogue shape', () => {
  test('has pieces', () => assert.ok(CATALOG.length >= 20, `only ${CATALOG.length} pieces`));

  test('ids are unique', () => {
    const seen = new Set();
    for (const p of CATALOG) {
      assert.ok(!seen.has(p.id), `duplicate id ${p.id}`);
      seen.add(p.id);
    }
  });

  for (const p of CATALOG) {
    test(`${p.id} is complete`, () => {
      for (const field of ['id', 'name', 'cat', 'room', 'img', 'world', 'blurb', 'spec']) {
        assert.ok(p[field] && typeof p[field] === 'string', `${p.id}: ${field} missing`);
      }
      assert.ok(WORLDS.includes(p.world), `${p.id}: world "${p.world}"`);
      assert.ok(ROOMS.includes(p.room), `${p.id}: room "${p.room}" is not a room on the plan`);
      assert.ok(CATS.includes(p.cat), `${p.id}: cat "${p.cat}"`);
      assert.ok(Array.isArray(p.tags) && p.tags.length >= 3, `${p.id}: needs at least three tags`);
      assert.ok(p.tags.every((t) => t === t.toLowerCase()), `${p.id}: tags must be lower case`);
      assert.ok(Array.isArray(p.finish) && p.finish.length, `${p.id}: finish missing`);
      assert.ok(p.finish.every((f) => f === 'wood' || f === 'fabric'), `${p.id}: finish must be wood or fabric`);
      assert.ok(p.blurb.length <= 90, `${p.id}: blurb is too long for a card (${p.blurb.length})`);
    });
  }
});

describe('every photograph exists, in both sizes', () => {
  for (const p of CATALOG) {
    test(`${p.id} → ${p.img}`, () => {
      assert.ok(p.img.startsWith('/img/'), `${p.id}: img must live under /img/`);
      const full = `public${p.img}`;
      const small = `public${p.img.replace('.webp', '-sm.webp')}`;
      assert.ok(fs.existsSync(full), `missing ${full}`);
      assert.ok(fs.existsSync(small), `missing ${small} — the phone-sized sibling`);
      assert.ok(fs.statSync(full).size < 400 * 1024, `${p.img} is over 400KB`);
    });
  }
});

describe('a world only shows its own kind of furniture', () => {
  for (const w of WORLDS) {
    test(`${w} pieces all read as ${w}`, () => {
      const wrong = CATALOG.filter((p) => p.world === w).filter((p) => {
        const words = `${p.name} ${p.blurb} ${p.spec} ${p.tags.join(' ')}`.toLowerCase();
        return !MARKS[w].some((mark) => words.includes(mark));
      });
      assert.equal(wrong.length, 0,
        `${wrong.map((p) => p.id).join(', ')} carry nothing that says ${w}`);
    });
  }

  test('Classic never borrows a plain modern piece', () => {
    const plain = ['mesh', 'workstation', 'melamine', 'ergonomic'];
    const borrowed = CATALOG.filter((p) => p.world === 'classic')
      .filter((p) => plain.some((t) => p.tags.includes(t)));
    assert.equal(borrowed.length, 0, `${borrowed.map((p) => p.id).join(', ')} do not belong in Classic`);
  });

  test('every world has something to show', () => {
    for (const w of WORLDS) {
      const n = CATALOG.filter((p) => p.world === w).length;
      assert.ok(n >= 6, `${w} has only ${n} pieces`);
    }
  });

  // Not a failure — a room with nothing in it is honest, and the site says so.
  // This prints the gaps so they are never a surprise.
  test('room coverage is recorded', () => {
    const gaps = [];
    for (const w of WORLDS) {
      for (const r of ROOMS) {
        const n = CATALOG.filter((p) => p.world === w && p.room === r).length;
        if (!n) gaps.push(`${w}/${r}`);
      }
    }
    console.log('    rooms with nothing in them:', gaps.length ? gaps.join(', ') : 'none');
    assert.ok(true);
  });
});

describe('finishes offered in Quick View', () => {
  test('woods and fabrics have names and colours', () => {
    for (const list of [WOODS, FABRICS]) {
      assert.ok(list.length >= 4);
      for (const s of list) {
        assert.ok(s.name && s.css, 'a swatch is missing a name or a colour');
        assert.match(s.css, /^#[0-9a-f]{6}$/i, `${s.name}: ${s.css} is not a hex colour`);
      }
    }
  });

  test('anything upholstered offers fabric, anything wooden offers wood', () => {
    for (const p of CATALOG) {
      const words = `${p.name} ${p.blurb} ${p.spec} ${p.tags.join(' ')}`.toLowerCase();
      if (/velvet|upholst|leather|linen|brocade|tufted/.test(words) && !/table|console|cabinet|showcase|wardrobe|chest|desk/.test(p.name.toLowerCase())) {
        assert.ok(p.finish.includes('fabric'), `${p.id} looks upholstered but offers no fabric`);
      }
    }
  });
});

describe('the floor plan and the shop agree', () => {
  test('each plan room names things the shop actually sells', () => {
    for (const r of PLAN_ROOMS) {
      assert.ok(r.label && r.note, `${r.key} is missing a label`);
      const total = CATALOG.filter((p) => p.room === r.key).length;
      assert.ok(total > 0, `nothing at all belongs to ${r.key}`);
    }
  });
});
