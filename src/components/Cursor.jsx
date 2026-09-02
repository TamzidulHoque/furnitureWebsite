import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Gold ring cursor — grows over anything clickable. Pointer devices only.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('has-cursor');

    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power2.out' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power2.out' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.32, ease: 'power3.out' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.32, ease: 'power3.out' });

    const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };
    const over = (e) => {
      const hot = e.target.closest('a, button, input, canvas, .swatch, .hs-dot');
      gsap.to(ring.current, { scale: hot ? 1.9 : 1, opacity: hot ? 0.9 : 0.55, duration: 0.25 });
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </div>
  );
}
