// ===============================
// Utility: Set the current year in the footer
// ===============================
/**
 * Sets the current year in the footer element with id="year".
 */
function setFooterYear() {
   const yearSpan = document.getElementById('year');
   if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
   }
}

// Measure the injected navigation and set a CSS variable so pages can
// reserve space for a fixed navbar. Debounced on resize.
function setNavOffset() {
   const nav = document.querySelector('.navbar');
   if (!nav) return;
   const set = () => {
      const h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--top-nav-offset', h + 'px');
   };
   set();
   let resizeTimer;
   window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(set, 120);
   });
}

// ===============================
// DOMContentLoaded: Run on page load
// ===============================
document.addEventListener('DOMContentLoaded', function () {
   // Load navigation content first, then initialize behaviours that expect DOM nodes
   loadNavigation()
      .catch((err) => {
         console.warn('loadNavigation failed:', err);
      })
      .finally(() => {
         setupNavigation();
         setFooterYear();
         try { setupAnnouncements(); } catch (e) { /* ignore if feature missing */ }
         try { setupMobileCollapsibles(); } catch (e) { /* ignore if feature missing */ }
      });
});

// ===============================
// Navigation: Delegated mobile behaviour
// ===============================
function setupNavigation() {
   const nav = document.querySelector('.navbar');
   if (!nav) return;

   // Once the nav exists, ensure other parts of the page know its height
   try { setNavOffset(); } catch (e) { /* ignore */ }

   const toggle = nav.querySelector('.navbar-toggle');
   const menu = nav.querySelector('.navbar-menu');

   console.debug('setupNavigation delegated init', { toggle: !!toggle, menu: !!menu });

   // Delegated pointerdown to prevent tap-through on toggles
   nav.addEventListener('pointerdown', (ev) => {
      const t = ev.target.closest && ev.target.closest('[data-dropdown-toggle], .navbar-toggle');
      if (!t) return;
      try {
         if (ev.pointerType === 'touch') ev.preventDefault();
      } catch (e) { }
   });

   // Delegated click handling within nav
   nav.addEventListener('click', (ev) => {
      const target = ev.target;

      // If hamburger clicked
      const isToggle = target.closest && target.closest('.navbar-toggle');
      if (isToggle) {
         ev.preventDefault();
         const expanded = toggle.getAttribute('aria-expanded') === 'true';
         toggle.setAttribute('aria-expanded', String(!expanded));
         menu.classList.toggle('open');
         if (!expanded) {
            const firstLink = menu.querySelector('a');
            if (firstLink) firstLink.focus();
         }
         return;
      }

      // If dropdown toggle clicked
      const ddToggle = target.closest && target.closest('[data-dropdown-toggle]');
      if (ddToggle) {
         ev.preventDefault();
         console.debug('delegated dropdown click', ddToggle.textContent && ddToggle.textContent.trim());
         const dropdown = ddToggle.closest('.dropdown');
         if (!dropdown) return;
         const isOpen = dropdown.classList.contains('open');
         if (isOpen) {
            dropdown.classList.remove('open');
            ddToggle.setAttribute('aria-expanded', 'false');
         } else {
            // close siblings
            const siblings = dropdown.parentElement.querySelectorAll('.dropdown.open');
            siblings.forEach((s) => s !== dropdown && s.classList.remove('open'));
            dropdown.classList.add('open');
            ddToggle.setAttribute('aria-expanded', 'true');
         }
         return;
      }

      // Allow normal link behaviour otherwise
   });

   // Keyboard handling
   nav.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
         // Close mobile menu and dropdowns
         if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
         }
         const openDropdowns = nav.querySelectorAll('.dropdown.open');
         openDropdowns.forEach((dd) => dd.classList.remove('open'));
      }

      // Space/Enter on focused dropdown toggles
      if (ev.key === ' ' || ev.key === 'Enter') {
         const focused = document.activeElement;
         if (focused && focused.matches && focused.matches('[data-dropdown-toggle]')) {
            ev.preventDefault();
            focused.click();
         }
      }
   });

   // Click outside to close
   document.addEventListener('click', (ev) => {
      if (!nav.contains(ev.target)) {
         if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
         }
         const openDropdowns = nav.querySelectorAll('.dropdown.open');
         openDropdowns.forEach((dd) => dd.classList.remove('open'));
      }
   });

   // Close on resize beyond mobile
   let resizeTimer = null;
   window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
         if (window.matchMedia('(min-width: 901px)').matches) {
            if (menu) menu.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
            const openDropdowns = nav.querySelectorAll('.dropdown.open');
            openDropdowns.forEach((dd) => dd.classList.remove('open'));
         }
      }, 150);
   });
}

