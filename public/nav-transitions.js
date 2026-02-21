(function () {
  // ---- Active nav link highlighting ----
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.main-nav .nav-link').forEach(function (link) {
    var href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    // Match exact path or subpath (e.g. /lore matches /lore/first-post)
    if (href === currentPath || (href !== '/' && currentPath.indexOf(href) === 0)) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
