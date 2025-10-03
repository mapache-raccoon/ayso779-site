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
   }
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
      });
}

// ===============================
// DOMContentLoaded: Run on page load
// ===============================
document.addEventListener("DOMContentLoaded", function () {
   loadNavbar();
   setFooterYear();
});