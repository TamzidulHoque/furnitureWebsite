import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The plan is drawn once, to scale, in one coordinate space. Each room
// carries its own wall run, its label anchor and a few furniture glyphs —
// the glyphs are what make it read as an architect's drawing rather than
// four boxes.
const W = 820;
const H = 470;

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

// Door swings: a gap in the wall plus the quarter-circle a hinged door draws.
const DOORS = [
  { x: 360, y: 150, r: 34, from: 'v' },   // bedroom → living
  { x: 200, y: 256, r: 32, from: 'h' },   // bedroom → dining
  { x: 560, y: 256, r: 32, from: 'h' },   // living → office
  { x: 336, y: 350, r: 30, from: 'v' },   // dining → office
];

const arc = (d) =>
  d.from === 'v'
    ? `M ${d.x} ${d.y - d.r} A ${d.r} ${d.r} 0 0 1 ${d.x + d.r} ${d.y}`
    : `M ${d.x - d.r} ${d.y} A ${d.r} ${d.r} 0 0 1 ${d.x} ${d.y + d.r}`;

export default function FloorPlan({ active, counts, onPick, onPeek }) {
  const svg = useRef(null);

  // The plan draws itself the first time it comes into view. This runs off an
  // IntersectionObserver rather than ScrollTrigger: the plan is decoration, and
  // a trigger that fails to fire would leave the glyphs and counts invisible.
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    if (reduced()) return;

    const walls = el.querySelectorAll('.fp-wall');
    walls.forEach((w) => {
      const len = w.getTotalLength?.() ?? 0;
      if (!len) return;
      w.style.strokeDasharray = len;
      w.style.strokeDashoffset = len;
    });
    gsap.set(el.querySelectorAll('.fp-glyph, .fp-label'), { autoAlpha: 0 });

    let ctx;
    const draw = () => {
      ctx = gsap.context(() => {
        gsap.timeline()
          .to('.fp-wall', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.05 })
          .to('.fp-glyph', { autoAlpha: 1, duration: 0.5, stagger: 0.012 }, 0.45)
          .fromTo('.fp-label', { y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.68);
      }, el);
    };

    if (typeof IntersectionObserver !== 'function') { draw(); return; }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      draw();
    }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    return () => { io.disconnect(); ctx?.revert(); };
  }, []);

  return (
    <svg
      ref={svg}
      className="fplan"
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label="Floor plan — choose a room"
      onMouseLeave={() => onPeek?.(null)}
    >
      {/* outer shell and the two internal walls, drawn as one run each */}
      <g className="fp-walls" fill="none">
        <rect className="fp-wall" x="24" y="24" width="772" height="422" rx="2" />
        <line className="fp-wall" x1="24" y1="256" x2="796" y2="256" />
        <line className="fp-wall" x1="360" y1="24" x2="360" y2="256" />
        <line className="fp-wall" x1="336" y1="256" x2="336" y2="446" />
        {DOORS.map((d, i) => (
          <path className="fp-door" key={i} d={arc(d)} />
        ))}
      </g>

      {PLAN_ROOMS.map((r) => {
        const on = active === r.key;
        const empty = !counts[r.key];
        return (
          <g
            key={r.key}
            className={`fp-room${on ? ' on' : ''}${empty ? ' empty' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${r.label} — ${counts[r.key] ?? 0} pieces`}
            onClick={() => onPick(on ? null : r.key)}
            onMouseEnter={() => onPeek?.(r.key)}
            onFocus={() => onPeek?.(r.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(on ? null : r.key); }
            }}
          >
            <rect className="fp-floor" x={r.x} y={r.y} width={r.w} height={r.h} />
            <g className="fp-glyphs" aria-hidden="true">
              {r.glyphs.map((g, i) =>
                g.t === 'r'
                  ? <rect className="fp-glyph" key={i} x={g.x} y={g.y} width={g.w} height={g.h} rx="3" />
                  : <circle className="fp-glyph" key={i} cx={g.x} cy={g.y} r={g.r} />,
              )}
            </g>
            <text className="fp-label fp-name" x={r.x + 20} y={r.y + 38}>{r.label}</text>
            <text className="fp-label fp-note" x={r.x + 20} y={r.y + 58}>{r.note}</text>
            <text className="fp-label fp-count" x={r.x + r.w - 20} y={r.y + 46}>{counts[r.key] ?? 0}</text>
          </g>
        );
      })}
    </svg>
  );
}
