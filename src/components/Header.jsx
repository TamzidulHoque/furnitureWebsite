import { useEffect, useState } from 'react';
import { SITE, WA_DEFAULT } from '../site.config.js';
import { useMode } from '../mode/ModeContext.jsx';

export default function Header() {
  const { m } = useMode();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`header sec-dark${scrolled ? ' scrolled' : ''}`} style={{ background: scrolled ? undefined : 'transparent' }}>
      <div className="container">
        <a className="logo" href="#top" aria-label={SITE.name}>
          <img src={m.logo} alt={SITE.name} width="196" height="67" />
        </a>
        <nav className="nav" aria-label="Primary">
          <a href="#room">Shop the Room</a>
          <a href="#collections">Collection</a>
          <a href="#finder">Find Yours</a>
          <a href="#why">Why Heaven</a>
          <a href="#visit">Visit Us</a>
        </nav>
        <a className="btn btn-solid" href={WA_DEFAULT} target="_blank" rel="noreferrer">
          Free Consultation
        </a>
      </div>
    </header>
  );
}
