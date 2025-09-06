// Highlight active nav link if not set by HTML
const navLinks = document.querySelectorAll('nav a');
const currentPage = window.location.pathname.split('/').pop();
navLinks.forEach(link => {
  // If the link matches the current page, add 'active' class
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
  const mainNav = document.getElementById('main-nav');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  if (mainNav && mobileMenuToggle) {
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('mobile-menu-open');

      // Update aria attributes for accessibility
      const isOpen = mainNav.classList.contains('mobile-menu-open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen);
      mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    // Close mobile menu when clicking on nav links
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('mobile-menu-open')) {
          mainNav.classList.remove('mobile-menu-open');
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
          mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = mainNav.contains(event.target);
      const isClickOnToggle = mobileMenuToggle.contains(event.target);

      if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('mobile-menu-open')) {
        mainNav.classList.remove('mobile-menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
      }
    });

    // Close mobile menu on window resize if screen becomes larger
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && mainNav.classList.contains('mobile-menu-open')) {
        mainNav.classList.remove('mobile-menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
      }
    });
  }
});

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
