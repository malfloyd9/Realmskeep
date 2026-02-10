import { trackEvent } from './analytics.js';

/**
 * ArcaneSparks controls a short sparkle burst around the logo.
 * Tune CONFIG values for intensity and look.
 */
const CONFIG = {
  particleCount: 18,
  durationMs: 1400,
  throttleMs: 2200,
  spreadX: 220,
  spreadY: 100,
  colors: ['#f4c542', '#d8efff', '#8cd1ff', '#ffffff']
};

class ArcaneSparks {
  constructor(container) {
    this.container = container;
    this.lastPlayedAt = 0;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.container) return;

    this.mount();
    this.bindEvents();

    if (!this.reducedMotion) {
      window.requestAnimationFrame(() => this.play('load'));
    }
  }

  mount() {
    this.layer = document.createElement('div');
    this.layer.className = 'arcane-sparks-layer';
    this.layer.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.layer);
  }

  bindEvents() {
    this.container.addEventListener('mouseenter', () => this.play('hover'));

    const focusTarget = this.container.querySelector('a, button, [tabindex]');
    if (focusTarget) {
      focusTarget.addEventListener('focus', () => this.play('focus'));
    }
  }

  canReplay() {
    return Date.now() - this.lastPlayedAt >= CONFIG.throttleMs;
  }

  play(trigger) {
    if (!this.layer || this.reducedMotion || !this.canReplay()) {
      return;
    }

    this.lastPlayedAt = Date.now();
    this.layer.innerHTML = '';
    this.layer.classList.remove('is-active');

    for (let i = 0; i < CONFIG.particleCount; i += 1) {
      this.layer.appendChild(this.createParticle(i));
    }

    // Restart animation reliably.
    void this.layer.offsetWidth;
    this.layer.classList.add('is-active');

    window.setTimeout(() => {
      this.layer.classList.remove('is-active');
      this.layer.innerHTML = '';
    }, CONFIG.durationMs);

    trackEvent('hero_logo_animation_played', {
      page: window.location.pathname,
      trigger,
      timestamp: new Date().toISOString()
    });
  }

  createParticle(index) {
    const spark = document.createElement('span');
    spark.className = 'arcane-spark';

    const x = (Math.random() - 0.5) * CONFIG.spreadX;
    const y = (Math.random() - 0.5) * CONFIG.spreadY;
    const driftX = (Math.random() - 0.5) * 90;
    const driftY = -40 - Math.random() * 75;
    const delay = Math.random() * 280;
    const life = 750 + Math.random() * 550;
    const color = CONFIG.colors[index % CONFIG.colors.length];

    spark.style.setProperty('--spark-x', `${x}px`);
    spark.style.setProperty('--spark-y', `${y}px`);
    spark.style.setProperty('--spark-drift-x', `${driftX}px`);
    spark.style.setProperty('--spark-drift-y', `${driftY}px`);
    spark.style.setProperty('--spark-delay', `${delay}ms`);
    spark.style.setProperty('--spark-life', `${life}ms`);
    spark.style.setProperty('--spark-color', color);

    return spark;
  }
}

const root = document.querySelector('[data-arcane-sparks]');
if (root) {
  new ArcaneSparks(root);
}
