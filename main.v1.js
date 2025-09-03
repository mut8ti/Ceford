// Optimized main.js for CEFORED Institute - Performance focused
(function() {
  'use strict';
  
  // Highlight active nav link
const navLinks = document.querySelectorAll('nav a');
const currentPage = window.location.pathname.split('/').pop();
navLinks.forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

  // Collapsible program boxes
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

  // Dark/Light mode toggle
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
  
  // Set theme on load
  setTheme(localStorage.getItem('theme') || 'light');

  // Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mainNav = document.getElementById('main-nav');
  if (!mainNav) return;
    
  const isMobile = () => window.matchMedia('(max-width: 850px)').matches;
    
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mainNav.classList.contains('mobile-menu-open') || isMobile()) {
        mainNav.classList.remove('mobile-menu-open');
      }
    });
  });
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('mobile-menu-open');
      });
    }
  });
  
  // Performance monitoring
  window.addEventListener('load', function() {
    // Report LCP if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime + 'ms');
          }
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    // Report page load time
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
  });
})(); 