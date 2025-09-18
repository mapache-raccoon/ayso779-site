(function setFooterYear() {
   const el = document.getElementById('year');
   if (el) el.textContent = new Date().getFullYear().toString();
})();
// Optional: simple mobile menu toggle
(function navToggle() {
   const btn = document.querySelector('.nav__toggle');
   const menu = document.getElementById('nav-menu');
   if (!btn || !menu) return;
   btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('is-open', !expanded);
   });
})();