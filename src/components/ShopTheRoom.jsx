import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import QuickView from './QuickView.jsx';
import Ornament from './Ornament.jsx';
import { useMode } from '../mode/ModeContext.jsx';
import { byId } from '../data/catalog.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A finished room per world. Every dot is a real piece (id) or a real
// part of the workshop (cat) — nothing here is decoration only.
// x / y are percentages of the photo, which is shown at its own ratio
// so the dots land exactly where they were placed.
const ROOMS = {
  classic: {
    img: '/img/living-royal.webp',
    ratio: '1024 / 590',
    title: 'A Chattogram drawing room',
    note: 'Every piece below was built in our Agrabad workshop.',
    spots: [
      { x: 20, y: 22, id: 'royal-tufted-sofa' },
      { x: 41, y: 69, room: 'living', label: 'Gilded Centre Table' },
      { x: 88, y: 22, id: 'floral-salon-sofa', label: 'Matching Settee' },
    ],
  },
  modern: {
    img: '/img/office-desk.webp',
    ratio: '1080 / 931',
    title: 'A working floor, finished',
    note: 'Desks, seating and storage drawn to one plan.',
    spots: [
      { x: 34, y: 79, id: 'manager-desk' },
      { x: 56, y: 58, id: 'mesh-task-chair' },
      { x: 78, y: 62, id: 'director-desk', label: 'Desk Beyond' },
      { x: 20, y: 55, room: 'office', label: 'Low Storage' },
    ],
  },
  noir: {
    img: '/img/dining-noir.webp',
    ratio: '1024 / 590',
    title: 'Dinner, after dark',
    note: 'Marble, velvet and brass, cut to your room.',
    spots: [
      { x: 47, y: 61, id: 'marble-dining-noir' },
      { x: 22, y: 49, room: 'dining', label: 'Quilted Dining Chair' },
      { x: 8, y: 18, room: 'living', label: 'Consoles & Cabinets' },
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
    const ctx = gsap.context(() => {
      gsap.fromTo('.str-dot',
        { scale: 0, autoAlpha: 0 },
        {
          scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.11,
          scrollTrigger: { trigger: wrap.current, start: 'top 70%' },
        });
    }, wrap);
    return () => ctx.revert();
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
            <div className="crop" style={{ aspectRatio: room.ratio }}>
              <img src={room.img} alt={room.title} loading="lazy" />
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
