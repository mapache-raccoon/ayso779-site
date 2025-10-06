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

   // Ultra-fast mobile dropdown handling
   dropdowns.forEach(dropdown => {
      const toggleLink = dropdown.querySelector('.dropdown-toggle');
      if (toggleLink) {
         toggleLink.addEventListener('click', function (e) {
            e.preventDefault();

            // Check mobile once and cache result for speed
            const isMobile = window.innerWidth <= 900;
            if (isMobile) {
               // Instant toggle with no delays
               dropdown.classList.toggle('open');
            }
         }, { passive: false }); // Optimize event listener
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
   if (!navContainer) {
      console.error('Navigation container not found!');
      return;
   }

   // Determine if we're in a subdirectory
   const isSubpage = window.location.pathname.includes('/pages/');
   const navPath = isSubpage ? '../includes/nav.html' : 'includes/nav.html';

   fetch(navPath)
      .then(response => {
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }
         return response.text();
      })
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
         // Fallback: insert navigation directly if fetch fails
         const fallbackNav = `
         <nav class="navbar">
           <div class="container">
             <a href="${isSubpage ? '../' : ''}index.html" class="navbar-brand">
               <img src="${isSubpage ? '../' : ''}assets/images/logos/ayso779crest.png" alt="AYSO 779" />
               <span>AYSO Region 779</span>
             </a>
             <button class="navbar-toggle" aria-label="Toggle navigation">
               <span></span>
               <span></span>
               <span></span>
             </button>
             <ul class="navbar-menu">
               <li class="navbar-close-container">
                 <button class="navbar-close" aria-label="Close navigation">×</button>
               </li>
               <li><a href="${isSubpage ? '../' : ''}index.html">Home</a></li>
               <li class="dropdown">
                 <a href="#" class="dropdown-toggle">About <span class="dropdown-arrow">▼</span></a>
                 <ul class="dropdown-menu">
                   <li><a href="${isSubpage ? '' : 'pages/'}about.html">About Region 779</a></li>
                   <li><a href="${isSubpage ? '' : 'pages/'}board.html">AYSO Board</a></li>
                 </ul>
               </li>
               <li class="dropdown">
                 <a href="#" class="dropdown-toggle">Programs <span class="dropdown-arrow">▼</span></a>
                 <ul class="dropdown-menu">
                   <li><a href="${isSubpage ? '' : 'pages/'}playground.html">Playground</a></li>
                   <li><a href="${isSubpage ? '' : 'pages/'}core.html">Core</a></li>
                   <li><a href="${isSubpage ? '' : 'pages/'}extra.html">EXTRA</a></li>
                   <li><a href="${isSubpage ? '' : 'pages/'}alliance.html">Alliance</a></li>
                   <li><a href="${isSubpage ? '' : 'pages/'}epic.html">EPIC</a></li>
                 </ul>
               </li>
               <li><a href="${isSubpage ? '' : 'pages/'}volunteer.html">Volunteers</a></li>
             </ul>
           </div>
         </nav>`;
         navContainer.innerHTML = fallbackNav;
         setupNavigation();
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