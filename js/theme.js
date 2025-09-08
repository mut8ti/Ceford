// Toggle theme function
function toggleTheme() {
  const html = document.documentElement;
  const body = document.body;
  const isDark = html.classList.toggle('dark-mode');
  body.classList.toggle('dark-mode', isDark);
  if (isDark) {
    html.classList.remove('light-mode');
    body.classList.remove('light-mode');
  } else {
    html.classList.add('light-mode');
    body.classList.add('light-mode');
  }
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

// Update theme icon based on current theme
function updateThemeIcon(isDark) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
}

// Expose theme initialization globally for SPA navigation
window.initTheme = function() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const html = document.documentElement;
  const body = document.body;
  html.classList.remove('dark-mode', 'light-mode');
  body.classList.remove('dark-mode', 'light-mode');
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    html.classList.add('dark-mode');
    body.classList.add('dark-mode');
  } else {
    html.classList.add('light-mode');
    body.classList.add('light-mode');
  }
  // Initialize theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.removeEventListener('click', toggleTheme); // Prevent duplicate listeners
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeIcon(html.classList.contains('dark-mode'));
  }
};
// Call on initial load
window.initTheme();