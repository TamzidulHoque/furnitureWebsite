import { SITE } from '../site.config.js';
import { useMode } from '../mode/ModeContext.jsx';

export default function Footer() {
  const { m } = useMode();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a className="logo" href="#top" aria-label={SITE.name}>
              <img src={m.logo} alt={SITE.name} width="216" height="74" />
            </a>
            <p className="footer-tag">{SITE.tagline}</p>
          </div>
          <div className="footer-col">
            <h3>Visit</h3>
            <p>{SITE.address}</p>
            <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
          <div className="footer-col">
            <h3>Follow</h3>
            <a href={SITE.social.facebook} target="_blank" rel="noreferrer">Facebook</a>
            <a href={SITE.social.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={SITE.social.youtube} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>3D previews: Khronos glTF samples © Wayfair · DGG · Poly Haven (CC BY 4.0)</span>
          <span>Bespoke furniture &amp; interior styling — Chattogram, Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
