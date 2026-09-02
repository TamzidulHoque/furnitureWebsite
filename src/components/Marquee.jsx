const ITEMS = [
  'Free Design Consultation',
  'Fully Bespoke — Built to Your Space',
  'Premium Wood & In-house Craftsmanship',
  'Delivery & Installation Included',
  'Agrabad Showroom, Chattogram',
  'Easy Payment Options',
];

export default function Marquee() {
  const row = ITEMS.map((t, i) => (
    <span className="marquee-item" key={i}>{t}</span>
  ));
  return (
    <div className="marquee sec-dark" aria-hidden="true">
      <div className="marquee-track">
        {row}
        {ITEMS.map((t, i) => (
          <span className="marquee-item" key={`b${i}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}
