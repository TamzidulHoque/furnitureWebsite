import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smooth scroll (Lenis) wired into ScrollTrigger. */
export function useLenis() {
  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: true });
    window.__lenis = lenis; // programmatic scrolling must go through lenis
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}

/**
 * Scroll reveals for everything carrying .rv / .rv-img.
 * Re-runs whenever `dep` changes (mode swaps re-render imagery).
 */
export function useReveals(dep) {
  useEffect(() => {
    if (reduced()) {
      document.querySelectorAll('.rv').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      document.querySelectorAll('.rv-img').forEach((el) => { el.style.clipPath = 'none'; });
      return;
    }
    const triggers = [];
    document.querySelectorAll('.rv').forEach((el) => {
      triggers.push(
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: (parseFloat(el.dataset.rvDelay) || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      );
    });
    document.querySelectorAll('.rv-img').forEach((el) => {
      triggers.push(
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.15,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      );
    });
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, [dep]);
}
