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
// Simple Navigation Toggle
// ===============================
/**
 * Sets up simple navigation toggle for mobile.
 */
function setupNavigation() {
   const toggle = document.querySelector('.navbar-toggle');
   const menu = document.querySelector('.navbar-menu');
   const closeBtn = document.querySelector('.navbar-close');
   const dropdowns = document.querySelectorAll('.dropdown');

   // Mobile menu toggle
   if (toggle && menu) {
      toggle.addEventListener('click', function () {
         menu.classList.toggle('open');
      });

      // Close button functionality
      if (closeBtn) {
         closeBtn.addEventListener('click', function () {
            menu.classList.remove('open');
            // Close all dropdowns when closing menu
            dropdowns.forEach(dropdown => {
               dropdown.classList.remove('open');
            });
         });
      }

      // Close menu when clicking a regular link (not dropdown toggle)
      menu.addEventListener('click', function (e) {
         if (e.target.tagName === 'A' && !e.target.classList.contains('dropdown-toggle')) {
            menu.classList.remove('open');
         }
      });
   }

   // Mobile dropdown toggles - improved for better stability
   dropdowns.forEach(dropdown => {
      const toggleLink = dropdown.querySelector('.dropdown-toggle');
      if (toggleLink) {
         toggleLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (window.innerWidth <= 900) {
               // Close other open dropdowns
               dropdowns.forEach(otherDropdown => {
                  if (otherDropdown !== dropdown) {
                     otherDropdown.classList.remove('open');
                  }
               });

               // Toggle current dropdown
               dropdown.classList.toggle('open');
            }
         });
      }
   });

   // Close mobile menu when clicking outside
   document.addEventListener('click', function (e) {
      if (!e.target.closest('.navbar') && menu) {
         menu.classList.remove('open');
         dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
         });
      }
   });
}

// ===============================
// Load Navigation
// ===============================
/**
 * Loads navigation HTML and fixes paths for different directory levels.
 */
function loadNavigation() {
   const navContainer = document.getElementById('navigation');
   if (!navContainer) return;

   // Determine if we're in a subdirectory
   const isSubpage = window.location.pathname.includes('/pages/');
   const navPath = isSubpage ? '../includes/nav.html' : 'includes/nav.html';

   fetch(navPath)
      .then(response => response.text())
      .then(html => {
         // Fix asset paths for subpages
         if (isSubpage) {
            html = html.replace(/src="assets\//g, 'src="../assets/');
            html = html.replace(/href="index\.html"/g, 'href="../index.html"');
            html = html.replace(/href="pages\//g, 'href="');
         }

         navContainer.innerHTML = html;
         setupNavigation(); // Initialize navigation after loading
      })
      .catch(error => {
         console.error('Error loading navigation:', error);
      });
}

// ===============================
// DOMContentLoaded: Run on page load
// ===============================
/**
 * On DOMContentLoaded, load navigation and set the footer year.
 */
document.addEventListener("DOMContentLoaded", function () {
   loadNavigation();
   setFooterYear();
});