// Every route a visitor can take, in all three worlds, against the built site.
//
//   npm run build && node --test tests/e2e.test.mjs
//
// The suite starts its own preview server and closes it again, so it can be
// run on a clean machine with nothing else set up.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { CATALOG } from '../src/data/catalog.js';

const PORT = 4188;
const URL = `http://localhost:${PORT}`;
const WORLDS = ['classic', 'modern', 'noir'];
const inWorld = (w) => CATALOG.filter((p) => p.world === w);

let server, browser;

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('preview server did not start');
};

before(async () => {
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
  await waitForServer();
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.kill();
  // vite spawns through a shell on Windows; make sure the port is really free
  spawn('npx', ['kill-port', String(PORT)], { shell: true, stdio: 'ignore' }).unref?.();
});

/** A page that records anything the browser complains about. */
const openPage = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`EXCEPTION ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && problems.push(`CONSOLE ${m.text()}`));
  page.on('requestfailed', (r) => {
    const why = r.failure()?.errorText ?? '';
    // the film is paused, and its download cancelled, whenever it scrolls away
    if (/\.mp4$/.test(r.url()) && /ABORTED|CANCELED|CANCELLED/i.test(why)) return;
    problems.push(`REQFAIL ${r.url()} ${why}`);
  });
  page.problems = problems;
  page.ctx = ctx;
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('.wall .pc', { timeout: 15000 });
  // the entrance curtain covers the whole viewport until the app has painted;
  // anything that clicks or hovers before it lifts is clicking the curtain
  await page.waitForSelector('#boot', { state: 'detached', timeout: 15000 }).catch(() => {});
  return page;
};

const sweep = (page) => page.evaluate(async () => {
  const go = (y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  for (let y = 0; y <= document.body.scrollHeight; y += 420) { go(y); await new Promise((r) => setTimeout(r, 35)); }
  go(0);
});

const switchWorld = async (page, i) => {
  await page.evaluate((n) => document.querySelectorAll('.ms-btn')[n].click(), i);
  await page.waitForFunction((w) => document.documentElement.dataset.mode === w, WORLDS[i], { timeout: 8000 });
  await page.waitForTimeout(900);   // the wipe finishes
};

const pieceCount = (page) => page.locator('.wall .pc').count();

/** Open a piece and wait for the dialog to finish arriving. */
const openPiece = async (page, nth = 0) => {
  await page.locator('.wall .pc-hit').nth(nth).click();
  await page.waitForSelector('.qv-card');
  await page.waitForFunction(() => {
    const t = getComputedStyle(document.querySelector('.qv-card')).transform;
    return t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(t);
  }, null, { timeout: 8000 });
};

// ───────────────────────────── arriving ─────────────────────────────

describe('arriving', () => {
  test('opens in Classic', async () => {
    const page = await openPage();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.mode), 'classic');
    await page.ctx.close();
  });

  test('opens in Classic even after choosing another world last time', async () => {
    const page = await openPage();
    await switchWorld(page, 2);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.mode), 'noir');
    const again = await page.ctx.newPage();
    await again.goto(URL, { waitUntil: 'load' });
    await again.waitForTimeout(1500);
    assert.equal(await again.evaluate(() => document.documentElement.dataset.mode), 'classic');
    assert.equal(await again.evaluate(() => localStorage.getItem('heaven-mode')), null);
    await page.ctx.close();
  });

  test('the whole page loads without a single error', async () => {
    const page = await openPage();
    await sweep(page);
    await page.waitForTimeout(600);
    assert.deepEqual([...new Set(page.problems)], []);
    await page.ctx.close();
  });

  test('every picture on the page actually loads', async () => {
    const page = await openPage();
    await sweep(page);
    await page.waitForTimeout(1200);
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.currentSrc && (!i.complete || i.naturalWidth === 0))
        .map((i) => i.currentSrc));
    assert.deepEqual(broken, []);
    await page.ctx.close();
  });

  test('nothing hangs off the right edge, at any width', async () => {
    for (const width of [1440, 1024, 820, 390]) {
      const page = await openPage({ viewport: { width, height: 900 } });
      await sweep(page);
      const canScrollX = await page.evaluate(() => {
        document.documentElement.scrollLeft = 9999;
        return document.documentElement.scrollLeft || document.body.scrollLeft || window.scrollX;
      });
      assert.equal(canScrollX, 0, `the page scrolls sideways at ${width}px`);
      await page.ctx.close();
    }
  });

  test('every link in the page points at something', async () => {
    const page = await openPage();
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h !== '#' && !document.querySelector(h)));
    assert.deepEqual(bad, []);
    await page.ctx.close();
  });
});

// ───────────────────────── the three worlds ─────────────────────────

describe('each world shows its own furniture', () => {
  for (const [i, world] of WORLDS.entries()) {
    test(`${world} hangs exactly its ${inWorld(world).length} pieces`, async () => {
      const page = await openPage();
      if (i) await switchWorld(page, i);
      assert.equal(await pieceCount(page), inWorld(world).length);

      // and they are the right ones
      const shown = await page.evaluate(() =>
        [...document.querySelectorAll('.wall .pc h3')].map((h) => h.textContent.trim()));
      const expected = inWorld(world).map((p) => p.name);
      assert.deepEqual([...shown].sort(), [...expected].sort());
      await page.ctx.close();
    });

    test(`${world}'s plan counts match its rooms`, async () => {
      const page = await openPage();
      if (i) await switchWorld(page, i);
      const counts = await page.evaluate(() =>
        [...document.querySelectorAll('.fp-count')].map((n) => Number(n.textContent)));
      const rooms = await page.evaluate(() =>
        [...document.querySelectorAll('.fp-room')].map((g) => g.getAttribute('aria-label').split(' —')[0].toLowerCase()));
      rooms.forEach((label, n) => {
        const key = label === 'living' ? 'living' : label;
        const expected = inWorld(world).filter((p) => p.room === key).length;
        assert.equal(counts[n], expected, `${world}/${label}`);
      });
      await page.ctx.close();
    });
  }

  test('a room a world does not build says so, and offers the world that does', async () => {
    const page = await openPage();
    await switchWorld(page, 1);                        // Modern has no living room
    await page.evaluate(() => document.querySelectorAll('.fp-room')[1]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(700);
    assert.equal(await pieceCount(page), 0);
    const said = await page.textContent('.pc-empty');
    assert.match(said, /No living piece stands on the Modern floor/i);
    assert.match(said, /Classic/);
    // and the way out works
    await page.click('.pc-empty .linkish');
    await page.waitForFunction(() => document.documentElement.dataset.mode === 'classic');
    await page.waitForTimeout(1200);
    assert.ok(await pieceCount(page) > 0);
    await page.ctx.close();
  });
});

