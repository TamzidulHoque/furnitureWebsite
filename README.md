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
2. **The Collection** — a floor plan of a house, drawn in gold, is the
   navigation: hover a room and its pieces light up on the wall below, click it
   and everything else flies away. No filter tabs, no card grid — the pieces
   are *hung*, salon-style: brass nail, wire, uneven sizes, uneven drops, a
   shadow on the plaster, and a slow parallax drift as the wall passes. Nine
   widths, heights and drops cycle by position, so adding a piece never needs a
   layout decision. **Each world hangs its own furniture** — Classic 14 carved
   and gilded pieces, Modern 10 plain ones, Noir 9 in lacquer and brass — and a
   room a world does not build yet says so, and offers the world that does.
   Live search covers names, rooms and tags, and redraws the plan as a map of
   the results.
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
node scripts/probe-frames.mjs 1  # frame cost while scrolling each section
node scripts/shoot.mjs        # screenshot all modes (needs `npx playwright install chromium`)
node scripts/shoot-flow.mjs classic desktop   # drive filter → search → quick view → finder
```

## Editing contact info

Everything (phone, WhatsApp, email, address, socials) lives in one place:
[src/site.config.js](src/site.config.js).
