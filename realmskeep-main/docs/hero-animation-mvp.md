# Hero + Logo Animation MVP (Phase 2: Weeks 4–6)

## What was built

An Arcane Sparks animation MVP was added to the header logo area as a lightweight concept test for the hero/top branding region.

- The logo now has a spark layer with 8 small particles.
- Animation play behavior:
  - Plays once on initial page load.
  - Replays on pointer hover.
  - Replays on keyboard focus.
- Replays are throttled to avoid noisy/frequent firing.
- Analytics event added using the existing Phase 1 utility:
  - `hero_logo_animation_played`
  - payload: `{ page, trigger: 'load' | 'hover' | 'focus', timestamp }`

## Tuning options

The values below can be adjusted in `realmskeep/main.js` and `realmskeep/style.css` for future concept iterations:

- `replayThrottleMs` (currently `1800` ms)
  - Controls minimum time between hover/focus replays.
- `animationDurationMs` (currently `900` ms)
  - Controls how long the active class stays on.
- Spark count and positioning
  - Modify `.spark` elements in `index.html` and the `:nth-child(...)` placement rules in `style.css`.
- Visual feel
  - Adjust `@keyframes arcaneSparkBurst` distance, scale, and opacity ramps.

## Reduced-motion behavior

When `prefers-reduced-motion: reduce` is enabled:

- Hero entry animations are disabled.
- Logo transition/spark animation are disabled.
- JS animation setup exits early and does not autoplay/replay, so no extra animation event is emitted.

This ensures reduced-motion users do not get decorative motion effects.

## Manual QA checklist

1. Load `realmskeep/index.html` in a browser with DevTools console open.
2. Confirm on first load that spark animation plays once around the logo.
3. Confirm console logs include one `hero_logo_animation_played` event with `trigger: 'load'`.
4. Hover over the logo and confirm replay occurs.
5. Confirm console logs include `hero_logo_animation_played` with `trigger: 'hover'`.
6. Press `Tab` until the logo link is focused; confirm replay occurs.
7. Confirm console logs include `hero_logo_animation_played` with `trigger: 'focus'`.
8. Rapidly hover repeatedly and confirm replays are throttled (do not fire every micro-hover).
9. Enable `prefers-reduced-motion: reduce` in browser/devtools rendering settings.
10. Reload page and confirm spark animation does not run and no `hero_logo_animation_played` event fires.
