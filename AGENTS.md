# Realm's Keep — Agent Context

## What This Is

Landing page for Realm's Keep Gaming Gear, a tabletop RPG Etsy shop. Static HTML/CSS/JS deployed to Netlify. No build step, no npm, no framework.

## Architecture

Single-page site at `realmskeep-main/realmskeep/`. All files served as-is.

| File | Purpose |
|------|---------|
| `index.html` | Full page structure — header, hero, product sections, testimonials, footer. Inline SVG logo. |
| `style.css` | All styles. CSS custom properties in `:root`. Responsive breakpoints at 768px, 480px, 420px. |
| `brand-ident.js` | GSAP logo animation (IIFE, no imports). 3-phase: assembly → ambient + Eternal Duel → click replay. Loads GSAP 3.12.7 from CDN. |
| `main.js` | Analytics event wiring — CTA clicks, scroll depth, time on page, email modal. |
| `analytics.js` | Event tracking utility. Console-only for now, has TODO block for GA4/Segment/PostHog. |
| `assets/` | Product images, banner, logo PNG fallback. |

## Key Conventions

- **No build tools.** Everything is vanilla HTML/CSS/JS. External libraries load from CDN `<script>` tags.
- **CSS custom properties** in `:root` for theming (`--black`, `--white`, `--gray`, `--transition-speed`, `--beam-opacity`, `--bird-stroke`).
- **Analytics events** go through `window.RealmskeepAnalytics.trackEvent()`. See `docs/analytics-baseline.md` for the event schema.
- **SVG logo** is inline in `index.html` (not an external file). The `#LOGO` element starts with `opacity: 0` — `brand-ident.js` reveals it after animation setup.
- **Testimonials** are hardcoded in `index.html`. The marquee uses CSS `translateX(-50%)` with duplicated cards for seamless looping.

## Important: brand-ident.js

This is a consolidated IIFE containing the full GSAP animation. It includes:
- Bird particle spawner (scatter from castle tower on impact)
- Ambient float loop with light beam
- Eternal Duel (castle window glow — purple/ember idle, electric blue/red battle on hover)
- Assembly animation (elastic letter snapping, mechanical slides, impact shake)
- Vaporize + replay (blur/drift exit, full reset, replay)

Do NOT refactor this into ES modules — the site has no bundler. It must stay as a single IIFE that expects `gsap` as a global from the CDN script.

## Contributors

- **malfloyd9** (Floyd) — site owner, Etsy shop, content, analytics
- **travisbreaks** (Travis) — brand ident animation, SVG logo, carousel improvements
