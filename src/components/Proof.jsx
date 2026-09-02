import { SITE } from '../site.config.js';

const TIMELINE = [
  { y: '2020', d: `Founded by ${SITE.md}` },
  { y: '2021', d: 'Agrabad showroom opens its doors' },
  { y: '2024', d: 'International Furniture Fair, Chattogram' },
  { y: '2025', d: 'Member, Chamber of Commerce' },
  { y: '2026', d: 'Nationwide BFIOA recognition' },
];

export default function Proof() {
  return (
    <section className="proof sec-dark" id="visit">
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
          <div className="proof-visual">
            <div className="framed">
              <div className="crop rv-img">
                <img src="/img/showroom-real.webp" alt="Inside the Heaven Furniture Mart showroom, with the Chattogram skyline through the window" loading="lazy" />
              </div>
            </div>
            <p className="proof-cap rv">
              Our showroom — that&rsquo;s Chattogram outside the window.
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
