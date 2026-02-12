(function () {
  var RACES = [
    'Human', 'Elf', 'Half-Elf', 'Dwarf', 'Halfling', 'Gnome',
    'Tiefling', 'Dragonborn', 'Half-Orc', 'Aasimar', 'Goliath',
    'Tabaxi', 'Firbolg', 'Kenku', 'Tortle', 'Changeling',
    'Wood Elf', 'High Elf', 'Dark Elf', 'Hill Dwarf',
    'Mountain Dwarf', 'Lightfoot Halfling', 'Stout Halfling'
  ];

  var CLASSES = [
    'Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin',
    'Barbarian', 'Bard', 'Druid', 'Monk', 'Sorcerer', 'Warlock',
    'Artificer', 'Blood Hunter'
  ];

  /**
   * Generate a random D&D-style title like "Level 8 Halfling Rogue".
   * Uses a seeded approach based on the customer name so the same name
   * always gets the same title (consistent across page loads).
   */
  function generateTitle(name) {
    var seed = 0;
    for (var i = 0; i < name.length; i++) {
      seed = ((seed << 5) - seed + name.charCodeAt(i)) | 0;
    }
    // Make seed positive
    seed = Math.abs(seed);

    var level = (seed % 17) + 3; // 3–19
    var race = RACES[seed % RACES.length];
    var cls = CLASSES[(seed >> 4) % CLASSES.length];

    return 'Level ' + level + ' ' + race + ' ' + cls;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderStars(count) {
    var filled = Math.min(Math.max(count || 5, 1), 5);
    var stars = '';
    for (var i = 0; i < filled; i++) stars += '\u2605';
    for (var j = filled; j < 5; j++) stars += '\u2606';
    return stars;
  }

  function renderCard(item, isClone) {
    var title = item.title || generateTitle(item.name);
    var starCount = item.stars || 5;
    var starLabel = starCount === 5 ? 'Five' : starCount === 4 ? 'Four' : starCount + '';
    var html =
      '<article class="testimonial-card" role="listitem"' +
      (isClone ? ' aria-hidden="true"' : '') + '>' +
        '<div class="testimonial-meta">' +
          '<p class="role" aria-label="' + starLabel + ' star rating">' + renderStars(starCount) + '</p>' +
          '<p class="source-chip">' + escapeHtml(item.source || 'Verified Etsy Buyer') + '</p>' +
        '</div>' +
        '<p class="quote">\u201C' + escapeHtml(item.quote) + '\u201D</p>' +
        '<div class="author-block">' +
          '<p class="author">\u2014 ' + escapeHtml(item.name) + '</p>' +
          '<p class="author-title">' + escapeHtml(title) + '</p>' +
        '</div>' +
      '</article>';
    return html;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function renderTestimonials(data) {
    var track = document.querySelector('.testimonials-track');
    if (!track) return;

    var shuffled = shuffle(data);
    var html = '';

    // Original set (shuffled)
    for (var i = 0; i < shuffled.length; i++) {
      html += renderCard(shuffled[i], false);
    }

    // Duplicate set for seamless marquee loop (same order)
    for (var j = 0; j < shuffled.length; j++) {
      html += renderCard(shuffled[j], true);
    }

    track.innerHTML = html;

    // --- Pause/resume: desktop hover + mobile tap-to-focus ---
    var focusedCard = null;
    var mobileQuery = window.matchMedia('(max-width: 768px)');
    var ANIM_DURATION = 120; // must match CSS marquee duration in seconds

    function getTrackX() {
      var computed = getComputedStyle(track);
      var matrix = computed.transform || computed.webkitTransform;
      if (matrix && matrix !== 'none') {
        var values = matrix.match(/matrix.*\((.+)\)/);
        if (values) {
          var parts = values[1].split(', ');
          return parseFloat(parts[4]) || 0;
        }
      }
      return 0;
    }

    // Desktop: pause on hover, resume on leave
    track.addEventListener('mouseenter', function () {
      if (!mobileQuery.matches) track.classList.add('is-paused');
    });
    track.addEventListener('mouseleave', function () {
      if (!mobileQuery.matches) track.classList.remove('is-paused');
    });

    // Mobile: tap card to center + scale, tap again to resume
    track.addEventListener('click', function (e) {
      if (!mobileQuery.matches) return;

      // If anything is focused, any tap just resumes the carousel
      if (focusedCard) {
        unfocusCard();
        return;
      }

      var card = e.target.closest('.testimonial-card');
      if (!card) return;

      focusCard(card);
    });

    function focusCard(card) {
      if (focusedCard) {
        focusedCard.classList.remove('is-focused');
      }

      var currentX = getTrackX();

      // Freeze track: kill animation, hold at current position
      track.style.animation = 'none';
      track.style.transform = 'translateX(' + currentX + 'px)';

      // Calculate offset to center this card in the viewport
      var cardRect = card.getBoundingClientRect();
      var viewportCenter = window.innerWidth / 2;
      var cardCenter = cardRect.left + cardRect.width / 2;
      var offset = viewportCenter - cardCenter;

      // Force reflow so transition picks up the starting position
      track.offsetHeight; // eslint-disable-line no-unused-expressions

      // Smooth slide to centered position
      track.style.transition = 'transform 0.4s ease';
      track.style.transform = 'translateX(' + (currentX + offset) + 'px)';

      card.classList.add('is-focused');
      focusedCard = card;
    }

    function unfocusCard() {
      if (focusedCard) {
        focusedCard.classList.remove('is-focused');
        focusedCard = null;
      }

      // Read where the track is now (the centered position)
      var currentX = getTrackX();
      var halfWidth = track.scrollWidth / 2;

      // Calculate how far through the animation cycle this position is
      var progress = halfWidth > 0 ? (Math.abs(currentX) / halfWidth) % 1 : 0;
      var timeOffset = progress * ANIM_DURATION;

      // Clear inline styles and restart animation from current position
      track.style.transition = '';
      track.style.transform = '';
      track.style.animation = 'none';
      track.offsetHeight; // force reflow to reset animation
      track.style.animation = '';
      track.style.animationDelay = '-' + timeOffset.toFixed(2) + 's';
    }
  }

  function init() {
    fetch('./testimonials.json')
      .then(function (res) { return res.json(); })
      .then(function (data) { renderTestimonials(data); })
      .catch(function (err) {
        console.warn('[testimonials] Failed to load:', err);
      });
  }

  // Expose generator for use when adding new testimonials
  window.RealmskeepTestimonials = {
    generateTitle: generateTitle
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
