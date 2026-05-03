/* topbar.js — adds .scrolled class to .topbar after the page is scrolled past 12px */
(function () {
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;
  var ticking = false;
  function update() {
    topbar.classList.toggle('scrolled', window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();
