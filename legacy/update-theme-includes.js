const fs = require('fs');
const path = require('path');

// Directory containing HTML files
const htmlDir = __dirname;

// Get all HTML files
try {
  const files = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));
  
  files.forEach(file => {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Add theme initialization script to head
    const themeInitScript = `
  <!-- Theme initialization - prevents FOUC (Flash of Unstyled Content) -->
  <script>
    // Immediately apply theme before any rendering happens
    (function() {
      try {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Apply dark mode if explicitly set or if system preference is dark and no preference is saved
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
          document.documentElement.classList.add('dark-mode');
        }
      } catch (e) {
        console.error('Error initializing theme:', e);
      }
    })();
  </script>`;

    // 2. Update or add theme initialization
    if (content.includes('localStorage.getItem(\'theme\')')) {
      // Replace existing theme initialization
      content = content.replace(
        /<script>[\s\S]*?localStorage\.getItem\(['"]theme['"]\).*?<\/script>/s,
        themeInitScript.trim()
      );
    } else {
      // Add theme initialization after <head>
      content = content.replace(
        /<head>([\s\S]*?)(?=<\/head>|$)/,
        `<head>$1${themeInitScript}`
      );
    }

    // 3. Update script includes
    // Remove theme-loader.js if it exists
    content = content.replace(
      /<script[^>]*src=["']theme-loader\.js["'][^>]*><\/script>\s*/g,
      ''
    );

    // Add theme.js if not already included
    if (!content.includes('src="theme.js"')) {
      const scriptTag = '  <script src="theme.js" defer></script>';
      if (content.includes('</body>')) {
        content = content.replace('</body>', `  ${scriptTag}\n</body>`);
      } else if (content.includes('</main>')) {
        content = content.replace('</main>', `  ${scriptTag}\n</main>`);
      } else {
        content += `\n${scriptTag}\n`;
      }
    }

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
  });
  
  console.log('All HTML files have been updated successfully!');
} catch (error) {
  console.error('Error updating HTML files:', error);
}
