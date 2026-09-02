import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useMode } from '../mode/ModeContext.jsx';
import { waLink } from '../site.config.js';

// CLASSIC / NOIR: a real Heaven piece, recoloured live — photo-segmented
// wood + upholstery masks, hue-preserving canvas blends. No 3D model can
// be this on-brand: it IS their furniture.
// MODERN: a real-time 3D velvet sofa (lazy-loaded, three.js only ships
// to visitors who enter the Modern world).
const Sofa3D = lazy(() => import('./SofaViewer.jsx'));

const BASE = '/img/chairs-studio.webp';
const MASK_WOOD = '/img/mask-wood.png';
const MASK_FABRIC = '/img/mask-fabric.png';

const WOODS = [
  { name: 'Rosewood', css: '#5a3b2a', original: true },
  { name: 'Walnut', css: '#6b4a2f', tint: '#6b4a2f', deepen: 0.12, lift: 0.22 },
  { name: 'Golden Oak', css: '#b08347', tint: '#c89a5e', deepen: 0, lift: 0.6 },
  { name: 'Black Lacquer', css: '#211c19', tint: '#3a352f', deepen: 0.55, lift: 0 },
];
const FABRICS = [
  { name: 'Ivory Jacquard', css: '#e8ddc4', original: true },
  { name: 'Royal Blue Velvet', css: '#27439b', tint: '#27439b', deepen: 0.62 },
  { name: 'Emerald Velvet', css: '#1f5c4a', tint: '#17493b', deepen: 0.72 },
  { name: 'Blush Linen', css: '#c98a7d', tint: '#c98a7d', deepen: 0.16 },
  { name: 'Charcoal Weave', css: '#4a4a4e', tint: '#55555c', deepen: 0.55 },
];

// glTF variant names from the model + leg finishes
const WOODS_3D = [
  { name: 'Natural Oak', css: '#9a7648', leg: '#9a7648' },
  { name: 'Walnut', css: '#5f4630', leg: '#5f4630' },
  { name: 'Espresso', css: '#37281c', leg: '#37281c' },
  { name: 'Black', css: '#1d1d1f', leg: '#1d1d1f' },
];
const FABRICS_3D = [
  { name: 'Champagne Velvet', css: '#d9c7a8', variant: 'Champagne' },
  { name: 'Navy Velvet', css: '#2b3a5e', variant: 'Navy' },
  { name: 'Dove Gray Velvet', css: '#8a8a8f', variant: 'Gray' },
  { name: 'Black Velvet', css: '#262626', variant: 'Black' },
  { name: 'Pale Pink Velvet', css: '#d8a8a3', variant: 'Pale Pink' },
];

const PIECES = ['Sofa Set', 'Bed', 'Dining Set', 'Office Desk', 'Accent Chairs', 'Something Custom'];

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
  const is3D = m.key === 'modern';
  const canvasRef = useRef(null);
  const assets = useRef(null);
  const [ready, setReady] = useState(false);
  const [wood, setWood] = useState(0);
  const [fabric, setFabric] = useState(0);
  const [piece, setPiece] = useState(0);

  const woods = is3D ? WOODS_3D : WOODS;
  const fabrics = is3D ? FABRICS_3D : FABRICS;

  // selections don't carry meaning across worlds
  useEffect(() => { setWood(0); setFabric(0); }, [m.key]);

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

    applyMaterial(mw, WOODS[wood]);
    applyMaterial(mf, FABRICS[fabric]);
  }, [is3D, ready, wood, fabric]);

  const message =
    `Hello Heaven Furniture Mart! I designed a piece on your site and would like a quote.\n` +
    `• Style world: ${m.name}\n` +
    `• Piece: ${PIECES[piece]}\n` +
    `• Wood finish: ${woods[wood].name}\n` +
    `• Upholstery: ${fabrics[fabric].name}`;

  return (
    <div className="config rv" id="configurator">
      <div className="config-canvas-wrap">
        {is3D ? (
          <Suspense fallback={<img src="/img/office-lounge.webp" alt="Loading 3D preview…" />}>
            <Sofa3D variant={FABRICS_3D[fabric]?.variant ?? 'Champagne'} legColor={WOODS_3D[wood]?.leg ?? '#9a7648'} />
          </Suspense>
        ) : ready ? (
          <canvas ref={canvasRef} aria-label="Live preview of your fabric and wood choices on a Heaven chair set" />
        ) : (
          <img src={BASE} alt="Heaven accent chair set" />
        )}
        <span className="config-tag">
          {is3D ? 'Live 3D — drag to turn' : 'Live preview · real Heaven piece'}
        </span>
      </div>

      <div className="config-panel">
        <h3>Shape your piece in 30 seconds.</h3>
        <p>Pick a direction — our designers take it from there, around your exact space.</p>

        <div className="config-group">
          <div className="config-label"><span>The Piece</span><b>{PIECES[piece]}</b></div>
          <div className="pieces">
            {PIECES.map((p, i) => (
              <button key={p} className={`piece-btn${piece === i ? ' active' : ''}`} onClick={() => setPiece(i)}>
                {p}
              </button>
            ))}
          </div>
        </div>

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
