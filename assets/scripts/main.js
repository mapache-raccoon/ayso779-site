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
// Utility: Setup hamburger menu toggle for mobile nav
// ===============================
/**
 * Sets up the hamburger menu toggle for mobile navigation.
 * - Toggles the nav menu open/closed on click.
 * - Closes the menu when a nav link is clicked.
 */
function setupNavToggle() {
   const navToggle = document.querySelector(".nav__toggle");
   const navMenu = document.getElementById("nav-menu");
   if (navToggle && navMenu) {
      // Toggle menu open/close on hamburger click
      navToggle.addEventListener("click", function () {
         const expanded = navToggle.getAttribute("aria-expanded") === "true";
         navToggle.setAttribute("aria-expanded", String(!expanded));
         navMenu.classList.toggle("open", !expanded);
         if (!expanded) {
            // Focus first nav link for accessibility
            setTimeout(() => {
               const firstLink = navMenu.querySelector('a');
               if (firstLink) firstLink.focus();
            }, 200);
         }
      });

      // Close the menu when a link is clicked
      document.querySelectorAll('.nav__menu a').forEach(link => {
         link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
         });
      });

      // Close the menu when the close button is clicked
      const closeBtn = navMenu.querySelector('.nav__close');
      if (closeBtn) {
         closeBtn.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
         });
      }

      // Optional: close menu with Escape key
      document.addEventListener('keydown', (e) => {
         if (navMenu.classList.contains('open') && e.key === 'Escape') {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
         }
      });
   }
}

// ===============================
// Dropdown toggle for mobile nav
// ===============================
/**
 * Sets up dropdown toggles for navigation.
 * - Handles both desktop (hover/click) and mobile (click) behaviors.
 * - Ensures accessibility with keyboard support.
 */
function setupDropdownToggles() {
   const isMobile = () => window.innerWidth <= 900;
   // Remove all previous event listeners and handlers
   document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
      dropdown.onmouseenter = null;
      dropdown.onmouseleave = null;
      dropdown.onclick = null;
      const trigger = dropdown.querySelector('.nav__dropdown-trigger');
      if (trigger) {
         trigger.onclick = null;
         trigger.onkeydown = null;
         // Remove any previous mobile click handler
         trigger.removeEventListener('click', trigger._mobileClickHandler || (() => { }));
         delete trigger._mobileClickHandler;
      }
   });

   document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav__dropdown-trigger');
      if (!trigger) return;
      if (!isMobile()) {
         // Desktop: open on hover or click
         dropdown.onmouseenter = () => {
            dropdown.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
         };
         dropdown.onmouseleave = () => {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
         };
         trigger.onclick = (e) => {
            e.preventDefault();
            const isOpen = dropdown.classList.contains('open');
            // Only one open at a time
            document.querySelectorAll('.nav__dropdown.open').forEach(d => {
               if (d !== dropdown) {
                  d.classList.remove('open');
                  const t = d.querySelector('.nav__dropdown-trigger');
                  if (t) t.setAttribute('aria-expanded', 'false');
               }
            });
            if (!isOpen) {
               dropdown.classList.add('open');
               trigger.setAttribute('aria-expanded', 'true');
            }
         };
         trigger.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               trigger.click();
            }
         };
      } else {
         // Mobile: open/close only this submenu, allow multiple open
         const mobileClickHandler = function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Add small delay to prevent quick toggling
            setTimeout(() => {
               const isOpen = dropdown.classList.contains('open');
               if (isOpen) {
                  dropdown.classList.remove('open');
                  trigger.setAttribute('aria-expanded', 'false');
               } else {
                  dropdown.classList.add('open');
                  trigger.setAttribute('aria-expanded', 'true');
               }
            }, 10);
         };
         trigger._mobileClickHandler = mobileClickHandler;
         trigger.addEventListener('click', mobileClickHandler);
         trigger.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               trigger.click();
            }
         };
      }

      // Close submenu when a submenu link is clicked
      const submenuLinks = dropdown.querySelectorAll('.nav__submenu a');
      submenuLinks.forEach(link => {
         link.addEventListener('click', () => {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
         });
      });
   });

   // Close all open dropdowns if clicking outside any dropdown
   document.addEventListener('click', function (e) {
      // Only close dropdowns on outside clicks if not on mobile or if clicking outside the nav entirely
      if (!e.target.closest('.nav__dropdown') && !e.target.closest('.nav__submenu')) {
         // Add small delay for mobile to prevent immediate closing
         const delay = isMobile() ? 100 : 0;
         setTimeout(() => {
            document.querySelectorAll('.nav__dropdown.open').forEach(openDropdown => {
               openDropdown.classList.remove('open');
               const trigger = openDropdown.querySelector('.nav__dropdown-trigger');
               if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
         }, delay);
      }
   });

   // When the nav menu closes, close all open dropdowns (for mobile)
   const navMenu = document.getElementById('nav-menu');
   if (navMenu) {
      navMenu.addEventListener('transitionend', function () {
         if (!navMenu.classList.contains('open')) {
            document.querySelectorAll('.nav__dropdown.open').forEach(openDropdown => {
               openDropdown.classList.remove('open');
               const trigger = openDropdown.querySelector('.nav__dropdown-trigger');
               if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
         }
      });
   }

   // Re-enable on resize
   window.addEventListener('resize', () => {
      setupDropdownToggles();
   }, { once: true });
}

// ===============================
// Load navbar HTML into the #navbar div
// ===============================
/**
 * Loads the navbar HTML into the #navbar div and initializes nav behaviors.
 */
function loadNavbar() {
   console.log('loadNavbar called');
   // Determine correct path to nav.html based on current location
   let navPath = "includes/nav.html";
   let assetPath = "assets/";

   // Check if we're in the pages directory (more robust detection)
   const currentPath = window.location.pathname.toLowerCase();
   if (currentPath.includes("/pages/") || currentPath.endsWith(".html") && currentPath !== "/" && currentPath !== "/index.html") {
      navPath = "../includes/nav.html";
      assetPath = "../assets/";
   }

   console.log('Loading nav from:', navPath);

   fetch(navPath)
      .then((res) => {
         console.log('Nav fetch response:', res.status);
         return res.text();
      })
      .then((html) => {
         console.log('Nav HTML loaded, length:', html.length);
         // Fix asset paths in the navigation HTML
         html = html.replace(/src="assets\//g, `src="${assetPath}`);
         html = html.replace(/href="index\.html"/g, assetPath === "../assets/" ? 'href="../index.html"' : 'href="index.html"');

         const navbarElement = document.getElementById("navbar");
         if (navbarElement) {
            navbarElement.innerHTML = html;
            console.log('Nav HTML inserted');
            setupNavToggle(); // Setup hamburger menu after nav is loaded
            setupDropdownToggles(); // Dropdowns on mobile
         } else {
            console.error('navbar element not found!');
         }
      })
      .catch((error) => {
         console.error('Error loading navigation:', error);
      });
}// ===============================
// DOMContentLoaded: Run on page load
// ===============================
/**
 * On DOMContentLoaded, load the navbar and set the footer year.
 */
document.addEventListener("DOMContentLoaded", function () {
   console.log('DOM loaded, calling loadNavbar');
   loadNavbar();
   setFooterYear();
});

// Also try loading after a short delay as fallback
setTimeout(() => {
   console.log('Fallback navbar load');
   if (!document.getElementById('navbar').innerHTML.trim()) {
      loadNavbar();
   }
}, 500);