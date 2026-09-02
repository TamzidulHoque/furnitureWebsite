import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMode } from '../mode/ModeContext.jsx';
import { WA_DEFAULT } from '../site.config.js';
import ModeSwitch from './ModeSwitch.jsx';

export default function Hero() {
  const { m } = useMode();
  const imgRef = useRef(null);
  const copyRef = useRef(null);
  const played = useRef(false);

  // “Detail → whole”: open zoomed deep into the craft, pull back to reveal the piece.
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tl = gsap.timeline();
    tl.fromTo(imgRef.current, { scale: 2.3, filter: 'blur(2px)' },
      { scale: 1, filter: 'blur(0px)', duration: 1.9, ease: 'power3.inOut' })
      .fromTo(copyRef.current.querySelectorAll('[data-stagger]'),
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09 },
        '-=1.0');
  }, []);

  // On mode change (after the wipe), swap the image without the big zoom.
  useEffect(() => {
    if (!imgRef.current) return;
    gsap.fromTo(imgRef.current, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: 'power2.out' });
  }, [m.key]);

  return (
    <section className="hero sec-dark" id="top">
      <div className="container hero-grid">
        <div className="hero-copy" ref={copyRef}>
          <p className="eyebrow" data-stagger>Bespoke Furniture &amp; Interiors — Chattogram</p>
          <h1 className="display" data-stagger>
            Furniture, Crafted <em className="serif-i" style={{ color: 'var(--accent)' }}>Around You.</em>
          </h1>
          <p className="lede hero-sub" data-stagger>{m.heroSub}</p>
          <div className="hero-ctas" data-stagger>
            <a className="btn btn-solid" href={WA_DEFAULT} target="_blank" rel="noreferrer">
              Book a Free Design Consultation
            </a>
            <a className="btn btn-ghost" href="#collections">Explore Collections</a>
          </div>
          <div data-stagger>
            <ModeSwitch />
          </div>
        </div>

        <div className="hero-visual">
          <div className="framed">
            <div className="crop">
              <img ref={imgRef} src={m.heroImg} alt={m.heroCaption} fetchPriority="high" />
            </div>
          </div>
          <p className="hero-caption">{m.heroCaption}</p>
        </div>
      </div>
      <div className="scroll-hint">Scroll</div>
    </section>
  );
}
