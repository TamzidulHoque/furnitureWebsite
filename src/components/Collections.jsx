import { useMode } from '../mode/ModeContext.jsx';

export default function Collections() {
  const { m } = useMode();
  return (
    <section className="collections sec-light alt" id="collections">
      <div className="container">
        <div className="col-head">
          <div className="rv">
            <p className="eyebrow">Collections — {m.name}</p>
            <h2 className="display" style={{ marginTop: 18 }}>A glimpse, not a catalogue.</h2>
          </div>
          <p className="lede rv" data-rv-delay="0.1">
            Every piece below left our own workshop. Whatever you see can be rebuilt
            to your size, wood and fabric — or designed from a blank page.
          </p>
        </div>
        <div className="col-grid" key={m.key}>
          {m.tiles.map((t, i) => (
            <article className={`col-card ${t.span}${t.tall ? ' tall' : ''}`} key={t.name}>
              <div className="framed">
                <div className="crop rv-img">
                  <img src={t.img} alt={`${t.name} collection — ${t.tag}`} loading="lazy" />
                </div>
              </div>
              <div className="col-meta rv" data-rv-delay={String(0.05 * i)}>
                <h3>{t.name}</h3>
                <span>{t.tag}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
