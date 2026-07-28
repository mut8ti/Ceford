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

const transitionScript = `<script>\nwindow.addEventListener('DOMContentLoaded', function() {\n  document.documentElement.classList.add('transitions-enabled');\n});\n<\/script>`;

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove any old transition-enabling script
  content = content.replace(/<script>[^<]*transitions-enabled[^<]*<\/script>/g, '');

  // Insert transition script before </body>
  content = content.replace(/<\/body>/i, `${transitionScript}\n</body>`);

  // Insert the transitions-enabled CSS selector in the first <style> block
  content = content.replace(/(<style[^>]*>)/i, `$1\nhtml.transitions-enabled * { transition: background 0.3s, color 0.3s, border-color 0.3s; }\n`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Transition script and CSS added to:', file);
});
console.log('All HTML files now have smooth theme transitions only after load.');
