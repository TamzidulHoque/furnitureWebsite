import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { onFirstView } from '../hooks/useMotion.js';
import QuickView from './QuickView.jsx';
import Ornament from './Ornament.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { srcset, ratio } from '../lib/img.js';
import { byId } from '../data/catalog.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A finished room per world. Every dot is a real piece (id) or a real
// part of the workshop (cat) — nothing here is decoration only.
//
// x / y are percentages of the photograph, and the frame is reserved at that
// photograph's own shape — read from the file by ratio(), never written down
// here. These numbers were placed against cropped frames; when the photographs
// were re-imported whole they all had to move, which is the whole argument for
// not keeping a copy of the shape in this file.
const ROOMS = {
  classic: {
    img: '/img/living-royal.webp',
    title: 'A Chattogram drawing room',
    note: 'Every piece below was built in our Agrabad workshop.',
    spots: [
      // the sofa in this photograph is no longer a piece in the catalogue,
      // so this dot opens the living room rather than a card that is not there
      { x: 20, y: 38.7, room: 'living', label: 'Royal Tufted Sofa' },
      { x: 41, y: 65.7, room: 'living', label: 'Gilded Centre Table' },
      { x: 88, y: 38.7, id: 'floral-salon-sofa', label: 'Matching Settee' },
    ],
  },
  modern: {
    img: '/img/office-desk.webp',
    title: 'A working floor, finished',
    note: 'Desks, seating and storage drawn to one plan.',
    spots: [
      { x: 34, y: 68.1, id: 'manager-desk' },
      { x: 56, y: 50, id: 'mesh-task-chair' },
      { x: 78, y: 53.4, id: 'director-desk', label: 'Desk Beyond' },
      { x: 20, y: 47.4, room: 'office', label: 'Low Storage' },
    ],
  },
  noir: {
    img: '/img/dining-noir.webp',
    title: 'Dinner, after dark',
    note: 'Marble, velvet and brass, cut to your room.',
    spots: [
      { x: 47, y: 62.1, id: 'marble-dining-noir' },
      { x: 22, y: 55.2, room: 'dining', label: 'Quilted Dining Chair' },
      { x: 8, y: 37.4, room: 'living', label: 'Consoles & Cabinets' },
    ],
  },
};

export default function ShopTheRoom() {
  const { m } = useMode();
  const room = ROOMS[m.key];
  const [openId, setOpenId] = useState(null);
  const wrap = useRef(null);

  // dots arrive after the photo has settled
  useEffect(() => {
    if (reduced() || !wrap.current) return;
    let ctx;
    const stop = onFirstView(wrap.current, () => {
      ctx = gsap.context(() => {
        gsap.fromTo('.str-dot', { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.11 });
      }, wrap);
    }, '0px 0px -25% 0px');
    return () => { stop(); ctx?.revert(); };
  }, [m.key]);

  const openRoom = (room) => {
    window.dispatchEvent(new CustomEvent('hfm:filter', { detail: { room } }));
    const target = document.getElementById('collections');
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - 70;
    if (window.__lenis) window.__lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const idSpots = room.spots.filter((s) => s.id);
  const openIdx = openId ? idSpots.findIndex((s) => s.id === openId) : -1;

  return (
    <section className="str sec-dark" id="room">
      <Ornament variant="b" pos="tl" />
      <div className="container str-grid">
        <div className="str-copy rv">
          <p className="eyebrow">Shop the Room — {m.name}</p>
          <h2 className="display" style={{ margin: '18px 0 16px' }}>
            {room.title}
          </h2>
          <p className="lede">{room.note}</p>
        </div>

        <div className="str-stage rv-img" ref={wrap}>
          <div className="framed">
            <div className="crop" style={{ aspectRatio: ratio(room.img) }}>
              <img src={room.img} srcSet={srcset(room.img)} sizes="(max-width: 900px) 100vw, 58vw" alt={room.title} decoding="async" />
              {room.spots.map((s) => {
                const piece = s.id ? byId(s.id) : null;
                const label = s.label ?? piece?.name;
                return (
                  <button
                    key={s.id ?? `${s.room}-${s.x}`}
                    className="str-dot"
                    data-edge={s.x > 72 ? 'r' : s.x < 22 ? 'l' : ''}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    onClick={() => (s.id ? setOpenId(s.id) : openRoom(s.room))}
                    aria-label={`${label} — ${s.id ? 'quick view' : 'browse that room'}`}
                  >
                    <span className="str-ping" aria-hidden="true" />
                    <span className="str-tip">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {openIdx >= 0 && (
        <QuickView
          piece={byId(idSpots[openIdx].id)}
          onClose={() => setOpenId(null)}
          onStep={(d) => setOpenId(idSpots[(openIdx + d + idSpots.length) % idSpots.length].id)}
        />
      )}
    </section>
  );
}
