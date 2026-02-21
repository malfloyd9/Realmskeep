# Realm's Keep Style Guide

## Typography

### Font Families

| Font | Type | Usage | Weights Loaded |
|------|------|-------|----------------|
| Cinzel | Serif | Headings, nav links, brand text | 400, 700 |
| Lato | Sans-serif | Body text, paragraphs, FAQ answers | 300, 400, 700 |
| Press Start 2P | Monospace/Pixel | Shop page only (retro 8-bit aesthetic) | 400 |
| Pinyon Script | Cursive | FAQ page header animation only | 400 |

### CSS Variables

```css
--primary-font: 'Cinzel', serif;    /* headings, nav, brand */
--secondary-font: 'Lato', sans-serif; /* body text */
```

### Heading Hierarchy

- **h1**: Cinzel, uppercase, `letter-spacing: 2px`
- **h2 (.section-title)**: Cinzel, uppercase, `letter-spacing: 2px`, `2.5rem`, centered with `::after` gold underline bar (80px wide)
- **h3**: Cinzel, uppercase, `letter-spacing: 1-2px`
- **Body**: Lato, `1rem` base, `line-height: 1.6`

### Font Loading

All pages load Cinzel + Lato via Google Fonts in `Layout.astro`. Specialty fonts are loaded per-page:
- Shop: loads Press Start 2P via `<Fragment slot="head">`
- FAQ: loads Pinyon Script via `<Fragment slot="head">`

---

## Color Palette

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Black | `#0a0a0a` | `--black` | Dark backgrounds, borders, home section text |
| White | `#ffffff` | `--white` | Default body text, light backgrounds (home sections) |
| Gray | `#f4f4f4` | `--gray` | Alternating home section backgrounds |
| Gold (primary) | `#d4af37` | — | Nav hover borders/shadows, active page borders, interactive structural accent |
| Gold (highlight) | `#f4c542` | — | Section underlines, link text, hover text, testimonial accents, decorative |
| Nav Bar Gradient | `#2e2e2e → #1a1a1a` | — | Navigation bar background (subtle gradient) |
| Nav Button BG | `#000000` | — | Navigation button default background |
| Nav Button Border | `#4a4a4a` | — | Navigation button default border, FAQ item border |
| Nav Button Text | `#E5E5E5` | — | Navigation button default text |
| Deep Blue | `#1a1a2e` | — | Shop page background |
| FAQ Cream | `#f5efe3` | — | FAQ parchment card background |
| FAQ Ink | `#2a1a0a` | — | FAQ dark ink text color |

### Gold Accent System

Two golds serve distinct roles:
- **`#d4af37`** (primary) — structural/interactive: nav borders, box-shadows, active page indicators
- **`#f4c542`** (highlight) — visual/decorative: section `::after` underlines, link text, hover text color, testimonial accents

RGBA variants follow the same split: `rgba(212, 175, 55, ...)` for structural glow, `rgba(244, 197, 66, ...)` for highlight glow.

### Background & Text Strategy

- **`html` + `body`**: background `#0a0a0a`, text `var(--white)` — dark-first default
- **Home `.collection-section`**: overrides to `color: var(--black)` (light bg sections need dark text)
- **All visible sections** have their own explicit backgrounds — nothing relies on body background
- **`::view-transition`**: `#0a0a0a` (dark VT backdrop matches body, preventing flash during transitions)

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Container max-width | `1200px` | `.container` |
| Container padding | `0 2rem` | `.container` |
| Section padding | `5rem 0` (desktop), `2rem 0` (mobile) | Page sections |
| Card padding | `1.5rem` - `2rem` | Lore cards, testimonials |
| Nav gap | `0.75rem` | Between nav buttons |
| Heading margin-bottom | `1rem` | Standard headings |

---

## Navigation

### Layout

```css
.main-nav {
    background: #2a2a2a;
    border-bottom: 2px solid var(--black);
    padding: 1rem 0;
    position: sticky;     /* pinned at top of viewport */
    top: 0;
    z-index: 100;
    view-transition-name: main-nav;  /* frozen during page transitions */
}

.main-nav .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    max-width: 800px;
}
```

### Nav Button Styles (Dark-to-Gold Reveal)

Default state: dark, understated buttons.

```css
.main-nav .nav-link {
    font: 500 1rem 'Cinzel', serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #E5E5E5;
    background: #000000;
    border: 1px solid #4a4a4a;
    border-radius: 4px;
    padding: 0.7rem 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all var(--transition-speed) ease;
}
```

Hover state: gold glow bloom reveal.

```css
.main-nav .nav-link:hover {
    color: #d4af37;
    text-shadow: 0 0 8px rgba(212, 175, 55, 0.6), 0 0 15px rgba(212, 175, 55, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(212, 175, 55, 0.6), 0 0 15px rgba(212, 175, 55, 0.4);
    border-color: #d4af37;
    background: rgba(255, 255, 255, 0.05);
}
```