// ────────────────────────── browsing the house ──────────────────────

describe('browsing', () => {
  test('a room on the plan filters the wall, and clicking again clears it', async () => {
    const page = await openPage();
    const all = await pieceCount(page);
    await page.evaluate(() => document.querySelectorAll('.fp-room')[0]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(800);
    const bedroom = inWorld('classic').filter((p) => p.room === 'bedroom').length;
    assert.equal(await pieceCount(page), bedroom);
    await page.evaluate(() => document.querySelectorAll('.fp-room')[0]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(800);
    assert.equal(await pieceCount(page), all);
    await page.ctx.close();
  });

  test('hovering a room lights that room and dims the rest', async () => {
    const page = await openPage();
    await page.locator('.fp-room').nth(1).hover();
    await page.waitForTimeout(450);
    const lit = await page.locator('.wall .pc.lit').count();
    assert.equal(lit, inWorld('classic').filter((p) => p.room === 'living').length);
    const dim = await page.evaluate(() =>
      [...document.querySelectorAll('.wall .pc')].filter((e) => +getComputedStyle(e).opacity < 0.6).length);
    assert.ok(dim > 0, 'nothing dimmed');
    await page.ctx.close();
  });

  test('search filters, redraws the plan, and can be cleared', async () => {
    const page = await openPage();
    const all = await pieceCount(page);
    await page.fill('.col-search input', 'carved');
    await page.waitForTimeout(700);
    const hits = await pieceCount(page);
    assert.ok(hits > 0 && hits < all, `carved gave ${hits} of ${all}`);
    const planTotal = await page.evaluate(() =>
      [...document.querySelectorAll('.fp-count')].reduce((s, n) => s + Number(n.textContent), 0));
    assert.equal(planTotal, hits, 'the plan does not agree with the wall');
    await page.fill('.col-search input', '');
    await page.waitForTimeout(700);
    assert.equal(await pieceCount(page), all);
    await page.ctx.close();
  });

  test('a search with no answer offers to ask the workshop', async () => {
    const page = await openPage();
    await page.fill('.col-search input', 'trampoline');
    await page.waitForTimeout(700);
    assert.equal(await pieceCount(page), 0);
    const href = await page.getAttribute('.pc-empty a', 'href');
    assert.match(href, /wa\.me|whatsapp/i);
    assert.match(decodeURIComponent(href), /trampoline/);
    await page.ctx.close();
  });

  test('the keyboard can walk the plan', async () => {
    const page = await openPage();
    await page.locator('.fp-room').first().focus();
    const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineWidth);
    assert.notEqual(ring, '0px', 'the focused room has no visible ring');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    assert.equal(await pieceCount(page), inWorld('classic').filter((p) => p.room === 'bedroom').length);
    await page.ctx.close();
  });
});

// ───────────────────────────── quick view ───────────────────────────

describe('quick view', () => {
  test('opens, steps through pieces, and closes back to where it started', async () => {
    const page = await openPage();
    await openPiece(page);
    const first = await page.textContent('.qv-name');

    // prev / next / close are reachable without scrolling
    const bar = await page.evaluate(() => {
      const r = document.querySelector('.qv-bar').getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, h: innerHeight };
    });
    assert.ok(bar.top >= 0 && bar.bottom <= bar.h, 'the prev/next bar needs scrolling to reach');

    await page.click('.qv-bar button:nth-child(3)');   // next
    await page.waitForTimeout(600);
    assert.notEqual(await page.textContent('.qv-name'), first);
    await page.keyboard.press('ArrowLeft');            // and back
    await page.waitForTimeout(600);
    assert.equal(await page.textContent('.qv-name'), first);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    assert.equal(await page.locator('.qv-card').count(), 0);
    assert.ok(await page.evaluate(() => !!document.activeElement.closest('.wall')),
      'focus did not come back to the piece');
    await page.ctx.close();
  });

  test('the WhatsApp message names the piece and the finishes chosen', async () => {
    const page = await openPage();
    await openPiece(page);
    const name = (await page.textContent('.qv-name')).trim();
    const swatches = await page.locator('.qv-right .swatch').count();
    if (swatches > 1) {
      await page.locator('.qv-right .swatch').nth(1).click();
      await page.waitForTimeout(300);
    }
    const href = decodeURIComponent(await page.getAttribute('.config-cta a', 'href'));
    assert.match(href, /wa\.me|whatsapp/i);
    assert.ok(href.includes(name), 'the message does not name the piece');
    await page.ctx.close();
  });

  test('the panel scrolls and its button stays reachable on a short window', async () => {
    const page = await openPage({ viewport: { width: 1280, height: 620 } });
    await openPiece(page);
    const state = await page.evaluate(() => {
      const card = document.querySelector('.qv-card');
      card.scrollTop = 40;
      return {
        scrolled: card.scrollTop,
        ctaVisible: document.querySelector('.config-cta').getBoundingClientRect().bottom <= innerHeight,
      };
    });
    assert.ok(state.scrolled > 0, 'the panel will not scroll');
    assert.ok(state.ctaVisible, 'the WhatsApp button is below the fold');
    await page.ctx.close();
  });
});

