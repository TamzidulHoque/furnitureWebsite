import Ornament from './Ornament.jsx';
import Finder from './Finder.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { srcset } from '../lib/img.js';

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

// Noir's material is leather, and the only photograph of a belt we have sits
// on a white studio ground — a white rectangle pinned to this dark page reads
// as a mistake, whatever is in it. So the belt is drawn: brass buckle leading,
// stitched strap, punched holes, in the world's own two colours.
function Belt() {
  return (
    <svg className="bsp-belt" viewBox="0 0 360 132" fill="none" aria-hidden="true">
      {/* Drawn buckle-first: the card hangs off the right edge of the page, so
          whatever sits on the right is cut. The strap is flipped in CSS, which
          puts the buckle inboard and lets the plain tip be the part that goes. */}
      <path
        className="belt-strap"
        d="M18 48 L250 48 L250 84 L18 84 C10 84 4 78 4 70 L4 62 C4 54 10 48 18 48 Z"
      />
      {/* the stitch line just inside the edge */}
      <path className="belt-stitch" d="M20 55 L250 55 M20 77 L250 77" />
      {/* punched holes */}
      {[62, 92, 122, 152, 182].map((x) => (
        <ellipse key={x} className="belt-hole" cx={x} cy="66" rx="3.6" ry="5.2" />
      ))}
      {/* the keeper loop, then the buckle */}
      <rect className="belt-brass" x="252" y="42" width="15" height="48" rx="4" />
      <rect className="belt-brass" x="278" y="34" width="66" height="64" rx="12" />
      <path className="belt-prong" d="M311 66 L244 66" />
      <circle className="belt-pin" cx="311" cy="66" r="5" />
    </svg>
  );
}

// The heading here carried a wash, then a parallax photograph, then a drawn
// rule. Each one rendered badly on the way in, so the heading now simply
// stands there — no reveal, no layer behind it, nothing to go wrong. The
// three steps keep the site's ordinary reveal; the Design Finder below keeps
// its entrance, and the order slip keeps its printing.
export default function Bespoke() {
  const { m } = useMode();
  return (
    <section className="bespoke sec-dark" id="bespoke">
      <Ornament variant="b" pos="bl" />
      {/* The material this world is made of, pinned into the top corner and
          carried past on the section's own timeline. It is a swatch card, not
          a loose photograph: two of the three sit on white or pale wood, and
          a bare rectangle of that on a dark ground reads as a mistake, where
          a pinned sample reads as the point being made. */}
      <figure className={`bsp-swatch${m.swatchDraw ? ' bsp-swatch-drawn' : ''}`} aria-hidden="true">
        {m.swatchDraw
          ? <Belt />
          : <img src={m.swatchImg} srcSet={srcset(m.swatchImg)} sizes="26vw"
                 alt="" loading="lazy" decoding="async" />}
        <figcaption>{m.swatchAlt}</figcaption>
      </figure>
      <div className="container">
        <div className="bespoke-head">
          <p className="eyebrow">The Heaven Difference</p>
          <h2 className="display" style={{ margin: '18px 0 16px' }}>
            Not from a shelf. <em>From a conversation.</em>
          </h2>
          <p className="lede">
            Bespoke is not an option here — it is the whole house.
          </p>
          <span className="bsp-rule" aria-hidden="true" />
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

        <Finder />
      </div>
    </section>
  );
}
