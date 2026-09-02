import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';
import { MODELS } from './modelRegistry.js';

// Two preview engines:
//  photo — a real Heaven piece, recoloured live (photo-segmented wood +
//          upholstery masks, hue-preserving canvas blends)
//  3d    — real-time glTF furniture, lazy-loaded so three.js only ships
//          to visitors who open a 3D piece
const ModelViewer = lazy(() => import('./ModelViewer.jsx'));

const BASE = '/img/chairs-studio.webp';
const MASK_WOOD = '/img/mask-wood.png';
const MASK_FABRIC = '/img/mask-fabric.png';

const PHOTO_WOODS = [
  { name: 'Rosewood', css: '#5a3b2a', original: true },
  { name: 'Walnut', css: '#6b4a2f', tint: '#6b4a2f', deepen: 0.12, lift: 0.22 },
  { name: 'Golden Oak', css: '#b08347', tint: '#c89a5e', deepen: 0, lift: 0.6 },
  { name: 'Black Lacquer', css: '#211c19', tint: '#3a352f', deepen: 0.55, lift: 0 },
];
const PHOTO_FABRICS = [
  { name: 'Ivory Jacquard', css: '#e8ddc4', original: true },
  { name: 'Royal Blue Velvet', css: '#27439b', tint: '#27439b', deepen: 0.62 },
  { name: 'Emerald Velvet', css: '#1f5c4a', tint: '#17493b', deepen: 0.72 },
  { name: 'Blush Linen', css: '#c98a7d', tint: '#c98a7d', deepen: 0.16 },
  { name: 'Charcoal Weave', css: '#4a4a4e', tint: '#55555c', deepen: 0.55 },
];

// Per-world piece lists. A piece with a `preview` drives the stage;
// the rest still feed the WhatsApp brief.
const PIECE_SETS = {
  classic: [
    { label: 'Accent Chairs', preview: { type: 'photo' } },
    { label: 'Damask Chair', preview: { type: '3d', model: 'damaskChair' } },
    { label: 'Sofa Set' },
    { label: 'Bed' },
    { label: 'Dining Set' },
    { label: 'Something Custom' },
  ],
  modern: [
    { label: 'Sofa', preview: { type: '3d', model: 'glamSofa' } },
    { label: 'Lounge Chair', preview: { type: '3d', model: 'sheenChair' } },
    { label: 'Bed' },
    { label: 'Office Desk' },
    { label: 'Something Custom' },
  ],
  noir: [
    { label: 'Leather Sofa', preview: { type: '3d', model: 'leatherSofa' } },
    { label: 'Accent Chairs', preview: { type: 'photo' } },
    { label: 'Dining Set' },
    { label: 'Console' },
    { label: 'Something Custom' },
  ],
};

function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export default function Configurator() {
  const { m } = useMode();
  const pieces = PIECE_SETS[m.key];
  const canvasRef = useRef(null);
  const assets = useRef(null);
  const [ready, setReady] = useState(false);
  const [piece, setPiece] = useState(0);
  const [preview, setPreview] = useState(pieces[0].preview);
  const [wood, setWood] = useState(0);
  const [fabric, setFabric] = useState(0);

  const is3D = preview?.type === '3d';
  const model = is3D ? MODELS[preview.model] : null;
  const woods = is3D ? (model.wood?.options ?? null) : PHOTO_WOODS;
  const fabrics = is3D ? model.fabric.options : PHOTO_FABRICS;

  // world changed: reset the stage to that world's first piece
  useEffect(() => {
    setPiece(0);
    setPreview(PIECE_SETS[m.key][0].preview);
    setWood(0);
    setFabric(0);
  }, [m.key]);

  const choosePiece = (i) => {
    setPiece(i);
    const p = pieces[i].preview;
    if (p) {
      setPreview(p);
      setWood(0);
      setFabric(0);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([loadImg(BASE), loadImg(MASK_WOOD), loadImg(MASK_FABRIC)])
      .then(([base, mw, mf]) => {
        if (!alive) return;
        assets.current = { base, mw, mf };
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (is3D || !ready || !canvasRef.current) return;
    const { base, mw, mf } = assets.current;
    const cv = canvasRef.current;
    cv.width = base.naturalWidth;
    cv.height = base.naturalHeight;
    const ctx = cv.getContext('2d');
    ctx.drawImage(base, 0, 0);

    const applyMaterial = (maskImg, opt) => {
      if (opt.original) return;
      const W = cv.width, H = cv.height;
      const layer = document.createElement('canvas');
      layer.width = W; layer.height = H;
      const lc = layer.getContext('2d');
      lc.drawImage(base, 0, 0);
      lc.globalCompositeOperation = 'color';       // keep luminance, take hue/sat
      lc.fillStyle = opt.tint;
      lc.fillRect(0, 0, W, H);
      if (opt.deepen > 0) {
        lc.globalCompositeOperation = 'multiply';  // depth for velvets/lacquer
        lc.globalAlpha = opt.deepen;
        lc.fillStyle = opt.tint;
        lc.fillRect(0, 0, W, H);
        lc.globalAlpha = 1;
      }
      if (opt.lift > 0) {
        lc.globalCompositeOperation = 'overlay';   // lighter finishes, texture kept
        lc.globalAlpha = opt.lift;
        lc.fillStyle = opt.tint;
        lc.fillRect(0, 0, W, H);
        lc.globalAlpha = 1;
      }
      lc.globalCompositeOperation = 'destination-in';
      lc.drawImage(maskImg, 0, 0, W, H);
      ctx.drawImage(layer, 0, 0);
    };

    applyMaterial(mw, PHOTO_WOODS[wood]);
    applyMaterial(mf, PHOTO_FABRICS[fabric]);
  }, [is3D, ready, wood, fabric]);

  const message =
    `Hello Heaven Furniture Mart! I designed a piece on your site and would like a quote.\n` +
    `• Style world: ${m.name}\n` +
    `• Piece: ${pieces[piece].label}\n` +
    (woods ? `• Wood finish: ${woods[wood].name}\n` : '') +
    `• Upholstery: ${fabrics[fabric].name}`;

  return (
    <div className="config rv" id="configurator">
      <div className="config-canvas-wrap">
        {is3D ? (
          <Suspense fallback={<div className="config-loading">Preparing 3D preview…</div>}>
            <ModelViewer modelKey={preview.model} fabricIdx={fabric} woodIdx={wood} />
          </Suspense>
        ) : ready ? (
          <canvas ref={canvasRef} aria-label="Live preview of your fabric and wood choices on a Heaven chair set" />
        ) : (
          <img src={BASE} alt="Heaven accent chair set" />
        )}
        <span className="config-tag">
          {is3D ? `Live 3D · ${model.label} — drag to turn` : 'Live preview · real Heaven piece'}
        </span>
      </div>

      <div className="config-panel">
        <h3>Shape your piece in 30 seconds.</h3>
        <p>Pick a direction — our designers take it from there, around your exact space.</p>

        <div className="config-group">
          <div className="config-label"><span>The Piece</span><b>{pieces[piece].label}</b></div>
          <div className="pieces">
            {pieces.map((p, i) => (
              <button key={p.label} className={`piece-btn${piece === i ? ' active' : ''}`} onClick={() => choosePiece(i)}>
                {p.preview && <span className="piece-dot" aria-hidden="true">{p.preview.type === '3d' ? '◈' : '◉'}</span>}
                {p.label}
              </button>
            ))}
          </div>
          <p className="pieces-legend">◈ live 3D preview &nbsp;·&nbsp; ◉ live photo preview</p>
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
