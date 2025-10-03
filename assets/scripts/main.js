// ===============================
// Utility: Set the current year in the footer
// ===============================
function setFooterYear() {
   const yearSpan = document.getElementById("year");
   if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
   }
}

// ===============================
// Utility: Setup hamburger menu toggle for mobile nav
// ===============================
function setupNavToggle() {
   const navToggle = document.querySelector(".nav__toggle");
   const navMenu = document.getElementById("nav-menu");
   if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
         const expanded = navToggle.getAttribute("aria-expanded") === "true";
         navToggle.setAttribute("aria-expanded", String(!expanded));
         navMenu.classList.toggle("open", !expanded);
      });

      // Close the menu when a link is clicked
      document.querySelectorAll('.nav__menu a').forEach(link => {
         link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
         });
      });
   }
}

// ===============================
// Dropdown toggle for mobile nav
// ===============================
function setupDropdownToggles() {
   // Only enable click-to-toggle on mobile widths
   function enableDropdowns() {
      document.querySelectorAll('.nav__dropdown-trigger').forEach(trigger => {
         trigger.addEventListener('click', function (e) {
            // Only on mobile
            if (window.innerWidth > 900) return;
            e.preventDefault();
            const parent = trigger.closest('.nav__dropdown');
            // Close other open dropdowns
            document.querySelectorAll('.nav__dropdown.open').forEach(openDropdown => {
               if (openDropdown !== parent) openDropdown.classList.remove('open');
            });
            // Toggle this dropdown
            parent.classList.toggle('open');
            // Update aria-expanded
            trigger.setAttribute('aria-expanded', parent.classList.contains('open'));
         });
      });
      // Close dropdowns when clicking outside
      document.addEventListener('click', function (e) {
         if (
            window.innerWidth <= 900 &&
            !e.target.closest('.nav__dropdown')
         ) {
            document.querySelectorAll('.nav__dropdown.open').forEach(openDropdown => {
               openDropdown.classList.remove('open');
               const trigger = openDropdown.querySelector('.nav__dropdown-trigger');
               if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
         }
      });
   }
   enableDropdowns();
   // Re-enable on resize (for SPA-like behavior)
   window.addEventListener('resize', () => {
      enableDropdowns();
   });
}

// ===============================
// Load navbar HTML into the #navbar div
// ===============================
function loadNavbar() {
   // Determine correct path to nav.html based on current location
   let navPath = "includes/nav.html";
   if (window.location.pathname.startsWith("/pages/")) {
      navPath = "../includes/nav.html";
   }
   fetch(navPath)
      .then((res) => res.text())
      .then((html) => {
         document.getElementById("navbar").innerHTML = html;
         setupNavToggle(); // Setup hamburger menu after nav is loaded
         setupDropdownToggles(); // Dropdowns on mobile
      });
}

// ===============================
// DOMContentLoaded: Run on page load
// ===============================
document.addEventListener("DOMContentLoaded", function () {
   loadNavbar();
   setFooterYear();
});