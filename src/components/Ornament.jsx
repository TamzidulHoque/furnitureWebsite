import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { onFirstView } from '../hooks/useMotion.js';
import { useMode } from '../mode/ModeContext.jsx';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-borne decoration, one dialect per world:
//  classic — gilded filigree that draws itself in ink
//  modern  — architect's offset geometry sliding on its own layer
//  noir    — a stitched leather panel easing in from the edge
// Appears as its section arrives, leaves as the section goes. Desktop only.

const CLASSIC = {
  a: (
    <svg viewBox="0 0 170 140" width="170" height="140" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path pathLength="1" d="M4 136 C4 70 44 24 116 16" />
      <path pathLength="1" d="M116 16 C144 13 160 30 152 48 C146 63 126 65 120 51 C116 41 126 33 134 37" />
      <path pathLength="1" d="M56 40 C68 26 88 22 100 28" />
      <path pathLength="1" d="M22 88 C36 70 56 64 70 68" />
      <circle pathLength="1" cx="8" cy="132" r="4" />
    </svg>
  ),
  b: (
    <svg viewBox="0 0 150 150" width="150" height="150" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle pathLength="1" cx="75" cy="75" r="62" />
      <circle pathLength="1" cx="75" cy="75" r="30" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
        <path
          key={r}
          pathLength="1"
          d="M75 45 C84 32 84 20 75 10 C66 20 66 32 75 45"
          transform={`rotate(${r} 75 75)`}
        />
      ))}
    </svg>
  ),
};

const MODERN = {
  a: (
    <svg viewBox="0 0 200 170" width="200" height="170" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="30" width="120" height="138" />
      <rect x="36" y="1" width="120" height="138" opacity="0.55" />
      <path d="M120 168 A78 78 0 0 0 198 90" />
      <circle cx="176" cy="34" r="5" fill="currentColor" stroke="none" />
    </svg>
  ),
  b: (
    <svg viewBox="0 0 190 150" width="190" height="150" fill="none" stroke="currentColor" strokeWidth="1">
      {[0, 30, 60, 90, 120].map((y) => <path key={y} d={`M0 ${y + 10} H130`} opacity="0.6" />)}
      {[0, 32, 64, 96, 128].map((x) => <path key={x} d={`M${x + 1} 0 V140`} opacity="0.35" />)}
      <circle cx="150" cy="98" r="38" strokeWidth="1.3" />
    </svg>
  ),
};

const NOIR = {
  a: (
    <svg viewBox="0 0 210 160" width="210" height="160">
      <defs>
        <filter id="leatherN" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.4 0.4 0.4 0 0" result="a" />
          <feComposite in="a" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect x="4" y="4" width="202" height="152" rx="14" fill="#241c15" />
      <rect x="4" y="4" width="202" height="152" rx="14" filter="url(#leatherN)" opacity="0.5" />
      <rect x="4" y="4" width="202" height="152" rx="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <rect className="stitch" pathLength="1" x="16" y="16" width="178" height="128" rx="9"
        fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="0.018 0.012" opacity="0.9" />
    </svg>
  ),
  b: (
    <svg viewBox="0 0 240 90" width="240" height="90" fill="none" stroke="currentColor">
      <path className="stitch" pathLength="1" d="M2 70 C60 30 120 84 238 22" strokeWidth="1.4" strokeDasharray="0.016 0.012" />
      <path d="M2 78 C60 38 120 92 238 30" strokeWidth="0.6" opacity="0.35" />
    </svg>
  ),
};

const SETS = { classic: CLASSIC, modern: MODERN, noir: NOIR };

export default function Ornament({ variant = 'a', pos = 'tr' }) {
  const { mode } = useMode();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced() || window.innerWidth < 900) return;
    const el = ref.current;
    const section = el?.closest('section');
    if (!el || !section) return;

    const fromSide = pos.includes('l') ? -1 : 1;
    // Where the browser has view timelines, the arriving-holding-leaving travel
    // is CSS (see .ornament in sections.css) and runs off the main thread; all
    // that is left here is the line-drawing inside the ornament, once, when the
    // section first shows up. Where it does not, this owns the whole thing and
    // the ornament draws in on arrival and stays, as it did before.
    const cssTravels = typeof CSS !== 'undefined'
      && CSS.supports?.('animation-timeline', 'view()')
      && window.innerWidth > 900;
    let ctx;
    const stop = onFirstView(section, () => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline();
        const appear = (vars, at) => (cssTravels ? tl : tl.fromTo(el, { autoAlpha: 0, ...vars.from }, { ...vars.to, ...at }));
        if (mode === 'classic') {
          const paths = el.querySelectorAll('path, circle, rect');
          gsap.set(paths, { strokeDasharray: (i, t) => t.getAttribute('strokeDasharray') || '1 1', strokeDashoffset: 1 });
          appear({ from: {}, to: { autoAlpha: 0.55 } }, { duration: 0.5 });
          tl.to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'power2.out' }, 0.1);
        } else if (mode === 'modern') {
          appear({ from: { x: 70 * fromSide, y: 24 }, to: { autoAlpha: 0.42, x: 0, y: 0 } },
            { duration: 1.1, ease: 'power3.out' });
        } else {
          const stitch = el.querySelectorAll('.stitch');
          gsap.set(stitch, { strokeDashoffset: 1 });
          appear({ from: { x: 90 * fromSide }, to: { autoAlpha: 0.85, x: 0 } },
            { duration: 1, ease: 'power3.out' });
          tl.to(stitch, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, 0.2);
        }
      }, el);
    }, '0px 0px -20% 0px');
    return () => { stop(); ctx?.revert(); };
  }, [mode, pos, variant]);

  return (
    <div className={`ornament orn-${pos}`} ref={ref} aria-hidden="true">
      {SETS[mode][variant]}
    </div>
  );
}
