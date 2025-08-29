// Highlight active nav link if not set by HTML
const navLinks = document.querySelectorAll('nav a');
const currentPage = window.location.pathname.split('/').pop();
navLinks.forEach(link => {
  // If the link matches the current page, add 'active' class
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// // Contact form validation and message
// const contactForm = document.getElementById('contactForm');
// if (contactForm) {
//   // Listen for form submission
//   contactForm.addEventListener('submit', function(e) {
//     e.preventDefault(); // Prevent default form submission
//     // Get form field values
//     const name = document.getElementById('name').value.trim();
//     const email = document.getElementById('email').value.trim();
//     const message = document.getElementById('message').value.trim();
//     const formMessage = document.getElementById('formMessage');
//     // Check for empty fields
//     if (!name || !email || !message) {
//       formMessage.textContent = 'Please fill in all fields.';
//       formMessage.style.color = 'red';
//       return;
//     }
//     // Simple email validation
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) {
//       formMessage.textContent = 'Please enter a valid email address.';
//       formMessage.style.color = 'red';
//       return;
//     }
//     // Show success message and reset form
//     formMessage.textContent = 'Thank you for contacting us! We will get back to you soon.';
//     formMessage.style.color = 'green';
//     contactForm.reset();
//   });
// }

// Collapsible program boxes for programs.html
const collapsibles = document.querySelectorAll('.collapsible-title');
collapsibles.forEach(title => {
  title.addEventListener('click', function() {
    const parent = this.parentElement;
    // Close all other boxes
    document.querySelectorAll('.collapsible.active').forEach(box => {
      if (box !== parent) box.classList.remove('active');
    });
    // Toggle the clicked box
    parent.classList.toggle('active');
  });
});

// --- DARK/LIGHT MODE GLOBAL LOGIC ---
(function() {
  // Only show the toggle on homepage, but apply theme everywhere
  const themeToggle = document.getElementById('theme-toggle');
  function setTheme(mode) {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (document.body.classList.contains('dark-mode')) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    });
  }
  // On load, set theme from localStorage
  setTheme(localStorage.getItem('theme') || 'light');
})();

// Close mobile menu on nav link click (ensures menu collapses after navigation)
document.addEventListener('DOMContentLoaded', function() {
  const mainNav = document.getElementById('main-nav') || document.querySelector('header nav');
  if (!mainNav) return;
  const isMobile = () => window.matchMedia('(max-width: 850px)').matches;
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('mobile-menu-open') || isMobile()) {
        mainNav.classList.remove('mobile-menu-open');
      }
    });
  });
}); 