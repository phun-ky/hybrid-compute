// Renders the docs site's diagrams to PNGs for the README, light and dark, into
// docs/public/diagrams. The source is the SVG in each component in
// docs/.vitepress/theme/components/diagrams, styled by the site's tokens and
// arch-* rules in style.css, with the Geist fonts from Fontsource, so the
// images match the site. PNG rather than SVG: GitHub serves README SVGs as
// images, which can't load the fonts the boxes are sized for.
//
// Run it after changing a diagram, its styles or the tokens:
//   npm run render:diagrams
// Needs a local Chrome or Chromium (CHROME=/path/to/chrome to choose one) and
// Python with Pillow, which turns each PNG into a palette image to keep it
// small.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const THEME = join(ROOT, 'docs/.vitepress/theme');
const OUT = join(ROOT, 'docs/public/diagrams');
const CHROME = process.env.CHROME ?? 'google-chrome';
const DIAGRAMS = {
  packages: 'PackagesDiagram.vue',
  dispatch: 'DispatchDiagram.vue',
  worker: 'WorkerDiagram.vue',
  remote: 'RemoteDiagram.vue'
};
// The figure's padding and border around the SVG, from .vp-doc figure.arch
const FRAME = 16 + 1;
const css = readFileSync(join(THEME, 'style.css'), 'utf8');
const slice = (from, to) => {
  const start = css.indexOf(from);
  const end = to ? css.indexOf(to, start) : css.length;

  if (start < 0 || end < 0) throw new Error(`style.css: "${from}" not found`);

  return css.slice(start, end);
};
// The light and dark tokens, and the diagram rules at the end of the file
const styles =
  slice('/* Tokens: light */', '/* Map the tokens onto VitePress */') +
  slice('/* ---------- Diagrams');
const font = (file) =>
  pathToFileURL(join(ROOT, 'node_modules/@fontsource', file)).href;
const page = (svg, dark) => `<!doctype html>
<html class="${dark ? 'dark' : ''}"><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; font-weight: 400; src: url(${font('geist/files/geist-latin-400-normal.woff2')}); }
@font-face { font-family: Geist; font-weight: 600; src: url(${font('geist/files/geist-latin-600-normal.woff2')}); }
@font-face { font-family: 'Geist Mono'; font-weight: 400; src: url(${font('geist-mono/files/geist-mono-latin-400-normal.woff2')}); }
${styles}
html, body { margin: 0; background: transparent; }
.vp-doc figure.arch { margin: 0; }
</style></head>
<body><div class="vp-doc"><figure class="arch">${svg}</figure></div></body></html>`;
const dir = mkdtempSync(join(tmpdir(), 'diagrams-'));
const written = [];

mkdirSync(OUT, { recursive: true });

try {
  for (const [name, component] of Object.entries(DIAGRAMS)) {
    const source = readFileSync(
      join(THEME, 'components/diagrams', component),
      'utf8'
    );
    const svg = source.match(/<svg[\s\S]*<\/svg>/)?.[0];
    const [, width, height] =
      svg?.match(/viewBox="0 0 (\d+) (\d+)"/)?.map(Number) ?? [];

    if (!width) throw new Error(`${component}: no <svg> with a viewBox`);

    for (const dark of [false, true]) {
      const html = join(dir, `${name}-${dark ? 'dark' : 'light'}.html`);
      const png = join(OUT, `${name}-${dark ? 'dark' : 'light'}.png`);

      writeFileSync(html, page(svg, dark));
      execFileSync(
        CHROME,
        [
          '--headless=new',
          '--disable-gpu',
          '--hide-scrollbars',
          '--allow-file-access-from-files',
          '--virtual-time-budget=3000',
          // Transparent outside the figure's rounded corners
          '--default-background-color=00000000',
          '--force-device-scale-factor=2',
          `--window-size=${width + 2 * FRAME},${height + 2 * FRAME}`,
          `--screenshot=${png}`,
          pathToFileURL(html).href
        ],
        { stdio: 'ignore' }
      );
      written.push(png);
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// A palette of up to 256 colours keeps flat artwork sharp and small; RGBA
// keeps the transparent corners
execFileSync(
  'python3',
  [
    '-c',
    `import sys
from PIL import Image
for path in sys.argv[1:]:
    Image.open(path).convert('RGBA').quantize(256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)`,
    ...written
  ],
  { stdio: 'inherit' }
);

for (const file of written) console.log(`Wrote ${file.slice(ROOT.length)}`);
