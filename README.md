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

The bespoke configurator has two engines: a **real Heaven piece** recoloured
live (photo-segmented wood/upholstery masks, hue-preserving canvas blends) and
**four real-time 3D models** (Draco-compressed glTF, material variants +
re-upholstery, lazy-loaded so three.js never touches the initial bundle).
Every world gets live previews. The visitor's choices — style world, piece, wood,
fabric — land in a prefilled WhatsApp message: the toy *is* the CTA.

A two-minute real showroom walkthrough video (click-to-play, zero preload)
and a film strip of live inventory shots anchor the trust story.

## Stack

Vite · React · GSAP + ScrollTrigger · Lenis · Canvas 2D (configurator) ·
self-hosted fonts (Cormorant Garamond / Jost) — works offline, no CDN calls.

## Commands

```bash
npm install
npm run dev            # local dev server
npm run build          # production build -> dist/
npm run assets:logo    # re-extract logo + palette from assets/logo.jpg
npm run assets:images  # re-run crop/grade/webp pipeline from assets/
node scripts/make-masks.mjs   # regenerate configurator masks
node scripts/shoot.mjs        # screenshot all modes (needs `npx playwright install chromium`)
```

## Editing contact info

Everything (phone, WhatsApp, email, address, socials) lives in one place:
[src/site.config.js](src/site.config.js).
