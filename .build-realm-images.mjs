/* Derives every shipped realm image from the originals in image-sources/.
   Re-runnable: drop a new original in and run `node .build-realm-images.mjs`.

   Three sizes because three jobs:
     -hero  16:9, full-bleed background on the realm page
            1200x800 3:2, the index preview panel on desktop
     -sm    600x400 3:2, the index row thumbnail on mobile        */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'image-sources/realms';
const OUT = 'public/images/realms';
fs.mkdirSync(OUT, { recursive: true });

const SIZES = [
  ['-hero', 1920, 1080, 70],
  ['',      1200,  800, 78],
  ['-sm',    600,  400, 74],
];

const slugs = ['logistics', 'business', 'health', 'project-management', 'it-digital', 'humanitarian'];

/* Real emitted dimensions, written out for the templates to read. Sources are
   never upscaled, so a small original produces a smaller file than the target —
   and a srcset descriptor that claimed otherwise would make the browser pick
   the wrong candidate. */
const manifest = {};

for (const slug of slugs) {
  const src = fs.readdirSync(SRC).find((f) => f.replace(/\.[^.]+$/, '') === slug);
  if (!src) { console.log(`${slug.padEnd(20)} NO SOURCE`); continue; }

  const srcPath = path.join(SRC, src);
  const meta = await sharp(srcPath).metadata();
  const line = [];

  for (const [suffix, w, h, q] of SIZES) {
    /* A portrait source cropped to landscape loses most of its height, so let
       sharp pick the region with the most detail rather than blindly centring
       and risking a crop through someone's chin. Landscape sources are already
       close to the target ratio, where centre is the safer choice. */
    const srcRatio = meta.width / meta.height;
    const position = srcRatio < w / h ? sharp.strategy.attention : 'centre';

    // Never upscale past the source: a soft 1920px hero is worse than a sharp
    // 1400px one stretched by the browser.
    const cap = Math.min(w, meta.width);
    const outW = cap;
    const outH = Math.round(cap * (h / w));

    const file = path.join(OUT, `${slug}${suffix}.webp`);
    await sharp(srcPath).rotate().resize(outW, outH, { fit: 'cover', position })
      .webp({ quality: q, effort: 6 }).toFile(file);
    (manifest[slug] ??= {})[suffix || 'card'] = [outW, outH];
    line.push(`${outW}x${outH} ${Math.round(fs.statSync(file).size / 1024)}K`);
  }
  console.log(`${slug.padEnd(20)} src ${meta.width}x${meta.height} ${String(meta.format).padEnd(4)} -> ${line.join('  |  ')}`);
}

fs.writeFileSync('src/data/realm-images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('\nwrote src/data/realm-images.json');
