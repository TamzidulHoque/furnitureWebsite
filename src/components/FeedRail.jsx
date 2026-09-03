// Dense film strip of real inventory shots from Heaven's feed —
// credibility texture, rendered small on purpose.
const N = 28;
const thumbs = Array.from({ length: N }, (_, i) => `/img/feed/t${String(i + 1).padStart(2, '0')}.webp`);

export default function FeedRail() {
  const row = (key) =>
    thumbs.map((t, i) => (
      <img src={t} alt="" loading="lazy" width="96" height="96" key={`${key}${i}`} />
    ));
  return (
    <div className="feedrail sec-dark" aria-label="Recent pieces from the Heaven Furniture Mart feed">
      <p className="feedrail-label">
        <span>Real pieces · real homes — from our floor this year</span>
      </p>
      <div className="feedrail-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