Active (current page): gold accent state.

```css
.main-nav .nav-link[aria-current="page"] {
    color: #d4af37;
    text-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
    background: rgba(255, 255, 255, 0.05);
    border-color: #d4af37;
    box-shadow: 0 3px 12px rgba(212, 175, 55, 0.5);
}
```

The `::before` pseudo-element provides an additional gold overlay on hover (`background: rgba(212, 175, 55, 0.1)`, transitioning from `opacity: 0` to `1`).

### Active Page Highlighting

`public/nav-transitions.js` runs on every page load and sets `aria-current="page"` on the matching nav link. Matches exact path or subpath (e.g., `/lore` matches `/lore/first-post`).

### Nav Wrapping (Responsive)

The nav uses `display: flex; flex-wrap: wrap; justify-content: center` with 5 items. Natural wrapping:
- **> 600px**: All 5 in one row
- **~450px**: 3 top + 2 bottom (centered)
- **~320px**: 2 + 2 + 1 (centered)

---

## Component Patterns

### Buttons (.btn)

```css
background: var(--black);
color: var(--white);
padding: 1rem 2rem;
text-transform: uppercase;
font-weight: bold;
border: 2px solid var(--black);
```

- **Hover**: transparent background, black text, elevated shadow, `translateY(-2px)`

### Cards (Lore, Testimonials)

```css
background: rgba(255, 255, 255, 0.06);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 10px;
backdrop-filter: blur(2px);
```

- **Hover**: `translateY(-6px) scale(1.03)`, elevated box-shadow, border highlight

### Tags / Chips

```css
font-size: 0.68rem;
text-transform: uppercase;
letter-spacing: 1.1px;
border: 1px solid rgba(255, 255, 255, 0.28);
border-radius: 999px;   /* pill shape */
padding: 0.2rem 0.55rem;
```

### FAQ Parchment Card

```css
background: #f5efe3;            /* cream parchment */
border-radius: 16px;
max-width: 850px;
color: #2a1a0a;                 /* dark ink */
```

With SVG noise texture overlay and GSAP scribe animation ("Fletching & Quiver" strikethrough then "Frequently Asked Questions").

### Gallery Placeholder

Top-aligned (`padding: 4rem 0`) to match Lore page layout. Uses the standard card pattern with a "Treasures Under Construction" message.

---

## View Transitions

