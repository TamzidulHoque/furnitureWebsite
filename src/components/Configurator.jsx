import { lazy, Suspense, useEffect, useState } from 'react';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';
import { MODELS } from './modelRegistry.js';

// Live 3D furniture stage — lazy-loaded so three.js only ships to
// visitors who reach the configurator.
const ModelViewer = lazy(() => import('./ModelViewer.jsx'));

// Per-world piece lists. A piece with a `model` drives the 3D stage;
// the rest still feed the WhatsApp brief.
const PIECE_SETS = {
  classic: [
    { label: 'Bed', model: 'gothicBed' },
    { label: 'Damask Chair', model: 'damaskChair' },
    { label: 'Sofa Set' },
    { label: 'Dining Set' },
    { label: 'Something Custom' },
  ],
  modern: [
    { label: 'Sofa', model: 'glamSofa' },
    { label: 'Lounge Chair', model: 'sheenChair' },
    { label: 'Bed' },
    { label: 'Office Desk' },
    { label: 'Something Custom' },
  ],
  noir: [
    { label: 'Leather Sofa', model: 'leatherSofa' },
    { label: 'Dining Set' },
    { label: 'Console' },
    { label: 'Something Custom' },
  ],
};

export default function Configurator() {
  const { m } = useMode();
  const pieces = PIECE_SETS[m.key];
  const [piece, setPiece] = useState(0);
  const [modelKey, setModelKey] = useState(pieces[0].model);
  const [wood, setWood] = useState(0);
  const [fabric, setFabric] = useState(0);
  const [roomL, setRoomL] = useState('');
  const [roomW, setRoomW] = useState('');

  const model = MODELS[modelKey];
  const woods = model.wood?.options ?? null;
  const fabrics = model.fabric?.options ?? null;

  // world changed: reset the stage to that world's first piece
  useEffect(() => {
    setPiece(0);
    setModelKey(PIECE_SETS[m.key][0].model);
    setWood(0);
    setFabric(0);
  }, [m.key]);

  const choosePiece = (i) => {
    setPiece(i);
    if (pieces[i].model) {
      setModelKey(pieces[i].model);
      setWood(0);
      setFabric(0);
    }
  };

  const message = [
    'Hello Heaven Furniture Mart! I designed a piece on your site and would like a quote.',
    `• Style world: ${m.name}`,
    `• Piece: ${pieces[piece].label}`,
    woods && `• Wood finish: ${woods[wood].name}`,
    fabrics && `• Upholstery: ${fabrics[fabric].name}`,
    roomL && roomW && `• My room: ${roomL} × ${roomW} ft`,
  ].filter(Boolean).join('\n');

  return (
    <div className="config rv" id="configurator">
      <div className="config-canvas-wrap">
        <Suspense fallback={<div className="config-loading">Preparing 3D preview…</div>}>
          <ModelViewer modelKey={modelKey} fabricIdx={fabric} woodIdx={wood} />
        </Suspense>
        <span className="config-tag">Live 3D · {model.label} — drag to turn</span>
      </div>

      <div className="config-panel">
        <h3>Shape your piece in 30 seconds.</h3>
        <p>Pick a direction — our designers take it from there, around your exact space.</p>

        <div className="config-group">
          <div className="config-label"><span>The Piece</span><b>{pieces[piece].label}</b></div>
          <div className="pieces">
            {pieces.map((p, i) => (
              <button key={p.label} className={`piece-btn${piece === i ? ' active' : ''}`} onClick={() => choosePiece(i)}>
                {p.model && <span className="piece-dot" aria-hidden="true">◈</span>}
                {p.label}
              </button>
            ))}
          </div>
          <p className="pieces-legend">◈ live 3D preview — every piece is buildable, previews are a taste</p>
        </div>

        {woods && (
          <div className="config-group">
            <div className="config-label"><span>Wood Finish</span><b>{woods[wood].name}</b></div>
            <div className="swatches">
              {woods.map((w, i) => (
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

        {fabrics && (
          <div className="config-group">
            <div className="config-label"><span>Upholstery</span><b>{fabrics[fabric].name}</b></div>
            <div className="swatches">
              {fabrics.map((f, i) => (
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
            Send This Design to Heaven
          </a>
          <span className="config-note">
            Opens WhatsApp with your choices — no forms, no signup.
          </span>
        </div>
      </div>
    </div>
  );
}
