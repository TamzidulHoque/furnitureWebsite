import { useMode } from '../mode/ModeContext.jsx';

export default function ModeSwitch() {
  const { mode, setMode, MODES } = useMode();
  return (
    <div className="mode-switch" role="radiogroup" aria-label="Choose your style world">
      <p className="ms-label">Which Heaven is yours?</p>
      <div className="ms-options">
        {Object.values(MODES).map((m) => (
          <button
            key={m.key}
            className={`ms-btn${mode === m.key ? ' active' : ''}`}
            role="radio"
            aria-checked={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            <span className="ms-swatch" style={{ background: m.swatch }} />
            <span>
              <span className="ms-name">{m.name}</span>
              <span className="ms-desc">{m.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
