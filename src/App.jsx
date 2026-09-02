import { ModeProvider, useMode } from './mode/ModeContext.jsx';
import { useLenis, useReveals } from './hooks/useMotion.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Intro from './components/Intro.jsx';
import Collections from './components/Collections.jsx';
import Bespoke from './components/Bespoke.jsx';
import Ledger from './components/Ledger.jsx';
import FeedRail from './components/FeedRail.jsx';
import Proof from './components/Proof.jsx';
import CTABand from './components/CTABand.jsx';
import Footer from './components/Footer.jsx';
import Lightplay from './components/Lightplay.jsx';
import Cursor from './components/Cursor.jsx';

function Page() {
  const { mode } = useMode();
  useLenis();
  useReveals(mode);
  return (
    <>
      <Header />
      <Lightplay />
      <Cursor />
      <main>
        <Hero />
        <Marquee />
        <Intro />
        <Collections />
        <Bespoke />
        <Ledger />
        <Proof />
        <FeedRail />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <Page />
    </ModeProvider>
  );
}
