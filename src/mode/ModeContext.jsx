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
    heroFx: 'curtain',
    heroImgs: ['/img/bed-hero.webp', '/img/living-royal.webp', '/img/bed-gold.webp', '/img/dining-floral.webp'],
    introImgs: ['/img/chaise-gold.webp', '/img/bed-gold.webp'],
    bandImg: '/img/living-royal.webp',
    heroCaptions: [
      'Four-poster bed · hand-finished, Agrabad workshop',
      'Royal tufted sofa · carved and gilded frame',
      'Gilded tufted bed · with matching foot bench',
      'Gold leaf dining table · turned legs, carved apron',
    ],
    heroSub:
      'Hand-carved frames, gilded edges, upholstery cut to order — heirloom pieces from our Agrabad atelier.',
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
    heroFx: 'slide',
    heroImgs: ['/img/office-desk.webp', '/img/bed-white.webp', '/img/office-lounge.webp', '/img/office-conf.webp'],
    introImgs: ['/img/office-lounge.webp', '/img/bed-white.webp'],
    bandImg: '/img/office-conf.webp',
    heroCaptions: [
      'Manager desks · built to the floor plan',
      'Linen panel bed · painted hardwood',
      'Breakout lounge · round table, moulded chairs',
      'Conference table · one continuous top',
    ],
    heroSub:
      'Clean lines, light woods, quiet comfort — workspaces and homes built to your space, not off a shelf.',
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
    heroFx: 'wipe',
    heroImgs: ['/img/console-noir.webp', '/img/dining-marble-oval.webp', '/img/dining-noir.webp', '/img/dining-marble-gold.webp'],
    introImgs: ['/img/dining-glass-round.webp', '/img/console-noir.webp'],
    bandImg: '/img/dining-noir.webp',
    heroCaptions: [
      'Lacquered console · brass detail',
      'Oval marble dining set · fluted pedestal',
      'Marble and velvet dining · quilted chairs',
      'Marble and gold dining table · brass inlay',
    ],
    heroSub:
      'Dark lacquer, brass hardware, low light — statement pieces made to measure for rooms with presence.',
  },
};

const ModeCtx = createContext(null);
export const useMode = () => useContext(ModeCtx);

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ModeProvider({ children }) {
  // always Classic on arrival — see the note in index.html
  const [mode, setModeState] = useState('classic');
  const wipeRef = useRef(null);
  const wipeWordRef = useRef(null);
  const busy = useRef(false);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
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
