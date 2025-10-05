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
   const isMobile = () => window.innerWidth <= 900;
   // Remove all previous event listeners (for SPA-like reloads)
   document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
      dropdown.onmouseenter = null;
      dropdown.onmouseleave = null;
      dropdown.onclick = null;
      const trigger = dropdown.querySelector('.nav__dropdown-trigger');
      if (trigger) trigger.onclick = null;
   });

   document.querySelectorAll('.nav__dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav__dropdown-trigger');
      // Desktop: open on hover or click
      if (!isMobile()) {
         dropdown.onmouseenter = () => {
            dropdown.classList.add('open');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
         };
         dropdown.onmouseleave = () => {
            dropdown.classList.remove('open');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
         };
         if (trigger) {
            trigger.onclick = (e) => {
               e.preventDefault();
               // Toggle open on click
               const isOpen = dropdown.classList.contains('open');
               document.querySelectorAll('.nav__dropdown.open').forEach(d => {
                  d.classList.remove('open');
                  const t = d.querySelector('.nav__dropdown-trigger');
                  if (t) t.setAttribute('aria-expanded', 'false');
               });
               if (!isOpen) {
                  dropdown.classList.add('open');
                  trigger.setAttribute('aria-expanded', 'true');
               }
            };
         }
      } else {
         // Mobile: open on click anywhere in the dropdown parent (not just text)
         dropdown.onclick = (e) => {
            // Only trigger if clicking the dropdown or its trigger, not submenu links
            if (
               e.target.classList.contains('nav__dropdown-trigger') ||
               e.target === dropdown ||
               e.target.parentElement === dropdown
            ) {
               e.preventDefault();
               const isOpen = dropdown.classList.contains('open');
               document.querySelectorAll('.nav__dropdown.open').forEach(d => {
                  d.classList.remove('open');
                  const t = d.querySelector('.nav__dropdown-trigger');
                  if (t) t.setAttribute('aria-expanded', 'false');
               });
               if (!isOpen) {
                  dropdown.classList.add('open');
                  if (trigger) trigger.setAttribute('aria-expanded', 'true');
               }
            }
         };
      }
   });
   // Close dropdowns when clicking outside (but not when clicking inside submenu)
   document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__dropdown')) {
         document.querySelectorAll('.nav__dropdown.open').forEach(openDropdown => {
            openDropdown.classList.remove('open');
            const trigger = openDropdown.querySelector('.nav__dropdown-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
         });
      }
   });
   // Re-enable on resize
   window.addEventListener('resize', () => {
      setupDropdownToggles();
   }, { once: true });
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