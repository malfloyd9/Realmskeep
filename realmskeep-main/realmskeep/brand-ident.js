(function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---- Analytics bridge ----
  function trackAnimation(trigger) {
    if (window.RealmskeepAnalytics) {
      window.RealmskeepAnalytics.trackEvent(
        window.RealmskeepAnalytics.EVENT_NAMES.HERO_LOGO_ANIMATION_PLAYED,
        {
          page: window.location.pathname || '/',
          trigger: trigger,
          timestamp: window.RealmskeepAnalytics.getIsoTimestamp(),
        }
      );
    }
  }

  // ---- Birds (particle spawner) ----

  function spawnBirds(svgRoot, count) {
    var originX = 250;
    var originY = 135;
    var rootStyle = getComputedStyle(document.documentElement);
    var birdStroke = rootStyle.getPropertyValue('--bird-stroke').trim() || '#0a0a0a';

    for (var i = 0; i < count; i++) {
      var bird = document.createElementNS(SVG_NS, 'path');
      var size = gsap.utils.random(3, 6);

      bird.setAttribute('d', 'M' + (-size) + ',' + (-size / 2) + ' L0,0 L' + size + ',' + (-size / 2));
      bird.setAttribute('fill', 'none');
      bird.setAttribute('stroke', birdStroke);
      bird.setAttribute('stroke-width', '1.2');
      bird.setAttribute('stroke-linecap', 'round');

      gsap.set(bird, {
        x: originX + gsap.utils.random(-15, 15),
        y: originY,
        opacity: 0.9,
        scale: 1,
        transformOrigin: 'center center',
      });

      svgRoot.appendChild(bird);

      var duration = gsap.utils.random(2.0, 4.0);
      var flyX = gsap.utils.random(-300, 300);
      var flyY = gsap.utils.random(150, 400);
      var endScale = gsap.utils.random(2.0, 3.5);

      gsap.to(bird, {
        x: '+=' + flyX,
        y: '-=' + flyY,
        scale: endScale,
        strokeWidth: 0.8,
        duration: duration,
        ease: 'power1.out',
        onComplete: function () { this.targets()[0].remove(); },
      });

      gsap.to(bird, {
        opacity: 0,
        duration: duration * 0.4,
        delay: duration * 0.6,
        ease: 'power2.in',
      });
    }
  }

  // ---- Ambient (Phase 2) ----

  var ambientTweens = [];
  var lightBeam = null;

  function startAmbient() {
    animateFloat();
    animateLight();
  }

  function stopAmbient() {
    ambientTweens.forEach(function (tw) { tw.kill(); });
    ambientTweens = [];
    if (lightBeam) {
      lightBeam.remove();
      lightBeam = null;
    }
  }

  function animateFloat() {
    var groups = ['#REALM_S_KEEP', '#GAMING_GEAR', '#EST', '#_2022'];
    groups.forEach(function (sel, i) {
      var tw = gsap.to(sel, {
        y: gsap.utils.random(2, 5),
        duration: gsap.utils.random(2.5, 4),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.3,
      });
      ambientTweens.push(tw);
    });
  }

  function animateLight() {
    var svg = document.querySelector('#LOGO');
    if (!svg) return;

    var rootStyle = getComputedStyle(document.documentElement);
    var beamFill = rootStyle.getPropertyValue('--beam-fill').trim() || 'rgba(255,255,255,0.08)';
    var beamBlend = rootStyle.getPropertyValue('--beam-blend').trim() || 'overlay';
    var beamMaxOpacity = parseFloat(rootStyle.getPropertyValue('--beam-opacity')) || 0.6;

    if (beamMaxOpacity <= 0) return;

    var beam = document.createElementNS(SVG_NS, 'rect');
    beam.setAttribute('id', 'light-beam');
    beam.setAttribute('x', '0');
    beam.setAttribute('y', '100');
    beam.setAttribute('width', '30');
    beam.setAttribute('height', '320');
    beam.setAttribute('fill', beamFill);
    beam.style.mixBlendMode = beamBlend;
    beam.style.pointerEvents = 'none';

    gsap.set(beam, { x: -50, opacity: 0 });
    svg.appendChild(beam);
    lightBeam = beam;

    var tw = gsap.to(beam, {
      x: 550,
      opacity: beamMaxOpacity,
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1,
      repeatDelay: gsap.utils.random(5, 8),
      onRepeat: function () {
        gsap.set(beam, { x: -50, opacity: 0 });
      },
    });
    ambientTweens.push(tw);
  }

  // ---- Eternal Duel (window glow) ----

  var PURPLE = '#7B2FBE';
  var FIRE_RED = '#DC2626';
  var ELECTRIC_BLUE = '#33CFFF';
  var PLASMA_PINK = '#FF2A6D';

  var duelTweens = [];
  var duelGroup = null;
  var duelDefs = null;
  var glowPath = null;
  var purpleRect = null;
  var redRect = null;
  var isHovering = false;
  var hoverHandler = null;
  var leaveHandler = null;
  var duelLogoTrigger = null;
  var sparkGlowFilter = null;
  var flashGradId = 0;

  function startEternalDuel() {
    var svg = document.querySelector('#LOGO');
    var windowEl = document.querySelector('#window');
    var castleGroup = document.querySelector('#castle');
    if (!svg || !windowEl || !castleGroup) return;

    // Inject <defs>
    duelDefs = document.createElementNS(SVG_NS, 'defs');

    var clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.setAttribute('id', 'window-clip');
    var clipUse = document.createElementNS(SVG_NS, 'use');
    clipUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#window');
    clipPath.appendChild(clipUse);
    duelDefs.appendChild(clipPath);

    var filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', 'window-glow-filter');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    var blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    filter.appendChild(blur);
    duelDefs.appendChild(filter);

    // Spark glow filter — makes battle sparks bloom
    sparkGlowFilter = document.createElementNS(SVG_NS, 'filter');
    sparkGlowFilter.setAttribute('id', 'spark-glow');
    sparkGlowFilter.setAttribute('x', '-100%');
    sparkGlowFilter.setAttribute('y', '-100%');
    sparkGlowFilter.setAttribute('width', '300%');
    sparkGlowFilter.setAttribute('height', '300%');
    var sparkBlur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    sparkBlur.setAttribute('stdDeviation', '3');
    sparkBlur.setAttribute('result', 'blur');
    sparkGlowFilter.appendChild(sparkBlur);
    var merge = document.createElementNS(SVG_NS, 'feMerge');
    var mergeBlur = document.createElementNS(SVG_NS, 'feMergeNode');
    mergeBlur.setAttribute('in', 'blur');
    merge.appendChild(mergeBlur);
    var mergeSource = document.createElementNS(SVG_NS, 'feMergeNode');
    mergeSource.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mergeSource);
    sparkGlowFilter.appendChild(merge);
    duelDefs.appendChild(sparkGlowFilter);

    svg.insertBefore(duelDefs, svg.firstChild);

    var box = windowEl.getBBox();

    duelGroup = document.createElementNS(SVG_NS, 'g');
    duelGroup.setAttribute('id', 'eternal-duel-group');

    glowPath = document.createElementNS(SVG_NS, 'path');
    glowPath.setAttribute('d', windowEl.getAttribute('d'));
    glowPath.setAttribute('fill', PURPLE);
    glowPath.setAttribute('filter', 'url(#window-glow-filter)');
    glowPath.style.pointerEvents = 'none';
    gsap.set(glowPath, { opacity: 0 });
    duelGroup.appendChild(glowPath);

    var pulseGroup = document.createElementNS(SVG_NS, 'g');
    pulseGroup.setAttribute('clip-path', 'url(#window-clip)');

    purpleRect = document.createElementNS(SVG_NS, 'rect');
    purpleRect.setAttribute('x', box.x);
    purpleRect.setAttribute('y', box.y);
    purpleRect.setAttribute('width', box.width);
    purpleRect.setAttribute('height', box.height);
    purpleRect.setAttribute('fill', PURPLE);
    gsap.set(purpleRect, { opacity: 0.3 });
    pulseGroup.appendChild(purpleRect);

    redRect = document.createElementNS(SVG_NS, 'rect');
    redRect.setAttribute('x', box.x);
    redRect.setAttribute('y', box.y);
    redRect.setAttribute('width', box.width);
    redRect.setAttribute('height', box.height);
    redRect.setAttribute('fill', FIRE_RED);
    gsap.set(redRect, { opacity: 0 });
    pulseGroup.appendChild(redRect);

    duelGroup.appendChild(pulseGroup);
    svg.insertBefore(duelGroup, castleGroup);

    startIdlePulse();

    duelLogoTrigger = document.getElementById('logo-trigger') ||
      document.querySelector('[data-hero-logo-trigger]');
    if (duelLogoTrigger) {
      hoverHandler = function () { enterBattle(); };
      leaveHandler = function () { exitBattle(); };
      duelLogoTrigger.addEventListener('mouseenter', hoverHandler);
      duelLogoTrigger.addEventListener('mouseleave', leaveHandler);
    }
  }

  function stopEternalDuel() {
    duelTweens.forEach(function (tw) { tw.kill(); });
    duelTweens = [];
    isHovering = false;

    if (duelLogoTrigger && hoverHandler) {
      duelLogoTrigger.removeEventListener('mouseenter', hoverHandler);
      duelLogoTrigger.removeEventListener('mouseleave', leaveHandler);
      hoverHandler = null;
      leaveHandler = null;
    }

    var groupToRemove = duelGroup;
    var defsToRemove = duelDefs;

    if (groupToRemove) {
      gsap.to(groupToRemove, {
        opacity: 0,
        filter: 'blur(6px)',
        duration: 0.6,
        ease: 'power1.in',
        onComplete: function () {
          groupToRemove.remove();
          if (defsToRemove) defsToRemove.remove();
        },
      });
    } else if (defsToRemove) {
      defsToRemove.remove();
    }

    duelGroup = null;
    duelDefs = null;
    glowPath = null;
    purpleRect = null;
    redRect = null;
    duelLogoTrigger = null;
    sparkGlowFilter = null;
  }

  function startIdlePulse() {
    if (!purpleRect || !redRect) return;

    var tw1 = gsap.to(purpleRect, {
      opacity: 0.7,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    duelTweens.push(tw1);

    var tw2 = gsap.to(redRect, {
      opacity: 0.5,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5,
    });
    duelTweens.push(tw2);

    scheduleIdleSparks();
  }

  function scheduleIdleSparks() {
    var delay = gsap.utils.random(0.8, 2.5);
    var call = gsap.delayedCall(delay, function () {
      if (!isHovering && duelGroup) {
        spawnDuelSparks({ colors: [FIRE_RED, ELECTRIC_BLUE], count: Math.floor(gsap.utils.random(3, 6)) });
        if (Math.random() > 0.5) {
          spawnArcaneBolts({ colors: [PURPLE, FIRE_RED], count: Math.floor(gsap.utils.random(1, 3)) });
        }
        scheduleIdleSparks();
      }
    });
    duelTweens.push(call);
  }

  function enterBattle() {
    if (isHovering || !purpleRect || !redRect || !glowPath) return;
    isHovering = true;

    duelTweens.forEach(function (tw) { tw.kill(); });
    duelTweens = [];

    purpleRect.setAttribute('fill', ELECTRIC_BLUE);
    redRect.setAttribute('fill', PLASMA_PINK);

    var tw1 = gsap.to(purpleRect, {
      opacity: 0.95,
      duration: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });
    duelTweens.push(tw1);

    var tw2 = gsap.to(redRect, {
      opacity: 0.95,
      duration: 0.25,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      delay: 0.12,
    });
    duelTweens.push(tw2);

    glowPath.setAttribute('fill', ELECTRIC_BLUE);
    var tw3 = gsap.to(glowPath, {
      opacity: 0.8,
      duration: 0.3,
      ease: 'power2.out',
    });
    duelTweens.push(tw3);

    var tw4 = gsap.to(glowPath, {
      fill: PLASMA_PINK,
      duration: 0.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 0.3,
    });
    duelTweens.push(tw4);

    spawnDuelSparks({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: 8, battle: true });
    spawnArcaneBolts({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: 3 });
    scheduleBattleSparks();
  }

  function scheduleBattleSparks() {
    var delay = gsap.utils.random(0.4, 1.0);
    var call = gsap.delayedCall(delay, function () {
      if (isHovering && duelGroup) {
        spawnDuelSparks({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: Math.floor(gsap.utils.random(4, 8)), battle: true });
        if (Math.random() > 0.6) {
          spawnArcaneBolts({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: Math.floor(gsap.utils.random(1, 3)) });
        }
        scheduleBattleSparks();
      }
    });
    duelTweens.push(call);
  }

  function exitBattle() {
    if (!isHovering || !purpleRect || !redRect || !glowPath) return;
    isHovering = false;

    duelTweens.forEach(function (tw) { tw.kill(); });
    duelTweens = [];

    var tw1 = gsap.to(glowPath, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    });
    duelTweens.push(tw1);

    purpleRect.setAttribute('fill', PURPLE);
    redRect.setAttribute('fill', FIRE_RED);

    gsap.to(purpleRect, { opacity: 0.3, duration: 0.8, ease: 'power1.out' });
    gsap.to(redRect, { opacity: 0, duration: 0.8, ease: 'power1.out' });

    gsap.delayedCall(0.8, function () {
      if (!isHovering) startIdlePulse();
    });
  }

  function spawnDuelSparks(opts) {
    var svg = document.querySelector('#LOGO');
    var windowEl = document.querySelector('#window');
    if (!svg || !windowEl) return;

    var colors = (opts && opts.colors) || [ELECTRIC_BLUE, FIRE_RED];
    var colorA = colors[0];
    var colorB = colors[1];
    var battle = (opts && opts.battle) || false;
    var box = windowEl.getBBox();
    var cx = box.x + box.width / 2;
    var cy = box.y + box.height / 2;
    var count = (opts && opts.count) || Math.floor(gsap.utils.random(3, 7));

    var radiusMin = battle ? 2 : 1;
    var radiusMax = battle ? 5 : 2.5;
    var distMin = battle ? 40 : 25;
    var distMax = battle ? 120 : 70;

    var colorAAvgX = 0, colorBAvgX = 0;
    var colorACount = 0, colorBCount = 0;

    for (var i = 0; i < count; i++) {
      var spark = document.createElementNS(SVG_NS, 'circle');
      var isColorA = Math.random() > 0.5;
      var color = isColorA ? colorA : colorB;
      spark.setAttribute('r', gsap.utils.random(radiusMin, radiusMax));
      spark.setAttribute('fill', color);
      spark.style.pointerEvents = 'none';

      if (battle && sparkGlowFilter) {
        spark.setAttribute('filter', 'url(#spark-glow)');
      }

      gsap.set(spark, { attr: { cx: cx, cy: cy }, opacity: 1 });
      svg.appendChild(spark);

      var duration = gsap.utils.random(0.6, battle ? 1.8 : 1.4);
      var angle = gsap.utils.random(0, Math.PI * 2);
      var dist = gsap.utils.random(distMin, distMax);
      var dx = Math.cos(angle) * dist;

      if (isColorA) { colorAAvgX += dx; colorACount++; }
      else { colorBAvgX += dx; colorBCount++; }

      gsap.to(spark, {
        attr: { cx: cx + dx, cy: cy + Math.sin(angle) * dist, r: battle ? gsap.utils.random(0.5, 1.5) : 0.5 },
        duration: duration,
        ease: 'power2.out',
        onComplete: function () { this.targets()[0].remove(); },
      });

      gsap.to(spark, {
        opacity: 0,
        duration: duration * 0.4,
        delay: duration * 0.6,
        ease: 'power2.in',
      });
    }

    flashWindowGradient(colorA, colorB, colorAAvgX, colorBAvgX, colorACount, colorBCount, battle);
  }

  function flashWindowGradient(colorA, colorB, avgXA, avgXB, countA, countB, battle) {
    var svg = document.querySelector('#LOGO');
    var windowEl = document.querySelector('#window');
    if (!svg || !windowEl) return;

    var aDirX = countA > 0 ? avgXA / countA : 0;
    var bDirX = countB > 0 ? avgXB / countB : 0;
    var leftColor = aDirX <= bDirX ? colorA : colorB;
    var rightColor = aDirX <= bDirX ? colorB : colorA;

    var gradId = 'duel-flash-grad-' + (flashGradId++);
    var grad = document.createElementNS(SVG_NS, 'linearGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '1');
    grad.setAttribute('y2', '0');

    var stop1 = document.createElementNS(SVG_NS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', leftColor);
    grad.appendChild(stop1);

    var stop2 = document.createElementNS(SVG_NS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', rightColor);
    grad.appendChild(stop2);

    var defsEl = duelDefs;
    if (!defsEl) {
      defsEl = svg.querySelector('defs') || document.createElementNS(SVG_NS, 'defs');
      if (!defsEl.parentNode) svg.insertBefore(defsEl, svg.firstChild);
    }
    defsEl.appendChild(grad);

    var flashEl;
    if (windowEl.tagName === 'path' && windowEl.getAttribute('d')) {
      flashEl = document.createElementNS(SVG_NS, 'path');
      flashEl.setAttribute('d', windowEl.getAttribute('d'));
    } else {
      var box = windowEl.getBBox();
      flashEl = document.createElementNS(SVG_NS, 'rect');
      flashEl.setAttribute('x', box.x);
      flashEl.setAttribute('y', box.y);
      flashEl.setAttribute('width', box.width);
      flashEl.setAttribute('height', box.height);
      if (duelDefs) flashEl.setAttribute('clip-path', 'url(#window-clip)');
    }
    flashEl.setAttribute('fill', 'url(#' + gradId + ')');
    flashEl.style.pointerEvents = 'none';
    gsap.set(flashEl, { opacity: 0 });

    var parent = duelGroup || svg;
    parent.appendChild(flashEl);

    var flashPeak = battle ? 1.0 : 0.85;
    var flashFade = battle ? 0.6 : 1.0;

    gsap.to(flashEl, {
      opacity: flashPeak,
      duration: 0.08,
      ease: 'power2.out',
      onComplete: function () {
        gsap.to(flashEl, {
          opacity: 0,
          duration: flashFade,
          ease: 'power1.in',
          onComplete: function () {
            flashEl.remove();
            grad.remove();
          },
        });
      },
    });

    // White-hot core flash in battle mode
    if (battle) {
      var coreFlash = flashEl.cloneNode(true);
      coreFlash.setAttribute('fill', '#ffffff');
      parent.appendChild(coreFlash);
      gsap.set(coreFlash, { opacity: 0 });
      gsap.to(coreFlash, {
        opacity: 0.6,
        duration: 0.05,
        ease: 'power2.out',
        onComplete: function () {
          gsap.to(coreFlash, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: function () { coreFlash.remove(); },
          });
        },
      });
    }
  }

  // Arcane bolt streaks — sharp lines that fire outward from the window
  function spawnArcaneBolts(opts) {
    var svg = document.querySelector('#LOGO');
    var windowEl = document.querySelector('#window');
    if (!svg || !windowEl) return;

    var colors = (opts && opts.colors) || [ELECTRIC_BLUE, PLASMA_PINK];
    var colorA = colors[0];
    var colorB = colors[1];
    var count = (opts && opts.count) || 2;
    var box = windowEl.getBBox();
    var cx = box.x + box.width / 2;
    var cy = box.y + box.height / 2;

    for (var i = 0; i < count; i++) {
      var bolt = document.createElementNS(SVG_NS, 'line');
      var color = Math.random() > 0.5 ? colorA : colorB;
      var angle = gsap.utils.random(0, Math.PI * 2);
      var boltLength = gsap.utils.random(30, 80);

      var startDist = gsap.utils.random(5, 15);
      var x1 = cx + Math.cos(angle) * startDist;
      var y1 = cy + Math.sin(angle) * startDist;

      bolt.setAttribute('x1', x1);
      bolt.setAttribute('y1', y1);
      bolt.setAttribute('x2', x1);
      bolt.setAttribute('y2', y1);
      bolt.setAttribute('stroke', color);
      bolt.setAttribute('stroke-width', gsap.utils.random(1.5, 3));
      bolt.setAttribute('stroke-linecap', 'round');
      bolt.style.pointerEvents = 'none';

      if (sparkGlowFilter) {
        bolt.setAttribute('filter', 'url(#spark-glow)');
      }

      gsap.set(bolt, { opacity: 1 });
      svg.appendChild(bolt);

      var endX = x1 + Math.cos(angle) * boltLength;
      var endY = y1 + Math.sin(angle) * boltLength;
      var duration = gsap.utils.random(0.15, 0.3);

      gsap.to(bolt, {
        attr: { x2: endX, y2: endY },
        duration: duration,
        ease: 'power3.out',
      });

      gsap.to(bolt, {
        attr: {
          x1: endX,
          y1: endY,
          x2: endX + Math.cos(angle) * 10,
          y2: endY + Math.sin(angle) * 10,
        },
        opacity: 0,
        duration: duration * 1.5,
        delay: duration * 0.8,
        ease: 'power2.in',
        onComplete: function () { this.targets()[0].remove(); },
      });
    }
  }

  // ---- Assembly (Phase 1) ----

  var TOP_LETTER_SELECTORS = [
    '#letter_R-2',
    '#letter_EA',
    '#letter_LM',
    '#letter_S-2',
    '#letter_KE',
    '#letter_second_E',
    '#letter_P',
  ];
  var APOSTROPHE_SELECTOR = '#letter_apostrophy';

  function playAssembly(onComplete) {
    var tl = gsap.timeline({ onComplete: onComplete });

    var topLetters = TOP_LETTER_SELECTORS
      .map(function (sel) { return document.querySelector(sel); })
      .filter(Boolean);

    topLetters.forEach(function (el) {
      gsap.set(el, {
        x: gsap.utils.random(-300, 300),
        y: gsap.utils.random(-300, 300),
        rotation: gsap.utils.random(-180, 180),
        opacity: 0,
        transformOrigin: 'center center',
      });
    });

    var apostrophe = document.querySelector(APOSTROPHE_SELECTOR);
    if (apostrophe) {
      gsap.set(apostrophe, {
        x: gsap.utils.random(-300, 300),
        y: gsap.utils.random(-300, 300),
        opacity: 0,
      });
    }

    gsap.set('#GAMING_GEAR', { y: 100, opacity: 0 });
    gsap.set('#EST', { x: -200, opacity: 0 });
    gsap.set('#_2022', { x: 200, opacity: 0 });
    gsap.set('#castle', { opacity: 0 });

    // Reveal SVG now that everything is scattered/hidden (prevents FOUC)
    gsap.set('#LOGO', { opacity: 1 });

    // 1a: Castle fades in
    tl.to('#castle', {
      opacity: 1,
      duration: 1.0,
      ease: 'power1.in',
    }, 0);

    // 1b: Top text letters snap into place
    var shuffled = gsap.utils.shuffle([].concat(topLetters));
    tl.to(shuffled, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 1.8,
      ease: 'elastic.out(1, 0.75)',
      stagger: { each: 0.12, from: 'random' },
    }, 'letters');

    if (apostrophe) {
      tl.to(apostrophe, {
        x: 0,
        y: 0,
        opacity: 1,
        duration: 1.8,
        ease: 'elastic.out(1, 0.75)',
      }, 'letters+=0.3');
    }

    // 1c: GAMING GEAR slides up
    tl.to('#GAMING_GEAR', {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
    }, 'letters+=0.8');

    // 1d: EST slams left, 2022 slams right
    tl.to('#EST', {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power4.out',
    }, 'slam');

    tl.to('#_2022', {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power4.out',
    }, 'slam');

    // 1e: Castle impact shake
    tl.to('#castle', {
      x: '+=3',
      y: '-=2',
      duration: 0.03,
      repeat: 5,
      yoyo: true,
      ease: 'none',
    }, 'slam+=0.55');

    // 1f: Birds fly from tower top
    tl.call(function () {
      var svg = document.querySelector('#LOGO');
      if (svg) spawnBirds(svg, 15);
    }, [], 'slam+=0.55');

    // 1g: Arcane burst from window at impact
    tl.call(function () {
      spawnDuelSparks({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: 10, battle: true });
      spawnArcaneBolts({ colors: [ELECTRIC_BLUE, PLASMA_PINK], count: 4 });
    }, [], 'slam+=0.55');

    return tl;
  }

  // ---- Vaporize + Replay (Phase 3) ----

  function vaporizeAndReplay(onAssemblyComplete) {
    var vaporizeTL = gsap.timeline({
      onComplete: function () {
        gsap.set(
          [
            '#REALM_S_KEEP path',
            '#GAMING_GEAR path',
            '#EST', '#_2022', '#castle',
            '#GAMING_GEAR', '#REALM_S_KEEP',
          ],
          { clearProps: 'all' }
        );
        var apos = document.querySelector(APOSTROPHE_SELECTOR);
        if (apos) {
          gsap.set(apos, { clearProps: 'all' });
          apos.setAttribute('transform', 'translate(185.86 288.86) rotate(-89.9)');
        }
        trackAnimation('click');
        playAssembly(function () {
          startAmbient();
          startEternalDuel();
          if (typeof onAssemblyComplete === 'function') onAssemblyComplete();
        });
      },
    });

    vaporizeTL.to('#REALM_S_KEEP path', {
      y: function () { return gsap.utils.random(-80, -150); },
      opacity: 0,
      filter: 'blur(4px)',
      duration: 0.8,
      stagger: 0.04,
      ease: 'power1.in',
    }, 0);

    vaporizeTL.to(APOSTROPHE_SELECTOR, {
      opacity: 0,
      filter: 'blur(4px)',
      duration: 0.8,
      ease: 'power1.in',
    }, 0);

    vaporizeTL.to('#GAMING_GEAR path', {
      y: function () { return gsap.utils.random(-60, -120); },
      opacity: 0,
      filter: 'blur(4px)',
      duration: 0.8,
      stagger: 0.04,
      ease: 'power1.in',
    }, 0.1);

    vaporizeTL.to('#EST, #_2022, #castle', {
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.6,
      ease: 'power1.in',
    }, 0.2);
  }

  // ---- Init ----

  function init() {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    var logoTrigger = document.querySelector('[data-hero-logo-trigger]');
    var scope = document.querySelector('[data-hero-logo-area]');
    if (!scope || !logoTrigger) return;

    var ctx = gsap.context(function () {
      trackAnimation('load');
      playAssembly(function () {
        ctx.add(function () {
          startAmbient();
          startEternalDuel();
        });
      });
    }, scope);

    logoTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      stopAmbient();
      stopEternalDuel();
      ctx.add(function () {
        vaporizeAndReplay();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
