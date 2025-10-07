// ===============================
// Utility: Set the current year in the footer
// ===============================
/**
 * Sets the current year in the footer element with id="year".
 */
function setFooterYear() {
   const yearSpan = document.getElementById("year");
   if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
   }
}





// ===============================
// DOMContentLoaded: Run on page load
// ===============================
/**
 * On DOMContentLoaded, set up navigation immediately and load navigation content.
 */
document.addEventListener("DOMContentLoaded", function () {
   // Load navigation content first, then initialize behaviours that expect DOM nodes
   loadNavigation()
      .catch((err) => {
         // If nav fails to load, still attempt to initialize (no-op inside will return early)
         console.warn('loadNavigation failed:', err);
      })
      .finally(() => {
         setupNavigation();
         setFooterYear();
      });
});


// ===============================
// Navigation: Mobile behaviour
// ===============================
/**
 * Initialize navigation interactivity: toggle button, dropdowns, keyboard support.
 */
function setupNavigation() {
   const nav = document.querySelector('.navbar');
   console.debug('setupNavigation: found nav?', !!nav);
   if (!nav) return;

   const toggle = nav.querySelector('.navbar-toggle');
   const menu = nav.querySelector('.navbar-menu');

   // Toggle main menu on mobile
   if (toggle && menu) {
      // Prevent tap-through on touch devices by intercepting pointerdown
      toggle.addEventListener('pointerdown', (ev) => {
         try {
            if (ev.pointerType === 'touch') {
               ev.preventDefault();
            }
         } catch (e) { }
      });

      toggle.addEventListener('click', () => {
         console.debug('navbar-toggle clicked');
         const expanded = toggle.getAttribute('aria-expanded') === 'true';
         toggle.setAttribute('aria-expanded', String(!expanded));
         menu.classList.toggle('open');
         // When opening, move focus to first link for keyboard users
         if (!expanded) {
            const firstLink = menu.querySelector('a');
            if (firstLink) firstLink.focus();
         }
      });
   }

   // Wire up dropdown toggles
   const dropdownToggles = nav.querySelectorAll('.dropdown-toggle');
   dropdownToggles.forEach((el) => {
      // Ensure ARIA defaults
      el.setAttribute('aria-expanded', 'false');

      // Ensure clicking the toggle uses our JS (prevents default navigation)
      // Prevent tap-through on touch devices
      el.addEventListener('pointerdown', (ev) => {
         try {
            if (ev.pointerType === 'touch') {
               // Prevent the browser from following any link under the toggle on the same tap
               ev.preventDefault();
            }
         } catch (e) { }
      });

      el.addEventListener('click', (ev) => {
         console.debug('dropdown-toggle clicked:', el.textContent && el.textContent.trim());
         ev.preventDefault();
         toggleMobileDropdown(el);
      });

      // Click handler already present in markup calling toggleMobileDropdown; keep for compatibility
      el.addEventListener('keydown', (ev) => {
         // Space or Enter should toggle
         if (ev.key === ' ' || ev.key === 'Enter') {
            ev.preventDefault();
            toggleMobileDropdown(el);
         }
         // Arrow keys: allow small navigation inside menu when open
      });
   });

   // Close menus when clicking outside or pressing Escape
   document.addEventListener('click', (ev) => {
      const target = ev.target;
      // debug: where did the click happen
      // console.debug('document click, target:', target && (target.className || target.tagName));
      // If click is inside nav, ignore
      if (nav.contains(target)) return;

      // Close mobile menu
      if (menu && menu.classList.contains('open')) {
         menu.classList.remove('open');
         if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      // Close any open dropdowns
      const openDropdowns = nav.querySelectorAll('.dropdown.open');
      openDropdowns.forEach((dd) => dd.classList.remove('open'));
   });

   document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
         console.debug('Escape pressed - closing menus');
         // Close everything
         if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
         }
         const openDropdowns = nav.querySelectorAll('.dropdown.open');
         openDropdowns.forEach((dd) => dd.classList.remove('open'));
      }
   });

   // Close dropdowns on resize above mobile breakpoint
   let resizeTimer = null;
   window.addEventListener('resize', () => {
      // Debounce
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
         if (window.matchMedia('(min-width: 901px)').matches) {
            // Ensure mobile-only classes removed
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


// Provide a safe stub for loadNavigation if it's intended to do dynamic loading
async function loadNavigation() {
   // Populate #navigation with the shared include. Try several relative paths to
   // support pages at different nesting levels (/, /pages/, etc.).
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