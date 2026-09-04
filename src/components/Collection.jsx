import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import Ornament from './Ornament.jsx';
import QuickView from './QuickView.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';
import { srcset } from '../lib/img.js';
import { CATALOG, CATEGORIES, countFor } from '../data/catalog.js';

gsap.registerPlugin(Flip);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// search reads name, category and the tag list
const matches = (p, q) => {
  if (!q) return true;
  const hay = `${p.name} ${p.cat} ${p.blurb} ${p.tags.join(' ')}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

// pieces from the active world float to the front — the room you chose
// stays the room you browse
const worldFirst = (list, world) =>
  [...list].sort((a, b) => (a.world === world ? 0 : 1) - (b.world === world ? 0 : 1));

export default function Collection() {
  const { m } = useMode();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const gridRef = useRef(null);
  const firstRun = useRef(true);

  const shown = useMemo(
    () => worldFirst(CATALOG.filter((p) => (cat === 'all' || p.cat === cat) && matches(p, q)), m.key),
    [cat, q, m.key],
  );

  // FLIP: record where every card is, let React re-render, then animate
  // each card from its old box to its new one.
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
    // typing that does not change the result set should not restage the grid
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

    // absolute:true lifts every card out of flow, so without this the grid
    // collapses to nothing mid-flight and the dark section below rides up
    // over the animation. Hold the height and ease it to its new value.
    gsap.fromTo(grid, { height: fromH.current }, {
      height: toH,
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => { grid.style.height = ''; },
    });
    flipState.current = null;
  }, [shown]);

  const pick = (key) => { if (key === cat) return; captureFlip(); setQ(''); setCat(key); };
  // a search looks through the whole workshop, not just the open tab —
  // otherwise "velvet" inside Chairs reads as "we don't make it"
  const type = (v) => { captureFlip(); setQ(v); if (v) setCat('all'); };

  // world switch resets the browse state
  useEffect(() => { setCat('all'); setQ(''); }, [m.key]);

  // the room hotspots and the Finder send people here pre-filtered
  useEffect(() => {
    const on = (e) => {
      const next = e.detail?.cat;
      if (!next || next === cat) return;
      captureFlip();
      setQ('');
      setCat(next);
    };
    window.addEventListener('hfm:filter', on);
    return () => window.removeEventListener('hfm:filter', on);
  }, [cat]);

  const openIdx = openId ? shown.findIndex((p) => p.id === openId) : -1;
  const step = (d) => {
    if (openIdx < 0) return;
    setOpenId(shown[(openIdx + d + shown.length) % shown.length].id);
  };

  return (
    <section className="collection sec-light alt" id="collections">
      <Ornament variant="a" pos="tr" />
      <div className="container">
        <div className="col-head">
          <div className="rv">
            <p className="eyebrow">
              {shown.length === CATALOG.length
                ? `The Collection — ${CATALOG.length} pieces`
                : `Showing ${shown.length} of ${CATALOG.length}`}
            </p>
            <h2 className="display" style={{ marginTop: 18 }}>
              Find your piece. <em>Then make it yours.</em>
            </h2>
          </div>
          <p className="lede rv" data-rv-delay="0.1">
            Every piece here left our own workshop, and every one can be rebuilt in
            your wood, your fabric, your measurements.
          </p>
        </div>

        <div className="col-tools rv" data-rv-delay="0.15">
          <div className="cat-tabs" role="tablist" aria-label="Filter by category">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={cat === c.key}
                className={`cat-tab${cat === c.key ? ' active' : ''}`}
                onClick={() => pick(c.key)}
              >
                {c.label}
                <span className="cat-n">{countFor(c.key)}</span>
              </button>
            ))}
          </div>
          <div className="col-search">
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12.8" y1="12.8" x2="17.5" y2="17.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              type="search"
              value={q}
              placeholder="Search — try “chair”, “velvet”, “marble”…"
              aria-label="Search the collection"
              onChange={(e) => type(e.target.value)}
            />
            {q && <button className="col-clear" onClick={() => type('')} aria-label="Clear search">×</button>}
          </div>
        </div>

        <div className="pc-grid" ref={gridRef}>
          {shown.map((p) => (
            <article className="pc" key={p.id} data-flip-id={p.id}>
              {/* no aria-label: the card's own text (name, blurb, "Quick View")
                  is the accessible name, so speech and sight agree */}
              <button className="pc-hit" onClick={() => setOpenId(p.id)}>
                <div className="framed">
                  <div className="crop">
                    <img
                      src={p.img}
                      srcSet={srcset(p.img)}
                      sizes="(max-width: 700px) 46vw, 25vw"
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

      {openIdx >= 0 && (
        <QuickView piece={shown[openIdx]} onClose={() => setOpenId(null)} onStep={step} />
      )}
    </section>
  );
}
