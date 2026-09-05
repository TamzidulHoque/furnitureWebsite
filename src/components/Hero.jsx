import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useMode } from '../mode/ModeContext.jsx';
import { WA_DEFAULT } from '../site.config.js';
import ModeSwitch from './ModeSwitch.jsx';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The hero keeps its own descriptors rather than the shared lib/img helper:
// these must match the <link rel="preload" imagesrcset> in index.html exactly,
// and 760w is what makes a DPR-2 phone pick the small file for the LCP image.
const SIZES = '(max-width: 900px) 100vw, 42vw';
const srcset = (src) => `${src.replace('.webp', '-sm.webp')} 760w, ${src} 1400w`;
const setImg = (el, src) => { el.srcset = srcset(src); el.src = src; };

// Multi-image stage. Each world changes its picture its own way:
// classic — the standing image splits and draws aside like a stage curtain ·
// modern — a clean slide · noir — a slanted brass edge sweeps across.
function HeroStage({ idx, setIdx }) {
  const { m } = useMode();
  const baseImg = useRef(null);
  const fxLayer = useRef(null);
  const fxImg = useRef(null);
  const seam = useRef(null);
  const shade = useRef(null);
  const curtain = useRef(null);
  const edge = useRef(null);
  const stage = useRef(null);
  const busy = useRef(false);
  const opened = useRef(false);
  const imgs = m.heroImgs;

  // first load: pull back from the craft detail
  useEffect(() => {
    if (opened.current || reduced()) return;
    opened.current = true;
    gsap.fromTo(baseImg.current, { scale: 2.3, filter: 'blur(2px)' },
      { scale: 1, filter: 'blur(0px)', duration: 1.9, ease: 'power3.inOut' });
  }, []);

  // world switch: settle the new set in
  useEffect(() => {
    setIdx(0);
    if (baseImg.current) {
      setImg(baseImg.current, m.heroImgs[0]);
      if (!reduced()) gsap.fromTo(baseImg.current, { scale: 1.08 }, { scale: 1, duration: 1.1, ease: 'power2.out' });
    }
  }, [m.key]);

  const go = (next) => {
    if (busy.current || next === idx) return;
    const target = imgs[next];
    if (reduced()) {
      setImg(baseImg.current, target);
      setIdx(next);
      return;
    }
    busy.current = true;
    setImg(fxImg.current, target);
    const done = () => {
      setImg(baseImg.current, target);
      gsap.set(fxLayer.current, { clearProps: 'all', autoAlpha: 0 });
      gsap.set(baseImg.current, { clearProps: 'transform,filter,opacity' });
      gsap.set(seam.current, { autoAlpha: 0 });
      gsap.set(curtain.current, { autoAlpha: 0 });
      gsap.set(curtain.current.children, { clearProps: 'transform' });
      gsap.set(edge.current, { autoAlpha: 0 });
      setIdx(next);
      busy.current = false;
    };
    const tl = gsap.timeline({ onComplete: done });

    if (m.heroFx === 'slide') {
      tl.set(fxLayer.current, { autoAlpha: 1, x: '100%', clipPath: 'none', rotateY: 0 })
        .to(fxLayer.current, { x: '0%', duration: 0.85, ease: 'power3.inOut' })
        .to(baseImg.current, { x: '-16%', scale: 1.04, duration: 0.85, ease: 'power3.inOut' }, 0);
    } else if (m.heroFx === 'wipe') {
      // a slanted brass edge crosses the frame and leaves the new picture behind
      tl.set(fxLayer.current, {
        autoAlpha: 1, x: 0, rotateY: 0,
        clipPath: 'polygon(-30% 0%, -30% 0%, -60% 100%, -60% 100%)',
      })
        .set(edge.current, { autoAlpha: 1, xPercent: -60 })
        .to(fxLayer.current, {
          clipPath: 'polygon(-30% 0%, 130% 0%, 100% 100%, -60% 100%)',
          duration: 1,
          ease: 'power3.inOut',
        })
        .to(edge.current, { xPercent: 108, duration: 1, ease: 'power3.inOut' }, 0)
        .to(baseImg.current, { scale: 1.06, duration: 1, ease: 'power2.inOut' }, 0)
        .to(edge.current, { autoAlpha: 0, duration: 0.25 }, 0.8);
    } else {
      // curtain: the picture on show is the curtain — it splits down the
      // middle and both halves draw aside, uncovering the next one
      const [left, right] = curtain.current.children;
      setImg(left.querySelector('img'), imgs[idx]);
      setImg(right.querySelector('img'), imgs[idx]);
      tl.set(fxLayer.current, { autoAlpha: 1, x: 0, rotateY: 0, clipPath: 'none' })
        .set(curtain.current, { autoAlpha: 1 })
        .set(seam.current, { autoAlpha: 1, scaleY: 0 })
        .to(seam.current, { scaleY: 1, duration: 0.3, ease: 'power2.out' })
        .to(left, { xPercent: -100, duration: 1.05, ease: 'power3.inOut' }, 0.14)
        .to(right, { xPercent: 100, duration: 1.05, ease: 'power3.inOut' }, 0.14)
        .to(seam.current, { autoAlpha: 0, duration: 0.35 }, 0.5);
    }
  };

  // the next slide is fetched while the current one is on screen, so a
  // transition never starts by waiting for bytes
  useEffect(() => {
    const next = imgs[(idx + 1) % imgs.length];
    if (!next) return;
    const pre = new Image();
    pre.decoding = 'async';
    pre.srcset = srcset(next);
    pre.src = next;
  }, [idx, imgs]);

  // auto-advance
  useEffect(() => {
    if (imgs.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) go((idx + 1) % imgs.length);
    }, 5200);
    return () => clearInterval(t);
  });

  return (
    <div className="hero-stage" ref={stage}>
      <div className="hs-layer hs-base">
        <img ref={baseImg} src={imgs[0]} srcSet={srcset(imgs[0])} sizes={SIZES} alt={m.heroCaptions[0]} fetchPriority="high" />
      </div>
      <div className="hs-layer hs-fx" ref={fxLayer} aria-hidden="true">
        <img ref={fxImg} alt="" />
      </div>
      <div className="hs-curtain" ref={curtain} aria-hidden="true">
        <div className="hs-half hs-half-l"><img alt="" /></div>
        <div className="hs-half hs-half-r"><img alt="" /></div>
      </div>
      <span className="hs-edge" ref={edge} aria-hidden="true" />
      <span className="hs-seam" ref={seam} aria-hidden="true" />
      <div className="hs-shade" ref={shade} aria-hidden="true" />
      <div className="hs-dots" role="tablist" aria-label="Hero images">
        {imgs.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Image ${i + 1}`}
            className={`hs-dot${i === idx ? ' active' : ''}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { m } = useMode();
  const [idx, setIdx] = useState(0);
  const copyRef = useRef(null);
  const played = useRef(false);

  useEffect(() => {
    if (played.current || reduced()) return;
    played.current = true;
    gsap.fromTo(copyRef.current.querySelectorAll('[data-stagger]'),
      { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.7 });
  }, []);

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
              <HeroStage idx={idx} setIdx={setIdx} />
            </div>
          </div>
          <p className="hero-caption">{m.heroCaptions[idx] ?? m.heroCaptions[0]}</p>
        </div>
      </div>
    </section>
  );
}
