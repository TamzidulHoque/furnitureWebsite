import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Ornament from './Ornament.jsx';
import Finder from './Finder.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { srcset } from '../lib/img.js';

const STEPS = [
  {
    n: 'i',
    t: 'Consult',
    d: 'Sit with our designers — at the Agrabad showroom or in your own home. The consultation is free, always.',
  },
  {
    n: 'ii',
    t: 'Design',
    d: 'We draw the piece around your space, your measurements and your taste. You approve every line before wood is cut.',
  },
  {
    n: 'iii',
    t: 'Craft & Install',
    d: 'Our in-house craftsmen build it in premium wood. We deliver, install and style it in place — included.',
  },
];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Bespoke() {
  const { m } = useMode();
  const sec = useRef(null);

  // Parallax only. There used to be a paper-coloured wash lifting off the top
  // of this section; it covered the heading, which is ivory, with a layer the
  // same colour as the heading — a screen and a half of apparent nothing on
  // the way in. The photograph does the transition instead.
  useEffect(() => {
    const el = sec.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      // Parallax: the room behind the words travels slower than the page, so
      // the section reads as depth rather than as a picture stuck to a wall.
      gsap.fromTo('.bsp-bg img', { yPercent: -12 }, {
        yPercent: 12,
        ease: 'none',
        force3D: true,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.35 },
      });
      gsap.fromTo('.bsp-head-line', { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 70%', end: 'top 20%', scrub: 0.5 },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bespoke sec-dark" id="bespoke" ref={sec}>
      <div className="bsp-bg" aria-hidden="true">
        <img src={m.bandImg} srcSet={srcset(m.bandImg)} sizes="100vw" alt="" loading="lazy" />
      </div>
      <Ornament variant="b" pos="bl" />
      <div className="container">
        <div className="bespoke-head rv">
          <p className="eyebrow">The Heaven Difference</p>
          <h2 className="display" style={{ margin: '18px 0 16px' }}>
            Not from a shelf. <em>From a conversation.</em>
          </h2>
          <p className="lede">
            Bespoke is not an option here — it is the whole house.
          </p>
          <span className="bsp-head-line" aria-hidden="true" />
        </div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step rv" data-rv-delay={String(i * 0.08)} key={s.t}>
              <span className="step-n">{s.n}.</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>

        <Finder />
      </div>
    </section>
  );
}
