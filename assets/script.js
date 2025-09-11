// Simple client-side include loader and nav toggle
(function () {
   // include partials for elements with [data-include]
   async function includePartials() {
      const incEls = document.querySelectorAll('[data-include]');
      await Promise.all(
         Array.from(incEls).map(async (el) => {
            const url = el.getAttribute('data-include');
            if (!url) return;
            try {
               const res = await fetch(url, { cache: 'no-cache' });
               if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
               el.innerHTML = await res.text();
            } catch (e) {
               el.innerHTML = `<div style="padding:1rem;color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;">Include failed: ${url}</div>`;
               console.error(e);
            }
         })
      );
   }

   function setupNavToggle() {
      const topbar = document.querySelector('.topbar');
      if (!topbar) return;
      const btn = topbar.querySelector('.nav-toggle');
      const nav = topbar.querySelector('#site-nav');
      if (!btn || !nav) return;
      btn.addEventListener('click', () => {
         const opened = nav.classList.toggle('open');
         btn.setAttribute('aria-expanded', String(opened));
      });
   }

   function setYear() {
      const el = document.getElementById('year');
      if (el) el.textContent = String(new Date().getFullYear());
   }

   window.addEventListener('DOMContentLoaded', async () => {
      await includePartials();
      setupNavToggle();
      setYear();
   });
})();

