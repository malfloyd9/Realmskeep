/**
 * Lightweight analytics shim for Realm's Keep.
 * Replace internals with your analytics provider when ready.
 */
export function trackEvent(eventName, payload = {}) {
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...payload });
    return;
  }

  if (typeof window.analytics?.track === 'function') {
    window.analytics.track(eventName, payload);
    return;
  }

  // Intentional no-op fallback for MVP.
}
