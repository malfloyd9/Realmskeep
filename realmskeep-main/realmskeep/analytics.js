(function () {
  const EVENT_NAMES = {
    HOMEPAGE_CTA_CLICKED: 'homepage_cta_clicked',
    EMAIL_MODAL_SHOWN: 'email_modal_shown',
    EMAIL_MODAL_DISMISSED: 'email_modal_dismissed',
    EMAIL_MODAL_SUBMITTED: 'email_modal_submitted',
    SCROLL_DEPTH_REACHED: 'scroll_depth_reached',
    TIME_ON_PAGE_REACHED: 'time_on_page_reached',
  };

  function getIsoTimestamp() {
    return new Date().toISOString();
  }

  function trackEvent(eventName, properties) {
    const payload = {
      event: eventName,
      ...properties,
      timestamp: properties && properties.timestamp ? properties.timestamp : getIsoTimestamp(),
    };

    // TODO: Wire analytics provider(s) here (GA4, Segment, PostHog, etc.).
    // Example:
    // if (window.gtag) { window.gtag('event', eventName, payload); }
    // if (window.analytics?.track) { window.analytics.track(eventName, payload); }

    if (window.__REALMSKEEP_ANALYTICS_DEBUG__ !== false) {
      console.info('[analytics]', payload);
    }

    return payload;
  }

  window.RealmskeepAnalytics = {
    EVENT_NAMES,
    trackEvent,
    getIsoTimestamp,
  };
})();
