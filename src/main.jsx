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

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// dismiss the entrance curtain once the app is on its feet
const boot = document.getElementById('boot');
if (boot && !document.documentElement.classList.contains('no-boot')) {
  const dismiss = () => {
    boot.classList.add('boot-done');
    try { sessionStorage.setItem('hfm-booted', '1'); } catch { /* private mode */ }
    setTimeout(() => boot.remove(), 900);
  };
  window.addEventListener('load', () => setTimeout(dismiss, 650), { once: true });
  setTimeout(dismiss, 2400); // never hold the page hostage
} else {
  boot?.remove();
}
