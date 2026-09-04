import React from 'react';
import { createRoot } from 'react-dom/client';

// self-hosted fonts (offline-safe)
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';

import App from './App.jsx';
import gsap from 'gsap';

if (import.meta.env.DEV) window.__gsap = gsap;   // lets scripts/ slow motion for capture

// The curtain covers the mount, not the network. App calls __hfmMounted from
// its first effect; one frame later the page is really on screen.
let painted;
const mounted = new Promise((resolve) => { painted = resolve; });
window.__hfmMounted = () => requestAnimationFrame(painted);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// dismiss the entrance curtain once the app is on its feet
const boot = document.getElementById('boot');
if (boot && !document.documentElement.classList.contains('no-boot')) {
  let gone = false;
  const dismiss = () => {
    if (gone) return;
    gone = true;
    boot.classList.add('boot-done');
    try { sessionStorage.setItem('hfm-booted', '1'); } catch { /* private mode */ }
    setTimeout(() => boot.remove(), 900);
  };
  // hold just long enough for the monogram to finish drawing, then go
  const held = new Promise((resolve) => setTimeout(resolve, 900));
  Promise.all([mounted, held]).then(dismiss);
  setTimeout(dismiss, 2000); // never hold the page hostage
} else {
  boot?.remove();
}
