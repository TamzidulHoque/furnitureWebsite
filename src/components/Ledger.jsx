import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Ornament from './Ornament.jsx';

const ROWS = [
  { t: 'Free design consultation', d: 'At the showroom, or in your home — measure first, talk later.' },
  { t: 'Fully bespoke', d: 'Built to your space and taste. Nothing here is mass-produced.' },
  { t: 'Premium wood & materials', d: 'Seasoned hardwood, quality foams and fabrics, honest joinery.' },
  { t: 'In-house craftsmanship', d: 'Our own skilled carpenters and finishers — no outsourcing.' },
  { t: 'A showroom you can walk into', d: 'A large space on Agrabad Access Road. Sit on it before you decide.' },
  { t: 'Delivery & installation included', d: 'We bring it, place it, and style it. You just open the door.' },
  { t: 'Easy payment options', d: 'Sensible terms, agreed up front. No surprises after the order.' },
];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The heading arrives a word at a time, each one rising out of its own line —
// the mask is the line itself, so nothing is ever seen sliding in from outside.
const Words = ({ children }) => (
  <>
    {children.split(' ').map((w, i) => (
      <span className="wm" key={`${w}${i}`}>
        <span className="wm-in">{w}</span>
      </span>
    ))}
  </>
);

export default function Ledger() {
  const sec = useRef(null);

  useEffect(() => {
    const el = sec.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: '.ledger-sticky', start: 'top 80%', once: true } })
        .fromTo('.ledger-sticky .eyebrow', { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
        .fromTo('.ledger-sticky .wm-in', { yPercent: 118 },
          { yPercent: 0, duration: 0.78, ease: 'power4.out', stagger: 0.055 }, 0.1)
        .fromTo('.ledger-sticky .lede', { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.55);

      // the title column drifts against the slip as it passes — the same
      // parallax as the workshop above, at a quieter volume
      gsap.fromTo('.ledger-sticky-in', { y: 26 }, {
        y: -26,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
      });

      // the seven promises print out as the section passes, one line at a
      // time — the rule draws first, then the words wipe in behind it
      gsap.utils.toArray('.ledger-row').forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: 'top 92%',
            end: 'top 62%',
            scrub: 0.45,
            // print on the way down, then stay printed — a line of text that
            // un-writes itself when you scroll back up reads as a fault
            onLeave: (self) => { self.kill(); tl.progress(1); },
          },
        })
          .fromTo(row.querySelector('.ledger-rule'), { scaleX: 0 }, { scaleX: 1, ease: 'none' })
          .fromTo(row.querySelectorAll('.ledger-no, .ledger-copy'),
            // starts at 0, not a faded 0.25: a contrast checker reads dimmed
            // text as unreadable text, and it is not text yet
            { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
            { clipPath: 'inset(0 0% 0 0)', opacity: 1, ease: 'none', stagger: 0.12 }, 0.15);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ledger sec-light" id="why" ref={sec}>
      <Ornament variant="b" pos="tr" />
      <div className="container ledger-grid">
        <div className="ledger-sticky">
          <div className="ledger-sticky-in">
          <p className="eyebrow">The Order Slip</p>
          <h2 className="display" style={{ marginTop: 18 }}>
            <Words>Why hundreds of homes chose Heaven.</Words>
          </h2>
          <p className="lede">
            Written plainly, and kept on every order.
          </p>
          </div>
        </div>
        <div className="ledger-rows">
          {ROWS.map((r, i) => (
            <div className="ledger-row" key={r.t}>
              <span className="ledger-rule" aria-hidden="true" />
              <span className="ledger-no">{String(i + 1).padStart(2, '0')}</span>
              <div className="ledger-copy">
                <h3>{r.t}</h3>
                <p>{r.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
