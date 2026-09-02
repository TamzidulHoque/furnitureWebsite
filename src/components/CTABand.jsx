import Ornament from './Ornament.jsx';
import { SITE, WA_DEFAULT } from '../site.config.js';

export default function CTABand() {
  return (
    <section className="ctaband sec-dark" style={{ background: 'var(--ground-deep)' }}>
      <Ornament variant="b" pos="br" />
      <div className="container">
        <p className="eyebrow rv">One Conversation Away</p>
        <h2 className="display rv" data-rv-delay="0.05">
          Begin with a <em>conversation.</em>
        </h2>
        <p className="lede rv" data-rv-delay="0.1">
          Tell us about your room. We&rsquo;ll bring the drawings, the wood samples and
          the tea. আপনার ঘর, আপনার নকশা।
        </p>
        <div className="cta-actions rv" data-rv-delay="0.15">
          <a className="btn btn-solid" href={WA_DEFAULT} target="_blank" rel="noreferrer">
            WhatsApp Us
          </a>
          <a className="btn btn-ghost" href={SITE.phoneHref}>
            Call {SITE.phoneDisplay}
          </a>
        </div>
        <p className="cta-fineprint rv" data-rv-delay="0.2">
          {SITE.address}
        </p>
      </div>
    </section>
  );
}
