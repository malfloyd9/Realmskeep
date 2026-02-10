# Hero Animation MVP: Arcane Sparks

## What was implemented
- Added a dedicated `ArcaneSparks` animation module for the top logo area.
- Animation plays once on initial page load.
- Replay is supported on mouse hover and keyboard focus of the logo link.
- Replay is throttled to prevent rapid re-triggering.
- Added analytics hook via `trackEvent` utility for `hero_logo_animation_played`.
- Integrated layering so sparks render behind the logo and do not affect layout.

## Configuration knobs
In `realmskeep/scripts/arcane-sparks.js`:
- `particleCount`: number of sparks in each burst.
- `durationMs`: total lifecycle of one burst.
- `throttleMs`: minimum delay before another replay can trigger.
- `spreadX` / `spreadY`: spawn area around the logo center.
- `colors`: spark palette.

Per-particle randomized values:
- drift distance (`--spark-drift-x`, `--spark-drift-y`)
- start offset (`--spark-x`, `--spark-y`)
- delay (`--spark-delay`)
- lifespan (`--spark-life`)

## Accessibility behavior
- Honors `prefers-reduced-motion: reduce` by skipping animation playback.
- Keyboard users can trigger replay via logo link focus.
- Focus-visible outline added to logo link for clear keyboard affordance.

## Performance notes
- No external dependencies or heavy libraries; uses lightweight DOM + CSS keyframes.
- Animation layer is absolutely positioned and `pointer-events: none`.
- No layout shift: particles are rendered in a zero-size overlay anchored to logo center.
- Script is loaded as a small ES module in the document head (modules are deferred by default) to keep integration merge-friendly while avoiding render-blocking behavior.

## Manual QA checklist
- [ ] First page load triggers one sparkle burst.
- [ ] Hovering logo triggers burst, with throttle preventing spam.
- [ ] Tabbing to logo triggers burst.
- [ ] With reduced-motion enabled, bursts are skipped.
- [ ] No horizontal overflow introduced on mobile/tablet widths.
- [ ] No console errors.
