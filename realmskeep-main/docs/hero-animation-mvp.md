# Hero + Logo Animation MVP (Phase 2: Weeks 4–6)

## What was built

An Arcane Sparks animation MVP was added to the header logo area as a lightweight concept test for the hero/top branding region.

- The logo now has an arrow-volley layer with 8 hand-drawn-style arrows that fire one-by-one from a single tower-window origin, follow short arcing flight paths, and stick near the logo edge.
- Arrows are monochrome (black/white) and sketch-like to match the site palette and the hand-drawn reference style.
- Animation play behavior:
  - Plays once on initial page load.
  - Replays on pointer hover.
  - Replays on keyboard focus.
- Replays are throttled to avoid noisy/frequent firing.
- Analytics event added using the existing Phase 1 utility:
  - `hero_logo_animation_played`
  - payload: `{ page, trigger: 'load' | 'hover' | 'focus', timestamp }`
- Added Pinterest no-pin directives (`<meta name="pinterest" content="nopin">` and `data-pin-nopin="true"` on images) to reduce Pinterest save-overlay behavior on hover.

## Tuning options

The values below can be adjusted in `realmskeep/main.js` and `realmskeep/style.css` for future concept iterations:

- `replayThrottleMs` (currently `1800` ms)
  - Controls minimum time between hover/focus replays.
- `animationDurationMs` (currently `1700` ms)
  - Controls how long the active class stays on.
- Arrow count and landing pattern
  - Modify `.spark` elements in `index.html` and `--origin-*`, `--land-*`, and angle vars per `:nth-child(...)` in `style.css`.
- Arrow styling
  - Tweak shaft/head/fletching grayscale values and line thickness for hand-drawn look.
- Motion feel
  - Adjust `@keyframes arcaneArrowFlight` timing and the `--arc-*` / `--land-*` coordinates to control path shape and landing distance.

## Reduced-motion behavior

When `prefers-reduced-motion: reduce` is enabled:

- Hero entry animations are disabled.
- Logo transition/arrow animation is disabled.
- JS animation setup exits early and does not autoplay/replay, so no extra animation event is emitted.

This ensures reduced-motion users do not get decorative motion effects.

## Manual QA checklist

1. Load `realmskeep/index.html` in a browser with DevTools console open.
2. Confirm on first load that arrows fire one-by-one from the tower window area.
3. Confirm arrows are black/white, arc from one window origin (not radial circle), and do not touch the hero banner image area.
4. Confirm console logs include one `hero_logo_animation_played` event with `trigger: 'load'`.
5. Hover over the logo and confirm replay occurs.
6. Confirm console logs include `hero_logo_animation_played` with `trigger: 'hover'`.
7. Press `Tab` until the logo link is focused; confirm replay occurs.
8. Confirm console logs include `hero_logo_animation_played` with `trigger: 'focus'`.
9. Rapidly hover repeatedly and confirm replays are throttled (do not fire every micro-hover).
10. Enable `prefers-reduced-motion: reduce` in browser/devtools rendering settings.
11. Reload page and confirm arrow animation does not run and no `hero_logo_animation_played` event fires.
12. Hover images and verify Pinterest save overlays are reduced/disabled where browser/plugin honors no-pin directives.
