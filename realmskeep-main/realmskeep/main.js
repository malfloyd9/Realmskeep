(function () {
  if (!window.RealmskeepAnalytics) {
    return;
  }

  const { EVENT_NAMES, trackEvent, getIsoTimestamp } = window.RealmskeepAnalytics;
  const page = window.location.pathname || '/';

  function throttle(fn, waitMs) {
    let last = 0;
    let timeoutId;

    return function throttled() {
      const now = Date.now();
      const remaining = waitMs - (now - last);

      if (remaining <= 0) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
        last = now;
        fn();
      } else if (!timeoutId) {
        timeoutId = window.setTimeout(function () {
          last = Date.now();
          timeoutId = undefined;
          fn();
        }, remaining);
      }
    };
  }

  function setupCtaTracking() {
    const ctaNodes = document.querySelectorAll('[data-analytics-cta-id]');
    const listeners = [];

    ctaNodes.forEach(function (node) {
      const ctaId = node.getAttribute('data-analytics-cta-id');
      const onClick = function () {
        trackEvent(EVENT_NAMES.HOMEPAGE_CTA_CLICKED, {
          page,
          cta_id: ctaId,
          timestamp: getIsoTimestamp(),
        });
      };

      node.addEventListener('click', onClick);
      listeners.push({ node, onClick });
    });

    return function cleanup() {
      listeners.forEach(function (entry) {
        entry.node.removeEventListener('click', entry.onClick);
      });
    };
  }

  function setupEmailModalTracking() {
    const modal = document.querySelector('[data-email-modal-id]');
    const cleanupFns = [];

    if (modal) {
      const modalId = modal.getAttribute('data-email-modal-id');
      const openers = document.querySelectorAll('[data-email-modal-open]');
      const dismissers = document.querySelectorAll('[data-email-modal-dismiss]');
      const form = modal.querySelector('[data-email-modal-form]');

      openers.forEach(function (node) {
        const onOpen = function () {
          trackEvent(EVENT_NAMES.EMAIL_MODAL_SHOWN, {
            page,
            modal_id: modalId,
            timestamp: getIsoTimestamp(),
          });
        };

        node.addEventListener('click', onOpen);
        cleanupFns.push(function () { node.removeEventListener('click', onOpen); });
      });

      dismissers.forEach(function (node) {
        const onDismiss = function () {
          trackEvent(EVENT_NAMES.EMAIL_MODAL_DISMISSED, {
            page,
            modal_id: modalId,
            timestamp: getIsoTimestamp(),
          });
        };

        node.addEventListener('click', onDismiss);
        cleanupFns.push(function () { node.removeEventListener('click', onDismiss); });
      });

      if (form) {
        const onSubmit = function () {
          trackEvent(EVENT_NAMES.EMAIL_MODAL_SUBMITTED, {
            page,
            modal_id: modalId,
            timestamp: getIsoTimestamp(),
          });
        };

        form.addEventListener('submit', onSubmit);
        cleanupFns.push(function () { form.removeEventListener('submit', onSubmit); });
      }
    }

    const onCustomModalEvent = function (event) {
      const detail = event.detail || {};
      const action = detail.action;
      const modalId = detail.modal_id || 'email_capture_modal';
      const eventMap = {
        shown: EVENT_NAMES.EMAIL_MODAL_SHOWN,
        dismissed: EVENT_NAMES.EMAIL_MODAL_DISMISSED,
        submitted: EVENT_NAMES.EMAIL_MODAL_SUBMITTED,
      };

      if (!eventMap[action]) {
        return;
      }

      trackEvent(eventMap[action], {
        page,
        modal_id: modalId,
        timestamp: getIsoTimestamp(),
      });
    };

    window.addEventListener('realmskeep:email-modal', onCustomModalEvent);
    cleanupFns.push(function () {
      window.removeEventListener('realmskeep:email-modal', onCustomModalEvent);
    });

    return function cleanup() {
      cleanupFns.forEach(function (fn) { fn(); });
    };
  }

  function setupScrollDepthTracking() {
    const milestones = [25, 50, 75, 100];
    const fired = new Set();

    const evaluateScrollDepth = throttle(function () {
      const docEl = document.documentElement;
      const scrollTop = window.pageYOffset || docEl.scrollTop || 0;
      const viewportHeight = window.innerHeight || docEl.clientHeight || 0;
      const fullHeight = Math.max(docEl.scrollHeight, document.body.scrollHeight);
      const percent = Math.min(100, Math.round(((scrollTop + viewportHeight) / fullHeight) * 100));

      milestones.forEach(function (milestone) {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          trackEvent(EVENT_NAMES.SCROLL_DEPTH_REACHED, {
            page,
            percent: milestone,
            timestamp: getIsoTimestamp(),
          });
        }
      });
    }, 200);

    window.addEventListener('scroll', evaluateScrollDepth, { passive: true });
    window.addEventListener('resize', evaluateScrollDepth);
    evaluateScrollDepth();

    return function cleanup() {
      window.removeEventListener('scroll', evaluateScrollDepth);
      window.removeEventListener('resize', evaluateScrollDepth);
    };
  }

  function setupTimeOnPageTracking() {
    const milestones = [30, 60, 120];
    const timers = [];

    milestones.forEach(function (seconds) {
      const timer = window.setTimeout(function () {
        trackEvent(EVENT_NAMES.TIME_ON_PAGE_REACHED, {
          page,
          seconds,
          timestamp: getIsoTimestamp(),
        });
      }, seconds * 1000);

      timers.push(timer);
    });

    return function cleanup() {
      timers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
    };
  }

  function setupHeroLogoAnimation() {
    const logoArea = document.querySelector('[data-hero-logo-area]');
    const logoTrigger = document.querySelector('[data-hero-logo-trigger]');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const replayThrottleMs = 1800;
    const animationDurationMs = 2200;
    let animationCleanupTimer;
    let lastPlayAt = 0;

    if (!logoArea || !logoTrigger || motionQuery.matches) {
      return function cleanup() {
        if (animationCleanupTimer) {
          window.clearTimeout(animationCleanupTimer);
        }
      };
    }

    function playAnimation(trigger) {
      const now = Date.now();

      if (trigger !== 'load' && now - lastPlayAt < replayThrottleMs) {
        return;
      }

      lastPlayAt = now;
      logoArea.classList.remove('logo-animation-active');

      window.requestAnimationFrame(function () {
        logoArea.classList.add('logo-animation-active');
      });

      if (animationCleanupTimer) {
        window.clearTimeout(animationCleanupTimer);
      }

      animationCleanupTimer = window.setTimeout(function () {
        logoArea.classList.remove('logo-animation-active');
      }, animationDurationMs);

      trackEvent(EVENT_NAMES.HERO_LOGO_ANIMATION_PLAYED, {
        page,
        trigger,
        timestamp: getIsoTimestamp(),
      });
    }

    const onHover = function () {
      playAnimation('hover');
    };

    const onFocus = function () {
      playAnimation('focus');
    };

    logoArea.addEventListener('mouseenter', onHover);
    logoTrigger.addEventListener('focus', onFocus);
    playAnimation('load');

    return function cleanup() {
      logoArea.removeEventListener('mouseenter', onHover);
      logoTrigger.removeEventListener('focus', onFocus);

      if (animationCleanupTimer) {
        window.clearTimeout(animationCleanupTimer);
      }
    };
  }

  const cleanups = [
    setupCtaTracking(),
    setupEmailModalTracking(),
    setupScrollDepthTracking(),
    setupTimeOnPageTracking(),
    setupHeroLogoAnimation(),
  ];

  function cleanupAll() {
    cleanups.forEach(function (cleanup) {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
  }

  window.addEventListener('pagehide', cleanupAll, { once: true });
})();