/**
 * Toggle a mobile dropdown. Designed to be callable from inline onclick="toggleMobileDropdown(this)"
 * Accepts the anchor element inside the .dropdown element.
 */
function toggleMobileDropdown(anchor) {
   if (!anchor) return false;

   // Find the parent .dropdown element
   const dropdown = anchor.closest('.dropdown');
   if (!dropdown) return false;

   const isOpen = dropdown.classList.contains('open');
   // Toggle class
   if (isOpen) {
      dropdown.classList.remove('open');
      anchor.setAttribute('aria-expanded', 'false');
   } else {
      // Close other dropdowns at same level for single-open behaviour
      const siblings = dropdown.parentElement.querySelectorAll('.dropdown.open');
      siblings.forEach((sib) => sib !== dropdown && sib.classList.remove('open'));

      dropdown.classList.add('open');
      anchor.setAttribute('aria-expanded', 'true');
      // Move focus to first submenu link for a11y
      const firstSubLink = dropdown.querySelector('.dropdown-menu a');
      if (firstSubLink) firstSubLink.focus();
   }

   // Prevent default navigation when href="#"
   return false;
}


// Provide a safe loader for navigation include
async function loadNavigation() {
   const container = document.getElementById('navigation');
   if (!container) return Promise.resolve();

   const candidates = [
      'includes/nav.html',
      './includes/nav.html',
      '../includes/nav.html',
      '../../includes/nav.html',
      '/includes/nav.html'
   ];

   for (const path of candidates) {
      try {
         const resp = await fetch(path, { cache: 'no-store' });
         if (!resp.ok) continue;
         const html = await resp.text();
         container.innerHTML = html;
         console.debug('loadNavigation: injected from', path);
         return Promise.resolve();
      } catch (e) {
         // try next candidate
      }
   }

   return Promise.reject(new Error('Unable to load navigation from includes/nav.html'));
}

// Expose for inline handlers to avoid issues if script is loaded as a module in some setups
try {
   window.toggleMobileDropdown = toggleMobileDropdown;
} catch (e) {
   // ignore (non-browser environment)
}

/**
 * Ensure .mobile-collapsible <details> elements are open on desktop
 * and collapsed on mobile. This provides graceful behaviour if JS
 * is available; details remain open by default in the markup for
 * non-JS fallback.
 */
function setupMobileCollapsibles() {
   const els = Array.from(document.querySelectorAll('.mobile-collapsible'));
   if (!els.length) return;

   const apply = () => {
      const isDesktop = window.matchMedia('(min-width: 901px)').matches;
      els.forEach((d) => {
         try { d.open = Boolean(isDesktop); } catch (e) { /* ignore */ }
      });
   };

   apply();
   let debounce;
   window.addEventListener('resize', () => {
      clearTimeout(debounce);
      debounce = setTimeout(apply, 120);
   });
}

// ===============================
// Announcements: limit visible items and provide a 'show all' toggle
// ===============================
function setupAnnouncements() {
   const annList = document.querySelector('.ann-list');
   if (!annList) return;

   const toggle = document.getElementById('ann-toggle');
   if (!toggle) return;

   // Ensure initial aria state matches the visual state
   toggle.setAttribute('aria-expanded', 'false');

   toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      const isExpanded = annList.classList.toggle('show-all');
      toggle.setAttribute('aria-expanded', String(isExpanded));
      toggle.textContent = isExpanded ? 'Show fewer announcements' : 'Show all announcements';
   });
}