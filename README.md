# Heaven Furniture Mart — Landing Page

Conversion-focused landing page for **Heaven Furniture Mart** (bespoke furniture &
interior styling, Agrabad, Chattogram) — built for the Racdox Hackathon.

## The idea: a landing page that is itself bespoke

Heaven's pitch is *"Designed. Crafted. Customized."* — so the site doesn't just say
it, it does it. The visitor picks their world in the hero:

| Mode | Feel |
| --- | --- |
| **Classic** | carved, gilded, ceremonial — deep charcoal-teal & muted gold |
| **Modern** | clean lines, light woods — warm ivory |
| **Noir** | dark lacquer, brass — near-black brown |

One skeleton, three skins: every colour, radius, easing curve and photo set is a
CSS design token that swaps under a "material wipe" transition. The palette is
sampled **from Heaven's actual logo file** (`#34514f` teal / `#dda741` gold).

## Finding a piece — three ways in

Furniture is a considered purchase, so no page here is a dead end.

1. **Shop the Room** — a finished room per world with gold hotspots on it. A dot
   is either a real catalogue piece (opens Quick View) or a real part of the
   workshop (jumps to that shelf, pre-filtered).
2. **The Collection** — 22 pieces in six categories with live search across
   names, categories and tags. Filtering is a GSAP **Flip** animation: cards fly
   to their new positions instead of blinking. A search looks through the whole
   workshop, never just the open tab.
3. **Design Finder** — three questions (room → feeling → size). The answer to
   question two re-skins the entire site, and the result is three real pieces
   plus a written brief.

Every route ends in **Quick View**: bigger photo, the wood and upholstery we
offer on that piece, your room size, and a WhatsApp message already written.
Prev/next and arrow keys move through the pieces without closing.

## The catalogue is owner-editable

The whole shop is one plain-data file, [src/data/catalog.js](src/data/catalog.js),
commented for a non-developer. Drop a photo into `public/img/`, copy a block,
change the fields — no build knowledge, no engineer, no 3D pipeline.

## Stack

Vite · React · GSAP (ScrollTrigger + Flip) · Lenis · self-hosted fonts
(Cormorant Garamond / Jost) — works offline, no CDN calls. A two-minute real
showroom walkthrough (click-to-play, zero preload) and a film strip of live
inventory shots anchor the trust story.

## Commands

```bash
npm install
npm run dev            # local dev server
npm run build          # production build -> dist/
npm run assets:logo    # re-extract logo + palette from assets/logo.jpg
npm run assets:images  # re-run crop/grade/webp pipeline from assets/
node scripts/shoot.mjs        # screenshot all modes (needs `npx playwright install chromium`)
node scripts/shoot-flow.mjs classic desktop   # drive filter → search → quick view → finder
```

## Editing contact info

Everything (phone, WhatsApp, email, address, socials) lives in one place:
[src/site.config.js](src/site.config.js).
