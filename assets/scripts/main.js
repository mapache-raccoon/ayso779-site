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
 * Sets up simple navigation using event delegation - works even if elements don't exist yet
 */
function setupNavigation() {
   console.log('Setting up navigation with event delegation');
   
   // Use event delegation on document to catch all navigation clicks
   document.addEventListener('click', function(e) {
      console.log('Document click detected:', e.target.className);
      
      // Handle hamburger menu toggle
      if (e.target.closest('.navbar-toggle')) {
         console.log('Hamburger clicked');
         const menu = document.querySelector('.navbar-menu');
         if (menu) {
            menu.classList.toggle('open');
            console.log('Menu toggled, open:', menu.classList.contains('open'));
         }
         return;
      }
      
      // Handle close button
      if (e.target.closest('.navbar-close')) {
         console.log('Close button clicked');
         const menu = document.querySelector('.navbar-menu');
         if (menu) {
            menu.classList.remove('open');
            // Close all dropdowns too
            document.querySelectorAll('.dropdown').forEach(dropdown => {
               dropdown.classList.remove('open');
            });
         }
         return;
      }
      
      // Handle dropdown toggles
      if (e.target.closest('.dropdown-toggle')) {
         e.preventDefault();
         console.log('Dropdown toggle clicked');
         
         const dropdown = e.target.closest('.dropdown');
         if (dropdown) {
            const isOpen = dropdown.classList.contains('open');
            
            // Close all dropdowns first
            document.querySelectorAll('.dropdown').forEach(other => {
               other.classList.remove('open');
            });
            
            // If this one wasn't open, open it
            if (!isOpen) {
               dropdown.classList.add('open');
               console.log('Dropdown opened');
            } else {
               console.log('Dropdown closed');
            }
         }
         return;
      }
      
      // Handle regular nav links (close menu)
      if (e.target.closest('.navbar-menu a') && !e.target.closest('.dropdown-toggle')) {
         console.log('Regular nav link clicked');
         const menu = document.querySelector('.navbar-menu');
         if (menu) {
            menu.classList.remove('open');
         }
         return;
      }
      
      // Handle clicks outside navbar (close everything)
      if (!e.target.closest('.navbar')) {
         const menu = document.querySelector('.navbar-menu');
         if (menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            document.querySelectorAll('.dropdown').forEach(dropdown => {
               dropdown.classList.remove('open');
            });
         }
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
      });
}

// ===============================
// Global function for mobile dropdown toggle (fallback)
// ===============================
function toggleMobileDropdown(element) {
   console.log('toggleMobileDropdown called');
   const dropdown = element.closest('.dropdown');
   if (dropdown) {
      console.log('Dropdown found, toggling');

      // Close all other dropdowns
      document.querySelectorAll('.dropdown').forEach(other => {
         if (other !== dropdown) {
            other.classList.remove('open');
         }
      });

      // Toggle this dropdown
      dropdown.classList.toggle('open');
      console.log('Dropdown is now open:', dropdown.classList.contains('open'));
   }
   return false; // Prevent default link behavior
}

// ===============================
// DOMContentLoaded: Run on page load
// ===============================
/**
 * On DOMContentLoaded, set up navigation immediately and load navigation content.
 */
document.addEventListener("DOMContentLoaded", function () {
   // Set up navigation event delegation immediately
   setupNavigation();
   
   // Load navigation content
   loadNavigation();
   
   // Set footer year
   setFooterYear();
});