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

export default function Ledger() {
  return (
    <section className="ledger sec-light" id="why">
      <Ornament variant="b" pos="tr" />
      <div className="container ledger-grid">
        <div className="ledger-sticky rv">
          <p className="eyebrow">The Order Slip</p>
          <h2 className="display" style={{ marginTop: 18 }}>
            Why hundreds of homes chose Heaven.
          </h2>
          <p className="lede">
            Written plainly, and kept on every order.
          </p>
        </div>
        <div className="ledger-rows">
          {ROWS.map((r, i) => (
            <div className="ledger-row rv" data-rv-delay={String(i * 0.05)} key={r.t}>
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
