import Ornament from './Ornament.jsx';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '../site.config.js';

const TIMELINE = [
  { y: '2020', d: `Founded by ${SITE.md}` },
  { y: '2021', d: 'Agrabad showroom opens its doors' },
  { y: '2024', d: 'International Furniture Fair, Chattogram' },
  { y: '2025', d: 'Member, Chamber of Commerce' },
  { y: '2026', d: 'Nationwide BFIOA recognition' },
];

export default function Proof() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  // The film is 28MB, so it is not fetched until the section is near, and it
  // stops the moment it scrolls away — autoplay that costs nothing to anyone
  // who never reaches it.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || typeof IntersectionObserver !== 'function') return;
    // a visitor who asked for less motion does not get a film starting itself
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.controls = true;
      v.autoplay = false;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (v.preload !== 'auto') v.preload = 'auto';
            v.play().catch(() => { /* a browser that refuses muted autoplay */ });
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="proof sec-dark" id="visit">
      <Ornament variant="a" pos="bl" />
      <div className="container">
        <div className="proof-grid">
          <div className="rv">
            <span className="quote-mark" aria-hidden="true">&ldquo;</span>
            <blockquote className="big-quote">
              Furniture is more than function; it is a reflection of lifestyle, taste
              and comfort. Every piece we create is designed to bring lasting elegance
              into the homes of our clients.
            </blockquote>
            <div className="quote-attr">
              <div>
                <span className="qa-name">{SITE.md}</span>
                <span className="qa-role">Managing Director, {SITE.name}</span>
              </div>
            </div>
          </div>

          {/* real walkthrough footage, framed small so 720p stays crisp */}
          <div className="proof-visual">
            <div className="framed rv" data-rv-delay="0.08">
              <div className="crop proof-video">
                <video
                  ref={videoRef}
                  src="/video/showroom.mp4"
                  poster="/video/poster.jpg"
                  preload="none"
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  aria-label="Inside the Heaven Furniture Mart showroom"
                />
                <button
                  className="vid-sound"
                  onClick={() => setMuted((v) => !v)}
                  aria-label={muted ? 'Turn the sound on' : 'Turn the sound off'}
                >
                  {muted ? (
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                      <path d="M17 8l4 8M21 8l-4 8" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                      <path d="M16.5 8.8a4 4 0 010 6.4M19 6.5a7.5 7.5 0 010 11" stroke="currentColor" strokeWidth="1.6" fill="none" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="proof-cap rv">
              Our Agrabad floor, on film — every piece is ours.
            </p>
          </div>
        </div>

        <div className="timeline rv">
          <p className="eyebrow timeline-label">A Short History</p>
          <div className="timeline-track">
            {TIMELINE.map((t) => (
              <div className="tl-item" key={t.y}>
                <div className="tl-year">{t.y}</div>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