// ───────────────────────────── design finder ────────────────────────

describe('design finder', () => {
  test('three questions lead to three real pieces', async () => {
    const page = await openPage();
    await sweep(page);
    assert.equal(await page.textContent('.finder-steps .on span'), '1');
    await page.locator('.finder-stage .opt').first().click();      // a bedroom
    await page.waitForTimeout(700);
    assert.equal(await page.textContent('.finder-steps .on span'), '2');
    await page.locator('.finder-stage .opt').first().click();      // ornate & carved
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('.finder-picks .fp').count(), 3);
    const brief = decodeURIComponent(await page.getAttribute('.finder-result .config-cta a', 'href'));
    assert.match(brief, /Looking for/);
    assert.match(brief, /Style/);
    await page.ctx.close();
  });

  test('changing the world elsewhere starts the questions again', async () => {
    const page = await openPage();
    await sweep(page);
    await page.locator('.finder-stage .opt').first().click();
    await page.waitForTimeout(600);
    await page.locator('.finder-stage .opt').first().click();
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('.finder-picks .fp').count(), 3);

    await switchWorld(page, 2);
    await page.waitForTimeout(600);
    assert.equal(await page.textContent('.finder-steps .on span'), '1');
    assert.equal(await page.locator('.finder-picks .fp').count(), 0);
    await page.ctx.close();
  });
});

