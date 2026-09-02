import Configurator from './Configurator.jsx';

const STEPS = [
  {
    n: 'i',
    t: 'Consult',
    d: 'Sit with our designers — at the Agrabad showroom or in your own home. The consultation is free, always.',
  },
  {
    n: 'ii',
    t: 'Design',
    d: 'We draw the piece around your space, your measurements and your taste. You approve every line before wood is cut.',
  },
  {
    n: 'iii',
    t: 'Craft & Install',
    d: 'Our in-house craftsmen build it in premium wood. We deliver, install and style it in place — included.',
  },
];

export default function Bespoke() {
  return (
    <section className="bespoke sec-dark" id="bespoke">
      <div className="container">
        <div className="bespoke-head rv">
          <p className="eyebrow">The Heaven Difference</p>
          <h2 className="display" style={{ margin: '18px 0 16px' }}>
            Not from a shelf. <em>From a conversation.</em>
          </h2>
          <p className="lede">
            Bespoke is not an option here — it is the whole house. Three steps stand
            between your idea and your room.
          </p>
        </div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step rv" data-rv-delay={String(i * 0.08)} key={s.t}>
              <span className="step-n">{s.n}.</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>

        <Configurator />
      </div>
    </section>
  );
}
