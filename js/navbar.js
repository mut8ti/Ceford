/* Unified Navbar Behavior (responsive + dropdowns) */
(function() {
  const ready = (fn) => (document.readyState !== 'loading') ? fn() : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('mobile-menu-toggle');
    const themeToggle = document.getElementById('theme-toggle');

    // Active link highlight (if not manually set)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    nav && nav.querySelectorAll('a').forEach(a => {
      if (!a.classList.contains('active') && a.getAttribute('href') === currentPage) {
        a.classList.add('active');
      }
    });

    // Mobile menu toggle
    function closeMenu() {
      nav.classList.remove('mobile-menu-open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
    }
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('mobile-menu-open');
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav && nav.classList.contains('mobile-menu-open')) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
          closeMenu();
        }
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Enhanced dropdown support (structure: li.dropdown > a + ul.dropdown-menu )
    nav && nav.querySelectorAll('li.dropdown').forEach(drop => {
      const trigger = drop.querySelector('a');
      const menu = drop.querySelector('.dropdown-menu');
      if (!trigger || !menu) return;
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      function toggleDropdown(force) {
        const open = typeof force === 'boolean' ? force : !drop.classList.contains('open');
        drop.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', open);
      }

      trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) { // allow hover desktop, click mobile
            e.preventDefault();
            toggleDropdown();
        }
      });
      trigger.addEventListener('keydown', (e) => {
        if (['Enter',' '].includes(e.key)) { e.preventDefault(); toggleDropdown(); }
        if (e.key === 'Escape') { toggleDropdown(false); trigger.focus(); }
      });
      // Hover open for desktop
      drop.addEventListener('mouseenter', () => { if (window.innerWidth > 900) toggleDropdown(true); });
      drop.addEventListener('mouseleave', () => { if (window.innerWidth > 900) toggleDropdown(false); });
    });

    // Auto close menu on navigation
    nav && nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));

    // Responsive adjustment (close if resized wider)
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  });
})();
