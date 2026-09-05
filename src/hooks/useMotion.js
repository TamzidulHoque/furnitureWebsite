import { useEffect } from 'react';
import Lenis from 'lenis';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Smooth wheel scrolling.
 *
 * Nothing else in the app listens to scroll any more, so Lenis drives the
 * page and nothing else. Programmatic scrolling still has to go through it —
 * window.__lenis.scrollTo(y, { immediate: true, force: true }).
 */
export function useLenis() {
  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: true });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}

/**
 * Reveal-on-entry for everything carrying .rv / .rv-img.
 *
 * One IntersectionObserver for the whole page, and CSS does the moving. There
 * is deliberately no JavaScript on the scroll path: the previous version ran a
 * GSAP ScrollTrigger per element — forty of them, a dozen of those scrubbed —
 * and every one had to be measured and updated on every scrolled frame. That
 * is what made scrolling stutter on an ordinary machine.
 *
 * Re-runs when `dep` changes, because a world swap replaces whole subtrees.
 */
export function useReveals(dep) {
  useEffect(() => {
    const items = document.querySelectorAll('.rv, .rv-img');
    if (!items.length) return;

    // no observer, or the visitor asked for less motion: everything is simply there
    if (reduced() || typeof IntersectionObserver !== 'function') {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    // A .rv-img hides itself with clip-path: inset(0 0 100% 0) — no rendered
    // area at all — and an IntersectionObserver never reports a zero-area
    // target as intersecting. Watched directly it would wait forever for a
    // reveal that cannot arrive; that deadlock is how the Shop The Room
    // photograph went missing. Its container is not clipped, so the container
    // is what gets watched and the reveal is passed back to the element.
    const sentinel = (el) => (el.classList.contains('rv-img') && el.parentElement) || el;
    const waiting = new Map();     // watched node -> elements to reveal

    const reveal = (el) => {
      const delay = parseFloat(el.dataset.rvDelay);
      if (delay) el.style.setProperty('--rv-delay', `${delay}s`);
      el.classList.add('is-in');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (waiting.get(e.target) ?? [e.target]).forEach(reveal);
          waiting.delete(e.target);
          io.unobserve(e.target);   // a reveal happens once
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    );
    items.forEach((el) => {
      // anything already on screen when this runs is revealed straight away,
      // so a reload half-way down the page never shows a blank section
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { reveal(el); return; }
      const node = sentinel(el);
      const group = waiting.get(node);
      if (group) { group.push(el); return; }   // two of them sharing a container
      waiting.set(node, [el]);
      io.observe(node);
    });
    return () => io.disconnect();
  }, [dep]);
}

/**
 * Run `draw` the first time `el` comes into view, once. The building block for
 * the ornaments and the floor plan, which draw themselves in.
 */
export function onFirstView(el, draw, rootMargin = '0px 0px -12% 0px') {
  if (!el) return () => {};
  if (typeof IntersectionObserver !== 'function') { draw(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    draw();
  }, { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}
