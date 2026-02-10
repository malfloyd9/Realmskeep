# Analytics Baseline (Phase 1)

This baseline introduces provider-agnostic client-side tracking for the Realm's Keep homepage.

## Event schema

| Event name | Required properties |
| --- | --- |
| `homepage_cta_clicked` | `page`, `cta_id`, `timestamp` |
| `email_modal_shown` | `page`, `modal_id`, `timestamp` |
| `email_modal_dismissed` | `page`, `modal_id`, `timestamp` |
| `email_modal_submitted` | `page`, `modal_id`, `timestamp` |
| `scroll_depth_reached` | `page`, `percent` (25/50/75/100), `timestamp` |
| `time_on_page_reached` | `page`, `seconds` (30/60/120), `timestamp` |

## Where events fire

- `homepage_cta_clicked`
  - `realmskeep/main.js` in `setupCtaTracking()` when any element with `data-analytics-cta-id` is clicked.
  - CTA IDs are currently assigned in `realmskeep/index.html`.
- `email_modal_shown`, `email_modal_dismissed`, `email_modal_submitted`
  - `realmskeep/main.js` in `setupEmailModalTracking()`.
  - Auto-wires to modal elements when present:
    - modal root: `data-email-modal-id`
    - open trigger(s): `data-email-modal-open`
    - dismiss trigger(s): `data-email-modal-dismiss`
    - form: `data-email-modal-form`
  - Also supports integration hooks through custom browser events:
    - `window.dispatchEvent(new CustomEvent('realmskeep:email-modal', { detail: { action: 'shown'|'dismissed'|'submitted', modal_id: 'your_modal_id' } }))`
- `scroll_depth_reached`
  - `realmskeep/main.js` in `setupScrollDepthTracking()`.
  - Throttled scroll/resize handler, one-time firing per milestone per page view.
- `time_on_page_reached`
  - `realmskeep/main.js` in `setupTimeOnPageTracking()`.
  - One-time timer firing at 30/60/120s.

## Provider wiring notes

Tracking is centralized in `realmskeep/analytics.js` via `trackEvent(eventName, properties)`.

- Current behavior logs payloads to `console.info` for manual validation.
- Add GA4/Segment/PostHog/etc. in the TODO block in `trackEvent`.
- Disable console debug logs by setting `window.__REALMSKEEP_ANALYTICS_DEBUG__ = false`.

## Manual validation checklist

1. Open `realmskeep/index.html` in a browser.
2. Open DevTools Console.
3. Click each CTA button and verify `homepage_cta_clicked` logs with correct `cta_id`.
4. Scroll down page and verify `scroll_depth_reached` fires once each at 25/50/75/100.
5. Stay on page for 30s, 60s, and 120s to verify `time_on_page_reached` logs.
6. (When modal exists) trigger show/dismiss/submit and verify `email_modal_*` events.
7. (Without modal UI) run the following in console and verify events:

```js
window.dispatchEvent(new CustomEvent('realmskeep:email-modal', {
  detail: { action: 'shown', modal_id: 'email_capture_modal' }
}));
window.dispatchEvent(new CustomEvent('realmskeep:email-modal', {
  detail: { action: 'dismissed', modal_id: 'email_capture_modal' }
}));
window.dispatchEvent(new CustomEvent('realmskeep:email-modal', {
  detail: { action: 'submitted', modal_id: 'email_capture_modal' }
}));
```
