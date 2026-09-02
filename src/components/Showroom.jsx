import { useRef, useState } from 'react';
import { SITE } from '../site.config.js';

// Real walkthrough footage. preload="none": the 2-minute file costs the
// visitor nothing until they press play.
export default function Showroom() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play());
  };

  return (
    <section className="showroom sec-dark">
      <div className="container">
        <div className="showroom-head rv">
          <p className="eyebrow">Step Inside</p>
          <h2 className="display" style={{ margin: '18px 0 14px' }}>
            Walk the showroom <em className="serif-i" style={{ color: 'var(--accent)' }}>before you visit.</em>
          </h2>
          <p className="lede">
            Two minutes inside our Agrabad floor — every piece in this film is ours,
            and every one of them can be rebuilt around you.
          </p>
        </div>

        <div className="showroom-stage rv" data-rv-delay="0.08">
          <div className="framed">
            <div className="crop">
              {playing ? (
                <video
                  ref={videoRef}
                  src="/video/showroom.mp4"
                  poster="/video/poster.jpg"
                  controls
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <button className="showroom-poster" onClick={play} aria-label="Play the showroom tour video">
                  <img src="/video/poster.jpg" alt="Inside the Heaven Furniture Mart showroom" loading="lazy" />
                  <span className="play-ring">
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="play-note">Watch the tour · 2 min</span>
                </button>
              )}
            </div>
          </div>
          <p className="showroom-cap">{SITE.address}</p>
        </div>
      </div>
    </section>
  );
}
