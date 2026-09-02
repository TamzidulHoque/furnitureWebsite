import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE } from '../site.config.js';
import { useMode } from '../mode/ModeContext.jsx';

gsap.registerPlugin(ScrollTrigger);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Intro() {
  const { m } = useMode();
  const sec = useRef(null);
  const mark = useRef(null);
  const photoA = useRef(null);
  const photoB = useRef(null);

  // scroll-scrubbed life: the watermark drifts, the photos ride at
  // different speeds — a page that moves while you read it
  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: sec.current, start: 'top bottom', end: 'bottom top', scrub: 1.1 };
      gsap.fromTo(mark.current, { xPercent: 4 }, { xPercent: -10, ease: 'none', scrollTrigger: st });
      gsap.fromTo(photoA.current, { yPercent: 14, rotate: -1.6 }, { yPercent: -14, rotate: 1.2, ease: 'none', scrollTrigger: st });
      gsap.fromTo(photoB.current, { yPercent: 26, rotate: 2.2 }, { yPercent: -8, rotate: -1.4, ease: 'none', scrollTrigger: st });
    }, sec);
    return () => ctx.revert();
  }, [m.key]);

  return (
    <section className="intro sec-light" ref={sec}>
      <span className="intro-mark" ref={mark} aria-hidden="true">HEAVEN</span>
      <div className="container intro-grid">
        <div className="intro-left rv">
          <p className="eyebrow">The House</p>
          <p className="intro-statement">
            Designed. Crafted. <em>Customized.</em>
          </p>
          <div className="intro-collage" aria-hidden="true">
            <figure className="ic-photo ic-a" ref={photoA}>
              <img src={m.introImgs[0]} alt="" loading="lazy" />
            </figure>
            <figure className="ic-photo ic-b" ref={photoB}>
              <img src={m.introImgs[1]} alt="" loading="lazy" />
            </figure>
          </div>
        </div>
        <div className="rv" data-rv-delay="0.1">
          <p className="lede intro-body">
            Heaven Furniture Mart is one of Chattogram&rsquo;s leading bespoke furniture
            houses. Since {SITE.founded}, every sofa, bed and dining table leaving our
            Agrabad workshop has been designed around a single brief — <span className="serif-i">yours</span>.
            No shelves, no mass production. Premium wood, skilled hands, and furniture
            shaped to your rooms, your measurements, your taste.
          </p>
          <div className="intro-stats">
            <div className="stat">
              <div className="stat-n">{SITE.founded}</div>
              <div className="stat-l">Founded in Chattogram</div>
            </div>
            <div className="stat">
              <div className="stat-n">100s</div>
              <div className="stat-l">of homes furnished</div>
            </div>
            <div className="stat">
              <div className="stat-n">1</div>
              <div className="stat-l">Large Agrabad showroom</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
