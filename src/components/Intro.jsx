import { SITE } from '../site.config.js';

export default function Intro() {
  return (
    <section className="intro sec-light">
      <div className="container intro-grid">
        <div className="intro-left rv">
          <p className="eyebrow">The House</p>
          <p className="intro-statement">
            {SITE.tagline.split('. ').map((w, i) => (
              <span key={i}>
                {i === 2 ? <em>{w}</em> : w}
                {i < 2 ? '. ' : ''}
              </span>
            ))}
          </p>
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
