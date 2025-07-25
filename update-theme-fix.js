const fs = require('fs');
const path = require('path');

const htmlDir = __dirname;

const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

const themeInitRegex = /if \(savedTheme === 'dark' \|\| \(!savedTheme && prefersDark\)\) {\s*document\.documentElement\.classList\.add\('dark-mode'\);\s*}/;

files.forEach(file => {
  const filePath = path.join(htmlDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace the theme initialization with the fixed version
  content = content.replace(themeInitRegex,
    "if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {\n          document.documentElement.classList.add('dark-mode');\n        } else {\n          document.documentElement.classList.add('light-mode');\n        }"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
});
console.log('All HTML files have been updated with robust theme initialization.');
