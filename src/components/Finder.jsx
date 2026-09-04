import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import QuickView from './QuickView.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';
import { srcset } from '../lib/img.js';
import { CATALOG } from '../data/catalog.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROOMS = [
  { key: 'beds', plan: 'bedroom', planLabel: 'bedroom', label: 'A bedroom', note: 'beds, wardrobes, side tables' },
  { key: 'sofas', plan: 'living', planLabel: 'living room', label: 'A living room', note: 'sofas, centre tables, consoles' },
  { key: 'dining', plan: 'dining', planLabel: 'dining room', label: 'A dining room', note: 'tables, chairs, cabinets' },
  { key: 'office', plan: 'office', planLabel: 'office', label: 'An office', note: 'desks, workstations, meeting rooms' },
  { key: 'chairs', plan: 'living', planLabel: 'living room', label: 'Just a chair', note: 'seating, task or statement' },
];

const WORLDS = [
  { key: 'classic', label: 'Ornate & carved', note: 'gold leaf, deep buttoning, ceremony' },
  { key: 'modern', label: 'Clean & light', note: 'straight lines, pale woods, calm' },
  { key: 'noir', label: 'Dark & dramatic', note: 'lacquer, leather, brass' },
];

const STEPS = ['What room?', 'What feeling?', 'How big?'];

// Three questions, then three real pieces from the catalogue — and the
// answer to question 2 re-skins the whole site around you.
export default function Finder() {
  const { m, setMode } = useMode();
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [world, setWorld] = useState(null);
  const [roomL, setRoomL] = useState('');
  const [roomW, setRoomW] = useState('');
  const [openId, setOpenId] = useState(null);
  const stageRef = useRef(null);

  const advance = (to) => {
    const el = stageRef.current;
    if (reduced() || !el) { setStep(to); return; }
    gsap.timeline()
      .to(el, { opacity: 0, y: to > step ? -18 : 18, duration: 0.24, ease: 'power2.in' })
      .add(() => setStep(to))
      .fromTo(el, { opacity: 0, y: to > step ? 18 : -18 }, { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' });
  };

  const answerRoom = (key) => { setRoom(key); advance(1); };
  const answerWorld = (key) => {
    setWorld(key);
    setMode(key);            // the whole site turns to match the answer
    advance(2);
  };

  // best three: the chosen room in the chosen world first, then the same
  // room in any world, then anything from that world.
  const picks = useMemo(() => {
    if (!room || !world) return [];
    const score = (p) => (p.cat === room ? 2 : 0) + (p.world === world ? 1 : 0);
    return [...CATALOG].sort((a, b) => score(b) - score(a)).filter((p) => score(p) > 0).slice(0, 3);
  }, [room, world]);

  const roomLabel = ROOMS.find((r) => r.key === room)?.label ?? '';
  const worldLabel = WORLDS.find((w) => w.key === world)?.label ?? '';

  const message = [
    'Hello Heaven Furniture Mart! I used the Design Finder on your site.',
    `• Looking for: ${roomLabel}`,
    `• Style: ${worldLabel}`,
    roomL && roomW && `• My room: ${roomL} × ${roomW} ft`,
    picks.length && `• Pieces I liked: ${picks.map((p) => p.name).join(', ')}`,
    'Could you send me a quote and a consultation time?',
  ].filter(Boolean).join('\n');

  const browseAll = () => {
    const plan = ROOMS.find((r) => r.key === room)?.plan;
    window.dispatchEvent(new CustomEvent('hfm:filter', { detail: { room: plan } }));
    const target = document.getElementById('collections');
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 70;
    if (window.__lenis) window.__lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const restart = () => { setRoom(null); setWorld(null); setRoomL(''); setRoomW(''); advance(0); };
  const openIdx = openId ? picks.findIndex((p) => p.id === openId) : -1;

  return (
    <div className="finder" id="finder">
      <div className="finder-head">
        <p className="eyebrow">Design Finder</p>
        <h3>Three questions, three pieces.</h3>
        <ol className="finder-steps" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
              <span>{i + 1}</span>{s}
            </li>
          ))}
        </ol>
      </div>

      <div className="finder-stage" ref={stageRef}>
        {step === 0 && (
          <div className="finder-q">
            <p className="finder-ask">What are you furnishing?</p>
            <div className="opt-grid">
              {ROOMS.map((r) => (
                <button key={r.key} className="opt" onClick={() => answerRoom(r.key)}>
                  <b>{r.label}</b><span>{r.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="finder-q">
            <p className="finder-ask">Which of these feels like you?</p>
            <div className="opt-grid">
              {WORLDS.map((w) => (
                <button key={w.key} className="opt opt-world" onClick={() => answerWorld(w.key)}>
                  <i className="opt-swatch" style={{ background: `var(--sw-${w.key})` }} aria-hidden="true" />
                  <b>{w.label}</b><span>{w.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="finder-result">
            <div className="finder-summary">
              <p className="finder-ask">
                Three pieces for {roomLabel.toLowerCase()} — in {m.name}.
              </p>
              <div className="config-group" style={{ marginTop: 18 }}>
                <div className="config-label">
                  <span>Your room — optional</span>
                  <b>{roomL && roomW ? `${roomL} × ${roomW} ft` : 'we build to fit'}</b>
                </div>
                <div className="room-inputs">
                  <input type="number" min="1" max="99" inputMode="numeric" placeholder="Length"
                    aria-label="Room length in feet" value={roomL}
                    onChange={(e) => setRoomL(e.target.value.slice(0, 2))} />
                  <span aria-hidden="true">×</span>
                  <input type="number" min="1" max="99" inputMode="numeric" placeholder="Width"
                    aria-label="Room width in feet" value={roomW}
                    onChange={(e) => setRoomW(e.target.value.slice(0, 2))} />
                  <span className="room-unit">feet</span>
                </div>
              </div>
              <div className="config-cta">
                <a className="btn btn-solid" href={waLink(message)} target="_blank" rel="noreferrer">
                  Send My Brief to Heaven
                </a>
                <div className="finder-links">
                  <button className="linkish" onClick={browseAll}>
                    See the whole {ROOMS.find((r) => r.key === room)?.planLabel ?? 'house'}
                  </button>
                  <button className="linkish" onClick={restart}>Start over</button>
                </div>
              </div>
            </div>

            <div className="finder-picks">
              {picks.map((p) => (
                <button className="fp" key={p.id} onClick={() => setOpenId(p.id)}>
                  <div className="framed"><div className="crop">
                    <img src={p.img} srcSet={srcset(p.img)} sizes="(max-width: 900px) 30vw, 18vw" alt={p.name} loading="lazy" />
                  </div></div>
                  <b>{p.name}</b>
                  <span>{p.blurb}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {openIdx >= 0 && (
        <QuickView
          piece={picks[openIdx]}
          onClose={() => setOpenId(null)}
          onStep={(d) => setOpenId(picks[(openIdx + d + picks.length) % picks.length].id)}
        />
      )}
    </div>
  );
}
