import { useMode } from '../mode/ModeContext.jsx';

// `compact` is the row that sits with the collection: the same three
// choices, without the question — by then it has already been asked.
// Three names, nothing else. The colour circle and the line of description
// under each name were saying in small type what the whole page says the
// moment the world changes.
export default function ModeSwitch({ compact = false }) {
  const { mode, setMode, MODES } = useMode();
  return (
    <div className={`mode-switch${compact ? ' ms-compact' : ''}`} role="radiogroup" aria-label="Choose your style world">
      {!compact && <p className="ms-label">Which Heaven is yours?</p>}
      <div className="ms-options">
        {Object.values(MODES).map((m) => (
          <button
            key={m.key}
            className={`ms-btn${mode === m.key ? ' active' : ''}`}
            role="radio"
            aria-checked={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            <span className="ms-name">{m.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
