import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Ornament from './Ornament.jsx';
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

// pieces from the active world float to the front — the room you chose
// stays the room you browse
const worldFirst = (list, world) =>
  [...list].sort((a, b) => (a.world === world ? 0 : 1) - (b.world === world ? 0 : 1));

const COUNTS = PLAN_ROOMS.reduce((acc, r) => {
  acc[r.key] = CATALOG.filter((p) => p.room === r.key).length;
  return acc;
}, {});

export default function Collection() {
  const { m } = useMode();
  const [room, setRoom] = useState(null);      // null = the whole house
  const [peek, setPeek] = useState(null);      // room under the cursor
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const gridRef = useRef(null);
  const firstRun = useRef(true);

  const shown = useMemo(
    () => worldFirst(CATALOG.filter((p) => (!room || p.room === room) && matches(p, q)), m.key),
    [room, q, m.key],
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
    if (!flipState.current || ids === prevIds.current) { flipState.current = null; return; }
    prevIds.current = ids;

    const grid = gridRef.current;
    const toH = grid.offsetHeight;
    gsap.killTweensOf(grid);

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

  // world switch resets the browse state
  useEffect(() => { setRoom(null); setQ(''); }, [m.key]);

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

  return (
    <section className="collection sec-light alt" id="collections">
      <Ornament variant="a" pos="tr" />
      <div className="container">
        <div className="col-head">
          <div className="rv">
            <p className="eyebrow">The Collection — {CATALOG.length} pieces</p>
            <h2 className="display" style={{ marginTop: 18 }}>
              Walk the house. <em>Take what fits yours.</em>
            </h2>
          </div>
          <p className="lede rv" data-rv-delay="0.1">
            Every piece here left our own workshop, and every one can be rebuilt in
            your wood, your fabric, your measurements.
          </p>
        </div>

        <div className="plan-wrap rv" data-rv-delay="0.15">
          <FloorPlan active={room} counts={COUNTS} onPick={pickRoom} onPeek={setPeek} />
          <div className="plan-side">
            <div className="plan-now">
              <span className="plan-now-k">{here ? here.label : 'The whole house'}</span>
              <span className="plan-now-n">
                {q ? `${shown.length} matching` : `${here ? COUNTS[here.key] : CATALOG.length} pieces`}
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
                className={`pc pw${i % 9} pw-d${i % 3}${peek && p.room === peek ? ' lit' : ''}`}
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
                          sizes="(max-width: 700px) 46vw, 34vw"
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

          {shown.length === 0 && (
            <p className="pc-empty">
              No match for “{q}”.{' '}
              <button className="linkish" onClick={() => type('')}>Show everything</button>
              {' '}or{' '}
              <a className="linkish" target="_blank" rel="noreferrer"
                 href={waLink(`Hello Heaven Furniture Mart! I am looking for "${q}" — do you make it?`)}>
                ask us for it
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
