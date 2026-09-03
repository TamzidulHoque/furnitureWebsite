import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { waLink } from '../site.config.js';
import { CATEGORIES, FABRICS, WOODS } from '../data/catalog.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const catLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

// One piece, opened over the grid: bigger photo, the finishes we offer on it,
// your room size, and a WhatsApp message already written.
export default function QuickView({ piece, onClose, onStep }) {
  const [wood, setWood] = useState(0);
  const [fabric, setFabric] = useState(0);
  const [roomL, setRoomL] = useState('');
  const [roomW, setRoomW] = useState('');
  const card = useRef(null);
  const veil = useRef(null);
  const closeBtn = useRef(null);
  const returnTo = useRef(null);

  const hasWood = piece.finish.includes('wood');
  const hasFabric = piece.finish.includes('fabric');

  // new piece via prev/next: finishes start fresh, the photo cross-fades
  useEffect(() => {
    setWood(0);
    setFabric(0);
    if (!reduced() && card.current) {
      gsap.fromTo(card.current.querySelector('.qv-photo'),
        { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
    }
  }, [piece.id]);

  // open: lock the page, trap focus on the dialog, restore both on close
  useEffect(() => {
    returnTo.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    closeBtn.current?.focus();
    if (!reduced()) {
      gsap.fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(card.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
      returnTo.current?.focus?.();
    };
  }, [onClose, onStep]);

  const message = [
    'Hello Heaven Furniture Mart! I found a piece on your site and would like a quote.',
    `• Piece: ${piece.name} (${catLabel(piece.cat)})`,
    hasWood && `• Wood finish: ${WOODS[wood].name}`,
    hasFabric && `• Upholstery: ${FABRICS[fabric].name}`,
    roomL && roomW && `• My room: ${roomL} × ${roomW} ft`,
  ].filter(Boolean).join('\n');

  return (
    <div className="qv" role="dialog" aria-modal="true" aria-label={piece.name}>
      <div className="qv-veil" ref={veil} onClick={onClose} />
      <div className="qv-card" ref={card}>
        <button className="qv-close" ref={closeBtn} onClick={onClose} aria-label="Close quick view">×</button>

        <div className="qv-left">
          <div className="framed">
            <div className="crop">
              <img className="qv-photo" src={piece.img} alt={piece.name} />
            </div>
          </div>
          <div className="qv-step">
            <button onClick={() => onStep(-1)} aria-label="Previous piece">← Prev</button>
            <span>{catLabel(piece.cat)}</span>
            <button onClick={() => onStep(1)} aria-label="Next piece">Next →</button>
          </div>
        </div>

        <div className="qv-right">
          <p className="eyebrow">{catLabel(piece.cat)} · Made to order</p>
          <h3 className="qv-name">{piece.name}</h3>
          <p className="qv-blurb">{piece.blurb}</p>
          <p className="qv-spec">{piece.spec}</p>

          {hasWood && (
            <div className="config-group">
              <div className="config-label"><span>Wood Finish</span><b>{WOODS[wood].name}</b></div>
              <div className="swatches">
                {WOODS.map((w, i) => (
                  <button
                    key={w.name}
                    className={`swatch${wood === i ? ' active' : ''}`}
                    style={{ background: w.css }}
                    title={w.name}
                    aria-label={`Wood: ${w.name}`}
                    onClick={() => setWood(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasFabric && (
            <div className="config-group">
              <div className="config-label"><span>Upholstery</span><b>{FABRICS[fabric].name}</b></div>
              <div className="swatches">
                {FABRICS.map((f, i) => (
                  <button
                    key={f.name}
                    className={`swatch${fabric === i ? ' active' : ''}`}
                    style={{ background: f.css }}
                    title={f.name}
                    aria-label={`Fabric: ${f.name}`}
                    onClick={() => setFabric(i)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="config-group">
            <div className="config-label">
              <span>Your Space — optional</span>
              <b>{roomL && roomW ? `${roomL} × ${roomW} ft` : 'we build to fit'}</b>
            </div>
            <div className="room-inputs">
              <input
                type="number" min="1" max="99" inputMode="numeric" placeholder="Length"
                aria-label="Room length in feet"
                value={roomL} onChange={(e) => setRoomL(e.target.value.slice(0, 2))}
              />
              <span aria-hidden="true">×</span>
              <input
                type="number" min="1" max="99" inputMode="numeric" placeholder="Width"
                aria-label="Room width in feet"
                value={roomW} onChange={(e) => setRoomW(e.target.value.slice(0, 2))}
              />
              <span className="room-unit">feet</span>
            </div>
          </div>

          <div className="config-cta">
            <a className="btn btn-solid" href={waLink(message)} target="_blank" rel="noreferrer">
              Ask About This Piece
            </a>
            <span className="config-note">
              Opens WhatsApp with your choices filled in — no forms, no signup.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
