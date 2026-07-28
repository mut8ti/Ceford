// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs and sitemap generation.
  // CHANGE THIS if the site deploys to a different domain.
  site: 'https://www.ceforedconsultancy.com',

  // Emit /about.html rather than /about/index.html, so the existing
  // clean-URL rewrite rules in .htaccess keep working unchanged.
  build: { format: 'file' },
  trailingSlash: 'never',

  integrations: [
    // Icons are inlined as SVG at build time — no runtime JS, only used icons ship.
    icon({ iconDir: 'src/icons' }),
    sitemap(),
  ],

  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
