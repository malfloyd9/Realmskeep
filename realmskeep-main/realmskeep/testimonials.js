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
