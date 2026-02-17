# Realm's Keep Gaming Gear

Landing page for the [Realm's Keep Etsy shop](https://www.etsy.com/shop/RealmsKeep) — tabletop gaming apparel, mugs, and accessories.

## Stack

Pure static site. No build step, no npm, no framework.

- **HTML/CSS/JS** served directly by Netlify
- **GSAP 3.12.7** (CDN) for the logo brand ident animation
- **Netlify** for hosting + deploy previews on PRs

## File Structure

```
realmskeep-main/
  realmskeep/
    index.html        # Single-page site (header, hero, products, testimonials, footer)
    style.css         # All styles (CSS custom properties in :root)
    brand-ident.js    # GSAP logo animation (assembly + ambient + Eternal Duel + replay)
    main.js           # Analytics event wiring (CTAs, scroll depth, time on page)
    analytics.js      # Event tracking utility (console-only, ready for GA4/Segment)
    assets/           # Images (banner, product photos, logo PNG fallback)
  docs/               # Planning docs from each development phase
  README.md
```

## Local Development

Open `realmskeep/index.html` directly in a browser, or serve it:

```bash
cd realmskeep-main/realmskeep
python3 -m http.server 8888
# → http://localhost:8888
```

## Logo Animation

The header logo is an inline SVG with a 3-phase GSAP animation:

1. **Assembly** — Castle fades in, letters snap with elastic easing, "GAMING GEAR" slides up, EST/2022 slam in, birds scatter on impact
2. **Ambient** — Gentle float loop + Eternal Duel window glow (purple/ember breathing idle, electric blue/red battle sparks on hover)
3. **Replay** — Click the logo to vaporize + replay from Phase 1

The animation is self-contained in `brand-ident.js` (no build step needed).

## Analytics

All tracking is in `analytics.js` + `main.js`. Events log to console by default. See `docs/analytics-baseline.md` for the full event schema and wiring guide.

## Deploy

Push to `main` triggers a Netlify deploy. PRs get deploy previews automatically.
