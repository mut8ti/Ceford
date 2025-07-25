const fs = require('fs');
const path = require('path');

const htmlFiles = [
  'about.html',
  'admission.html',
  'blog.html',
  'blog1AIcrisisResponse.html',
  'blog2DigitalHumanitarian.html',
  'blog4EmergingTrendsAI.html',
  'contact.html',
  'corporatetraining.html',
  'faqs.html',
  'index.html',
  'newsletter.html',
  'programs.html',
  'realm1-logistics.html',
  'realm2-business.html',
  'realm3-health.html',
  'realm4-project.html',
  'realm5-it.html',
  'realm6-humanitarian.html',
  'test-contact.html'
];

const antiFlickerScript = `<script>\n  // Immediately apply theme before any rendering happens\n  (function() {\n    try {\n      const savedTheme = localStorage.getItem('theme');\n      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;\n      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {\n        document.documentElement.classList.add('dark-mode');\n      } else {\n        document.documentElement.classList.add('light-mode');\n      }\n    } catch (e) {\n      document.documentElement.classList.add('light-mode');\n    }\n  })();\n<\/script>\n<style>\n  html { visibility: hidden; }\n  html.dark-mode, html.light-mode { visibility: visible; }\n<\/style>`;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove any old anti-flicker scripts/styles
  content = content.replace(/<script>[^<]*localStorage\.getItem\('theme'\)[\s\S]*?<\/script>\s*<style>[^<]*html \{ visibility: hidden; \}[^<]*<\/style>/, '');
  content = content.replace(/<script>[^<]*localStorage\.getItem\('theme'\)[\s\S]*?<\/script>/, '');
  content = content.replace(/<style>[^<]*html \{ visibility: hidden; \}[^<]*<\/style>/, '');

  // Insert anti-flicker script and style immediately after <head>
  content = content.replace(/<head>/i, `<head>\n  ${antiFlickerScript}\n`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Standardized:', file);
});
console.log('All HTML files now have standardized anti-flicker theme logic.');