// ─────────────────────────── shop the room ──────────────────────────

describe('shop the room', () => {
  test('a hotspot opens the piece it points at', async () => {
    const page = await openPage();
    await sweep(page);
    await page.evaluate(() => document.querySelector('.str-dot').click());
    await page.waitForTimeout(900);
    const opened = await page.locator('.qv-card').count();
    const jumped = await page.evaluate(() => document.querySelector('.plan-now-k')?.textContent);
    assert.ok(opened === 1 || (jumped && jumped !== 'The whole house'),
      'the hotspot neither opened a piece nor moved to a room');
    await page.ctx.close();
  });
});

// ───────────────────────────── the film ─────────────────────────────

describe('the showroom film', () => {
  test('is not fetched until it is reached, then plays muted and loops', async () => {
    const page = await openPage();
    const before = await page.evaluate(() => {
      const v = document.querySelector('.proof-video video');
      return { exists: !!v, paused: v.paused, network: v.networkState };
    });
    assert.ok(before.exists);
    assert.equal(before.paused, true, 'the film started before it was on screen');
    assert.notEqual(before.network, 2, 'the film was being downloaded before it was reached');

    await page.evaluate(() => {
      const el = document.querySelector('.proof-video');
      const y = el.getBoundingClientRect().top + window.scrollY - 200;
      window.__lenis.scrollTo(y, { immediate: true, force: true });
    });
    await page.waitForFunction(() => !document.querySelector('.proof-video video').paused, null, { timeout: 15000 });
    const playing = await page.evaluate(() => {
      const v = document.querySelector('.proof-video video');
      return { paused: v.paused, muted: v.muted, loop: v.loop };
    });
    assert.deepEqual(playing, { paused: false, muted: true, loop: true });

    await page.evaluate(() => window.__lenis.scrollTo(0, { immediate: true, force: true }));
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.querySelector('.proof-video video').paused), true,
      'the film kept playing after it scrolled away');
    await page.ctx.close();
  });
});

// ──────────────────────────── reduced motion ────────────────────────

describe('a visitor who asked for less motion', () => {
  test('sees everything, and nothing starts by itself', async () => {
    const page = await openPage({ reducedMotion: 'reduce' });
    await sweep(page);
    await page.waitForTimeout(600);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('.rv, .rv-img')].filter((e) => +getComputedStyle(e).opacity < 0.9).length);
    assert.equal(hidden, 0, `${hidden} sections never appeared`);
    assert.equal(await page.evaluate(() => document.querySelector('.proof-video video').paused), true);
    assert.equal(await page.evaluate(() => document.querySelector('.proof-video video').controls), true,
      'without autoplay there must be controls');
    // and the site still works
    await page.evaluate(() => document.querySelectorAll('.fp-room')[0]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(600);
    assert.equal(await pieceCount(page), inWorld('classic').filter((p) => p.room === 'bedroom').length);
    await page.ctx.close();
  });
});

// ───────────────────────────── the phone ────────────────────────────

describe('on a phone', () => {
  test('the house, the wall and a piece all work at 390px', async () => {
    const page = await openPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await sweep(page);
    assert.equal(await pieceCount(page), inWorld('classic').length);
    await page.evaluate(() => document.querySelectorAll('.fp-room')[0]
      .dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.waitForTimeout(700);
    assert.equal(await pieceCount(page), inWorld('classic').filter((p) => p.room === 'bedroom').length);
    await openPiece(page);
    const barVisible = await page.evaluate(() => {
      const r = document.querySelector('.qv-bar').getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    });
    assert.ok(barVisible, 'the prev/next bar is off screen on a phone');
    await page.ctx.close();
  });
});