The site uses the **native CSS View Transitions API** (cross-document MPA transitions, not Astro's ClientRouter). Declared in `Layout.astro`:

```css
@view-transition { navigation: auto; }
```

### Named Transition Groups

| Group | Element | Animation |
|-------|---------|-----------|
| `main-nav` | `.main-nav` | `animation: none` — instant swap, appears frozen |
| `page-content` | `main` | Sequential fade: old out (50ms), new in (50ms, 30ms delay) |
| `root` | Everything else (header, footer, body) | `animation: none` — instant, no flash |

### Why `::view-transition { background-color: #0a0a0a }`

The `::view-transition` pseudo-element is the backdrop behind all transition snapshot layers. Set to `#0a0a0a` to match the dark body background. Combined with the dark body, this ensures zero white flash at any point during navigation.

### Page-Specific Transitions

| Page | Entry | Exit |
|------|-------|------|
| **Home** | GSAP expands header from 0 height + logo assembly animation | `setupNavExit()` collapses header + fades logo, then navigates |
| **Shop** | GSAP expands `.shop-coming-soon` from 0 height, then plays typewriter | Nav click collapses shop section to 0 height, then navigates |
| **Lore / Gallery / FAQ** | Standard content dissolve | Standard content dissolve |

### Animation Timing for Page Transitions

```
Home -> Other:
  1. setupNavExit: logo fades (0.35s) + header collapses (0.5s, overlaps)
  2. Main fades to opacity 0 (0.15s) + body set dark + footer hidden
  3. window.location.href navigates
  4. View transition fades content (50ms out, 50ms in)

Other -> Home:
  1. View transition fades content (50ms out, 50ms in)
  2. brand-ident.js: header expands from 0 height
  3. Logo assembly plays

Shop -> Other:
  1. Shop collapse: height/padding to 0 + opacity to 0 (0.4s)
  2. window.location.href navigates
  3. View transition fades content (50ms out, 50ms in)

Other -> Shop:
  1. View transition fades content (50ms out, 50ms in)
  2. Shop expand: measures scrollHeight, tweens from 0 (0.7s)
  3. Speech bubble rise-up + typewriter plays

Lore/Gallery/FAQ <-> each other:
  1. View transition fades content (50ms out, 50ms in)
  2. No additional GSAP animations
```

---

## Transitions & Animation

- **Default speed**: `0.3s` (`var(--transition-speed)`)
- **Default easing**: `ease`
- **GSAP easing**: `power2` for page animations
- **Hover transforms**: `translateY(-2px)` for nav/buttons, `translateY(-6px) scale(1.03)` for cards
- **Reduced motion**: All GSAP animations respect `prefers-reduced-motion: reduce`

### Key Animations

| Animation | Usage | Tech | File |
|-----------|-------|------|------|
| Logo assembly | Header logo on home load | GSAP timeline | `public/brand-ident.js` |
| Header expand/collapse | Home page entry/exit | GSAP height tween | `public/brand-ident.js` |
| Nav exit (home) | Collapsing header when leaving home | GSAP timeline (`setupNavExit`) | `public/brand-ident.js` |
| Shop expand/collapse | Shop page entry/exit | GSAP height tween | `src/pages/shop.astro` |
| Shop typewriter | Character-by-character text reveal | GSAP timeline callbacks | `src/pages/shop.astro` |
| Shop sparkles | 22 scattered floating sparkles | CSS `@keyframes` (float, twinkle) | `src/pages/shop.astro` |
| FAQ scribe | "Fletching & Quiver" strikethrough then "FAQ" (loops infinitely) | GSAP timeline (`repeat: -1`) | `src/pages/faq.astro` |
| FAQ accordion | Expand/collapse answers | GSAP height tween | `src/pages/faq.astro` |
| Testimonial marquee | Infinite scroll carousel | CSS `@keyframes marquee`, 120s | `src/pages/index.astro` |
| Active nav highlight | Sets `aria-current="page"` | Vanilla JS | `public/nav-transitions.js` |

---

## Responsive Breakpoints

| Breakpoint | Target | Key Changes |
|-----------|--------|-------------|
| `768px` | Tablet | Heading sizes reduce, card padding shrinks, spacing adjusts |
| `600px` | Small tablet | Nav buttons shrink (font/padding), nav gap reduces |
| `480px` | Mobile | Single-column layouts, smaller fonts, horizontal nav wrap kept |
| `400px` | Small mobile | Nav wraps to 3+2, further font/padding shrinking |

---

## File Structure

```
src/
  layouts/
    Layout.astro        # Master layout: nav, VT rules, global styles, script loading
  pages/
    index.astro          # Home (hero, collections, testimonials)
    lore/
      index.astro        # Lore grid listing
      [slug].astro       # Individual lore posts
    gallery.astro        # Gallery placeholder
    shop.astro           # Shop (speech bubble, typewriter, sparkles)
    faq.astro            # FAQ (parchment card, scribe, accordion)
  style.css              # Global styles (CSS vars, base elements, .btn, .nav-link base)
  content/lore/          # Markdown lore posts
public/
  brand-ident.js         # Logo assembly, header expand/collapse, setupNavExit, ambient animations
  nav-transitions.js     # Active page highlighting (aria-current)
  main.js                # Analytics tracking (CTA clicks, scroll depth, time-on-page)
  testimonials.js        # Testimonial carousel logic
  analytics.js           # Analytics init
  assets/                # Product images
docs/
  style-guide.md         # This file
astro.config.mjs         # Dev server port 4322
```

---

## Image Handling

- **Pinterest**: All images use `data-pin-nopin="true"` and `<meta name="pinterest" content="nopin">`
- **Pixel art**: Uses `image-rendering: pixelated; -moz-crisp-edges; crisp-edges` (shop page)
- **Product images**: Standard quality, served from `/assets/`

---

## SEO Patterns

- Every page sets `<title>` and `<meta name="description">`
- Lore posts include JSON-LD `BlogPosting` schema
- FAQ uses `FAQPage` schema markup with `itemscope`/`itemprop` attributes
- Optional `canonicalURL` prop on Layout
- Gallery has canonical URL set

---

## Dev Server

- **Port**: 4322 (locked in `astro.config.mjs`)
- **Start**: `npm run dev`
- **Registered in ops dashboard** at `CODE/ops/src/lib/constants.ts`

---

## Anti-Patterns (Don't Do)

- **Don't use `font-weight: 700` on nav links** — design uses 500 for a lighter feel
- **Don't make nav buttons gold by default** — they start dark (#000 bg, #E5E5E5 text, #4a4a4a border) and reveal gold only on hover/active
- **Don't use `flex-direction: column` on nav at 480px** — keep horizontal wrap for compact 3+2 layout
- **Don't add `translateY` transforms to view transitions** — causes compound visual artifacts; use opacity-only fades
- **Don't make body background light** — body is `var(--black)` (#0a0a0a); all visible sections have their own explicit backgrounds. A light body causes white flash during view transitions.
