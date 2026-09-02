import Ornament from './Ornament.jsx';
import { useRef, useState } from 'react';
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
  const [playing, setPlaying] = useState(false);
  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play());
  };

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
                {playing ? (
                  <video
                    ref={videoRef}
                    src="/video/showroom.mp4"
                    poster="/video/poster.jpg"
                    controls
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <button className="showroom-poster" onClick={play} aria-label="Play the showroom tour video">
                    <img src="/video/poster.jpg" alt="Inside the Heaven Furniture Mart showroom" loading="lazy" />
                    <span className="play-ring">
                      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="play-note">Walk the showroom · 2 min</span>
                  </button>
                )}
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
