import { useEffect, useRef } from 'react';

// A soft warm light that follows the cursor — showroom lighting.
// Pointer devices only; costs one composited layer.
export default function Lightplay() {
  const ref = useRef(null);
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    let raf = 0;
    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.background =
          `radial-gradient(620px circle at ${e.clientX}px ${e.clientY}px, rgba(221, 167, 65, 0.075), transparent 65%)`;
      });
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60, mixBlendMode: 'soft-light' }}
    />
  );
}
