import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// ─────────────────────────────────────────────────────────────
//  The three worlds. Everything a mode changes that ISN'T a CSS
//  token lives here: labels, imagery, copy fragments.
// ─────────────────────────────────────────────────────────────
export const MODES = {
  classic: {
    key: 'classic',
    name: 'Classic',
    desc: 'carved, gilded, ceremonial',
    swatch: 'linear-gradient(135deg, #2c4543 50%, #d4a94f 50%)',
    wipeColor: '#2c4543',
    logo: '/img/logo-light.png',
    wipeInk: '#d4a94f',
    heroImg: '/img/bed-hero.webp',
    heroCaption: 'Four-poster bed · hand-finished, Agrabad workshop',
    heroSub:
      'Hand-carved frames, gilded edges, upholstery cut to order — heirloom pieces from our Agrabad atelier.',
    tiles: [
      { img: '/img/living-royal.webp', name: 'Living', tag: 'Sofas · Tables · Consoles', span: 'span-7' },
      { img: '/img/bed-gold.webp', name: 'Bedroom', tag: 'Beds · Wardrobes', span: 'span-5', tall: true },
      { img: '/img/dining-floral.webp', name: 'Dining', tag: 'Tables · Chairs · Cabinets', span: 'span-5' },
      { img: '/img/cabinet-gold.webp', name: 'Study & Display', tag: 'Cabinets · Shelving', span: 'span-7' },
    ],
  },
  modern: {
    key: 'modern',
    name: 'Modern',
    desc: 'clean lines, light woods',
    swatch: 'linear-gradient(135deg, #faf8f3 50%, #c9a87c 50%)',
    wipeColor: '#f1eee6',
    logo: '/img/logo-dark.png',
    wipeInk: '#96803c',
    heroImg: '/img/office-desk.webp',
    heroCaption: 'Executive workspace · built to measure',
    heroSub:
      'Clean lines, light woods, quiet comfort — workspaces and homes built to your space, not off a shelf.',
    tiles: [
      { img: '/img/bed-white.webp', name: 'Bedroom', tag: 'Beds · Side Tables', span: 'span-7' },
      { img: '/img/chair-ergo.webp', name: 'Seating', tag: 'Task · Executive', span: 'span-5', tall: true },
      { img: '/img/office-director.webp', name: 'Office', tag: 'Desks · Storage', span: 'span-5' },
      { img: '/img/office-conf.webp', name: 'Workspace', tag: 'Conference · Teams', span: 'span-7' },
    ],
  },
  noir: {
    key: 'noir',
    name: 'Noir',
    desc: 'dark lacquer, brass',
    swatch: 'linear-gradient(135deg, #171310 50%, #c9973f 50%)',
    wipeColor: '#171310',
    logo: '/img/logo-light.png',
    wipeInk: '#c9973f',
    heroImg: '/img/console-noir.webp',
    heroCaption: 'Lacquered console · brass detail',
    heroSub:
      'Dark lacquer, brass hardware, low light — statement pieces made to measure for rooms with presence.',
    tiles: [
      { img: '/img/console-noir.webp', name: 'Living', tag: 'Consoles · Storage', span: 'span-7' },
      { img: '/img/chair-ergo.webp', name: 'Seating', tag: 'Executive · Study', span: 'span-5', tall: true },
      { img: '/img/dining-noir.webp', name: 'Dining', tag: 'Tables · Chairs', span: 'span-12' },
    ],
  },
};

const ModeCtx = createContext(null);
export const useMode = () => useContext(ModeCtx);

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('heaven-mode');
      return MODES[saved] ? saved : 'classic';
    } catch {
      return 'classic';
    }
  });
  const wipeRef = useRef(null);
  const wipeWordRef = useRef(null);
  const busy = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    try { localStorage.setItem('heaven-mode', mode); } catch { /* private mode */ }
  }, [mode]);

  const setMode = useCallback((next) => {
    if (next === mode || busy.current || !MODES[next]) return;
    const el = wipeRef.current;
    const word = wipeWordRef.current;
    if (!el || prefersReduced()) {
      setModeState(next);
      return;
    }
    busy.current = true;
    const m = MODES[next];
    el.style.background = m.wipeColor;
    word.style.color = m.wipeInk;
    word.textContent = m.name;

    // material wipe: sweep in → swap world under cover → sweep out
    const tl = gsap.timeline({
      onComplete: () => { busy.current = false; },
    });
    tl.set(el, { clipPath: 'inset(0 100% 0 0)' })
      .to(el, { clipPath: 'inset(0 0% 0 0)', duration: 0.42, ease: 'power3.inOut' })
      .fromTo(word, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, '-=0.12')
      .add(() => setModeState(next))
      .to(word, { opacity: 0, y: -10, duration: 0.24, ease: 'power2.in' }, '+=0.28')
      .to(el, { clipPath: 'inset(0 0 0 100%)', duration: 0.46, ease: 'power3.inOut' }, '-=0.05');
  }, [mode]);

  return (
    <ModeCtx.Provider value={{ mode, m: MODES[mode], setMode, MODES }}>
      {children}
      <div className="wipe" ref={wipeRef} aria-hidden="true">
        <span className="wipe-word" ref={wipeWordRef} />
      </div>
    </ModeCtx.Provider>
  );
}
