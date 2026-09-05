import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Ornament from './Ornament.jsx';
import ModeSwitch from './ModeSwitch.jsx';
import QuickView from './QuickView.jsx';
import FloorPlan, { PLAN_ROOMS } from './FloorPlan.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';
import { srcset } from '../lib/img.js';
import { CATALOG } from '../data/catalog.js';

gsap.registerPlugin(Flip, ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// search reads name, category, room and the tag list
const matches = (p, q) => {
  if (!q) return true;
  const hay = `${p.name} ${p.cat} ${p.room} ${p.blurb} ${p.tags.join(' ')}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

// Each world shows its own furniture. Classic is carved and gilded, Modern is
// plain and straight, Noir is lacquer and brass — showing all 33 pieces in
// every world made the three worlds look like one shop with three paint jobs.
const inWorld = (world) => CATALOG.filter((p) => p.world === world);

// which other world does build for this room — the answer when a room is
// empty here, since the mode switch is the way out
const elsewhere = (roomKey, world) =>
  ['classic', 'modern', 'noir'].find(
    (w) => w !== world && CATALOG.some((p) => p.world === w && p.room === roomKey),
  );

const countRooms = (list) =>
  PLAN_ROOMS.reduce((acc, r) => {
    acc[r.key] = list.filter((p) => p.room === r.key).length;
    return acc;
  }, {});

export default function Collection() {
  const { m, setMode, MODES } = useMode();
  const [room, setRoom] = useState(null);      // null = the whole house
  const [peek, setPeek] = useState(null);      // room under the cursor
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const gridRef = useRef(null);
  const secRef = useRef(null);
  const firstRun = useRef(true);
  const swapping = useRef(false);      // a world change is under way
  const anchor = useRef(null);         // the foot of this section, pre-swap

  // A world switch changes how many pieces hang here, and the reader is
  // usually standing below this section — so the page would slide out from
  // under them. This runs during render, before React touches the DOM, so the
  // height recorded is still the one they are looking at; the layout effect
  // below gives the difference back.
  const [seenMode, setSeenMode] = useState(m.key);
  if (seenMode !== m.key) {
    setSeenMode(m.key);
    setRoom(null);
    setQ('');
    swapping.current = true;
    // where the foot of this section sits on screen right now, and whether the
    // reader is already past it — both read before React touches the DOM
    const box = secRef.current?.getBoundingClientRect();
    anchor.current = box && box.bottom < 0 ? box.bottom : null;
  }

  // what the search left standing, before a room is chosen — the plan counts
  // come from this, so typing "velvet" redraws the house as a velvet map
  const world = useMemo(() => inWorld(m.key), [m.key]);
  const searched = useMemo(() => world.filter((p) => matches(p, q)), [world, q]);
  const counts = useMemo(() => countRooms(searched), [searched]);
  const shown = useMemo(
    () => searched.filter((p) => !room || p.room === room),
    [searched, room],
  );

  // FLIP: record where every piece sits, let React re-render, then send
  // each one from its old box to its new one.
  const flipState = useRef(null);
  const fromH = useRef(0);
  const prevIds = useRef(null);
  const captureFlip = () => {
    if (reduced() || !gridRef.current) return;
    fromH.current = gridRef.current.offsetHeight;
    flipState.current = Flip.getState(gridRef.current.querySelectorAll('.pc'));
  };

  useLayoutEffect(() => {
    const ids = shown.map((p) => p.id).join();
    if (firstRun.current) { firstRun.current = false; prevIds.current = ids; return; }
    if (!swapping.current && (!flipState.current || ids === prevIds.current)) {
      flipState.current = null;
      return;
    }
    prevIds.current = ids;

    const grid = gridRef.current;
    const toH = grid.offsetHeight;
    gsap.killTweensOf(grid);

    if (swapping.current) {
      // the wipe is already covering the screen; no one sees a re-hang, and
      // the only thing that matters is where the page is left standing
      swapping.current = false;
      grid.style.height = '';
      // pin the foot of the section back where it was, so whatever the reader
      // was looking at below stays under their eyes
      if (anchor.current !== null && secRef.current) {
        const delta = secRef.current.getBoundingClientRect().bottom - anchor.current;
        if (Math.abs(delta) > 1) {
          const y = (window.__lenis?.scroll ?? window.scrollY) + delta;
          if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo(0, y);
        }
      }
      anchor.current = null;
      flipState.current = null;
      return;
    }

    Flip.from(flipState.current, {
      duration: 0.62,
      ease: 'power3.inOut',
      stagger: 0.024,
      absolute: true,
      scale: true,
      onEnter: (els) =>
        gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.03 }),
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.32, ease: 'power2.in' }),
    });

    // absolute:true lifts every piece out of flow, so without this the spread
    // collapses to nothing mid-flight and the dark section below rides up over
    // the animation. Hold the height and ease it to its new value.
    gsap.fromTo(grid, { height: fromH.current }, {
      height: toH,
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => { grid.style.height = ''; },
    });
    flipState.current = null;
  }, [shown]);

  const pickRoom = (key) => { captureFlip(); setQ(''); setRoom(key); };
  // a search looks through the whole house, not just the open room —
  // otherwise "velvet" inside Office reads as "we don't make it"
  const type = (v) => { captureFlip(); setQ(v); if (v) setRoom(null); };
  const showAll = () => { captureFlip(); setQ(''); setRoom(null); };


  // the room hotspots and the Finder send people here pointed at a room
  useEffect(() => {
    const on = (e) => {
      const next = e.detail?.room;
      if (!next || next === room) return;
      captureFlip();
      setQ('');
      setRoom(next);
    };
    window.addEventListener('hfm:filter', on);
    return () => window.removeEventListener('hfm:filter', on);
  }, [room]);

  // The wall drifts as it passes: three depth bands, one scroll trigger and
  // three setters for the whole wall — a trigger per piece would cost more
  // than the effect is worth.
  useEffect(() => {
    if (reduced() || !gridRef.current) return;
    const wall = gridRef.current;
    const bands = [0, 1, 2]
      .map((b, i) => {
        const els = wall.querySelectorAll(`.pw-d${b} .pw-in`);
        return els.length ? { set: gsap.quickSetter(els, 'y', 'px'), k: [-26, 0, 17][i] } : null;
      })
      .filter(Boolean);
    if (!bands.length) return;
    const st = ScrollTrigger.create({
      trigger: wall,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const p = self.progress - 0.5;
        bands.forEach((b) => b.set(p * b.k));
      },
    });
    return () => {
      st.kill();
      gsap.set(wall.querySelectorAll('.pw-in'), { y: 0 });
    };
  }, [shown]);

  const openIdx = openId ? shown.findIndex((p) => p.id === openId) : -1;
  const step = (d) => {
    if (openIdx < 0) return;
    setOpenId(shown[(openIdx + d + shown.length) % shown.length].id);
  };

  const here = PLAN_ROOMS.find((r) => r.key === room);
  const other = room ? elsewhere(room, m.key) : null;

  return (
    <section className="collection sec-light alt" id="collections" ref={secRef}>
      <Ornament variant="a" pos="tr" />
      <div className="container">
        <div className="col-head">
          <div className="rv">
            <p className="eyebrow">The Collection — {world.length} {m.name} pieces</p>
            <h2 className="display" style={{ marginTop: 18 }}>
              Walk the house. <em>Take what fits yours.</em>
            </h2>
          </div>
          <div className="rv" data-rv-delay="0.1">
            <p className="lede">
              Every piece here left our own workshop, and every one can be rebuilt in
              your wood, your fabric, your measurements.
            </p>
            <ModeSwitch compact />
          </div>
        </div>

        <div className="plan-wrap rv" data-rv-delay="0.15">
          <FloorPlan active={room} counts={counts} onPick={pickRoom} onPeek={setPeek} />
          <div className="plan-side">
            <div className="plan-now">
              <span className="plan-now-k">{here ? here.label : 'The whole house'}</span>
              <span className="plan-now-n">
                {q ? `${shown.length} matching` : `${here ? counts[here.key] : world.length} pieces`}
              </span>
              {(room || q) && (
                <button className="linkish" onClick={showAll}>Show the whole house</button>
              )}
            </div>
            <div className="col-search">
              <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12.8" y1="12.8" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                type="search"
                value={q}
                placeholder="Search the house…"
                aria-label="Search the collection"
                onChange={(e) => type(e.target.value)}
              />
              {q && <button className="col-clear" onClick={() => type('')} aria-label="Clear search">×</button>}
            </div>
          </div>
        </div>

        <div className="salon">
          <div className={`wall${peek ? ' peeking' : ''}`} ref={gridRef}>
            {shown.map((p, i) => (
              <article
                // a photo rescued from a small original hangs in a small frame
                className={`pc ${p.soft ? 'pw-soft' : `pw${i % 9}`} pw-d${i % 3}${peek && p.room === peek ? ' lit' : ''}`}
                key={p.id}
                data-flip-id={p.id}
              >
                <span className="pw-wire" aria-hidden="true" />
                <div className="pw-in">
                  {/* no aria-label: the card's own text (name, blurb, "Quick View")
                      is the accessible name, so speech and sight agree */}
                  <button className="pc-hit" onClick={() => setOpenId(p.id)}>
                    <div className="framed">
                      <div className="crop">
                        <img
                          src={p.img}
                          srcSet={srcset(p.img)}
                          sizes="(max-width: 1000px) 47vw, 34vw"
                          alt={p.name}
                          loading="lazy"
                          style={p.pos ? { objectPosition: p.pos } : undefined}
                        />
                        <span className="pc-view">Quick View</span>
                      </div>
                    </div>
                    <div className="pc-meta">
                      <h3>{p.name}</h3>
                      <span>{p.blurb}</span>
                    </div>
                  </button>
                  {p.hot && <span className="pc-badge">Most asked for</span>}
                </div>
              </article>
            ))}
          </div>

          {shown.length === 0 && q && (
            <p className="pc-empty">
              No match for “{q}” in {m.name}.{' '}
              <button className="linkish" onClick={() => type('')}>Show everything</button>
              {' '}or{' '}
              <a className="linkish" target="_blank" rel="noreferrer"
                 href={waLink(`Hello Heaven Furniture Mart! I am looking for "${q}" — do you make it?`)}>
                ask us for it
              </a>.
            </p>
          )}

          {shown.length === 0 && !q && (
            <p className="pc-empty">
              No {here ? here.label.toLowerCase() : ''} piece stands on the {m.name} floor today.{' '}
              {other && (
                <>
                  <button className="linkish" onClick={() => setMode(other)}>
                    See the {here?.label.toLowerCase()} in {MODES[other].name}
                  </button>
                  {' '}or{' '}
                </>
              )}
              <a className="linkish" target="_blank" rel="noreferrer"
                 href={waLink(`Hello Heaven Furniture Mart! I am looking for a ${m.name.toLowerCase()} ${here?.label.toLowerCase() ?? ''} piece — can you build one?`)}>
                ask us to build one
              </a>.
            </p>
          )}
        </div>
      </div>

      {openIdx >= 0 && (
        <QuickView piece={shown[openIdx]} onClose={() => setOpenId(null)} onStep={step} />
      )}
    </section>
  );
}
