// Renders the release banners for a major release into docs/public/images, in
// the Thread Profiler style of the docs site: four formats (banner, og,
// square, portrait), each at 1x and 2x, as palette PNGs.
//
// Usage: npm run banners -- <release>   e.g. npm run banners -- 1.0
// The content is in scripts/banners/<release>.mjs. Rendering uses a local
// Chrome or Chromium (CHROME=/path/to/chrome to choose one), the Geist fonts
// installed through Fontsource, so nothing is fetched from the network, and
// Python with Pillow to make the PNGs small.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = join(ROOT, 'docs/public/images');
const CHROME = process.env.CHROME ?? 'google-chrome';
const FORMATS = [
  { suffix: '', width: 1200, height: 600, layout: 'wide' },
  { suffix: '-og', width: 1200, height: 630, layout: 'wide' },
  { suffix: '-square', width: 1080, height: 1080, layout: 'tall' },
  { suffix: '-portrait', width: 1080, height: 1350, layout: 'tall' }
];
const SCALES = [1, 2];
const release = process.argv[2];

if (!release) {
  console.error('Usage: npm run banners -- <release>, e.g. 1.0');
  process.exit(1);
}

const { default: content } = await import(
  pathToFileURL(join(ROOT, `scripts/banners/${release}.mjs`)).href
);
const escape = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const font = (file) =>
  pathToFileURL(join(ROOT, 'node_modules/@fontsource', file)).href;
const mark = readFileSync(
  join(ROOT, 'docs/public/logo/mark-dark.svg'),
  'utf8'
).replace('<svg ', '<svg class="mark" ');
const title = content.title
  .map((part) =>
    typeof part === 'string'
      ? escape(part)
      : `<span class="accent">${escape(part.accent)}</span>`
  )
  .join('<br>');
/** A panel's body: rows of text with a chip or a value, or profiler lanes. */
const panelBody = (panel) =>
  panel.lanes
    ? panel.lanes
        .map(
          (lane) =>
            `<div class="lane"><span>${escape(lane.name)}</span><div class="track">${lane.slices
              .map(
                (slice) =>
                  `<i class="${slice.blocking ? 'blocking' : ''}" style="left:${slice.at}%;width:${slice.width}%"></i>`
              )
              .join('')}</div></div>`
        )
        .join('')
    : panel.rows
        .map(
          (row) =>
            `<div class="row"><span>${escape(row.text)}</span>${
              row.chip
                ? `<i class="chip">${escape(row.chip)}</i>`
                : row.value
                  ? `<em>${escape(row.value)}</em>`
                  : ''
            }</div>`
        )
        .join('');
const panels = content.panels
  .map(
    (panel, index) => `
    <section class="panel panel-${index}">
      <header><span>${escape(panel.label)}</span><b>${escape(panel.status)}</b></header>
      ${panelBody(panel)}
    </section>`
  )
  .join('');
const page = (layout, format) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Geist; font-weight: 400; src: url(${font('geist/files/geist-latin-400-normal.woff2')}); }
@font-face { font-family: Geist; font-weight: 600; src: url(${font('geist/files/geist-latin-600-normal.woff2')}); }
@font-face { font-family: GeistMono; font-weight: 400; src: url(${font('geist-mono/files/geist-mono-latin-400-normal.woff2')}); }
:root { --bg: #0f1013; --bg-2: #16181d; --bg-3: #1d2027; --line: #2a2e37; --tick: #353a45;
  --text: #e8eaee; --muted: #a3a9b5; --accent: #6aa8ff; --blocking: #ff9a3d; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { position: relative; overflow: hidden; color: var(--text); font-family: Geist, sans-serif;
  background: repeating-linear-gradient(var(--bg) 0 69px, var(--line) 69px 70px); }
.pill { position: absolute; display: inline-flex; align-items: center; gap: 14px;
  padding: 12px 22px 12px 14px; border: 1px solid var(--line); border-radius: 999px;
  background: var(--bg-2); font: 400 17px GeistMono, monospace; letter-spacing: 0.06em; color: var(--muted); }
.pill .mark { width: 30px; height: 30px; }
.kicker { position: absolute; color: var(--blocking); font: 400 19px GeistMono, monospace; letter-spacing: 0.04em; }
h1 { position: absolute; font-weight: 600; line-height: 1.02; letter-spacing: -0.035em; }
.accent { color: var(--accent); }
p { position: absolute; color: var(--muted); line-height: 1.5; }
.panel { position: absolute; padding: 22px 26px 12px; border: 1px solid var(--line); border-radius: 12px;
  background: var(--bg-2); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45); }
.panel header { display: flex; justify-content: space-between; padding-bottom: 14px;
  border-bottom: 1px solid var(--line); font: 400 15px GeistMono, monospace; letter-spacing: 0.04em; color: var(--muted); }
.panel header b { color: var(--accent); font-weight: 400; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 18px;
  padding: 14px 0; font-size: 22px; color: var(--text); }
.row + .row { border-top: 1px solid var(--line); }
.row em { font: 400 17px GeistMono, monospace; font-style: normal; color: var(--text); }
.chip { padding: 5px 12px; border-radius: 6px; background: var(--accent); color: var(--bg);
  font: 400 16px GeistMono, monospace; font-style: normal; }
.lane { display: flex; align-items: center; gap: 16px; padding: 12px 0; }
.lane + .lane { border-top: 1px solid var(--line); }
.lane span { width: 74px; font: 400 15px GeistMono, monospace; color: var(--muted); }
.track { position: relative; flex: 1; height: 22px; border-radius: 5px; background: var(--bg-3); }
.track i { position: absolute; top: 0; bottom: 0; border-radius: 5px; background: var(--accent); }
.track i.blocking { background: var(--blocking); }
/* wide: text left, panels right */
.wide .pill { top: 60px; left: 72px; }
.wide .kicker { top: 170px; left: 72px; }
.wide h1 { top: 206px; left: 72px; width: 580px; font-size: 66px; }
.wide p { bottom: 64px; left: 72px; width: 560px; font-size: 20px; }
.wide .panel { width: 440px; }
.wide .panel-0 { top: 72px; right: 72px; }
.wide .panel-1 { top: 300px; right: 72px; }
.og .wide .panel-1 { top: 316px; }
/* tall: text on top, panels below */
.tall .pill { top: 80px; left: 72px; }
.tall .kicker { top: 196px; left: 72px; font-size: 22px; }
.tall h1 { top: 244px; left: 72px; width: 936px; font-size: 100px; }
.tall p { top: 500px; left: 72px; width: 900px; font-size: 27px; }
.tall .panel { width: 690px; left: 72px; zoom: 1.35; }
.tall .panel-0 { top: 520px; }
.tall .panel-1 { top: 720px; }
.square .tall h1 { font-size: 92px; }
.square .tall p { top: 470px; font-size: 25px; }
.square .tall .panel { width: 452px; zoom: 1; }
.square .tall .panel-0 { top: 700px; left: 72px; }
.square .tall .panel-1 { top: 700px; left: 556px; }
</style></head>
<body class="${format}"><main class="${layout}">
  <div class="pill">${mark}${escape(content.pill)}</div>
  <div class="kicker">${escape(content.kicker)}</div>
  <h1>${title}</h1>
  <p>${escape(content.body)}</p>
  ${panels}
</main></body></html>`;
const dir = mkdtempSync(join(tmpdir(), 'banners-'));
const written = [];

try {
  for (const { suffix, width, height, layout } of FORMATS) {
    const file = join(dir, `${suffix || 'banner'}.html`);

    writeFileSync(file, page(layout, suffix.slice(1)));

    for (const scale of SCALES) {
      const name = `hybrid-compute-${content.slug}${suffix}${scale === 2 ? '@2x' : ''}.png`;

      execFileSync(
        CHROME,
        [
          '--headless=new',
          '--disable-gpu',
          '--hide-scrollbars',
          '--allow-file-access-from-files',
          '--virtual-time-budget=3000',
          `--force-device-scale-factor=${scale}`,
          `--window-size=${width},${height}`,
          `--screenshot=${join(OUT, name)}`,
          pathToFileURL(file).href
        ],
        { stdio: 'ignore' }
      );
      written.push(join(OUT, name));
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// A palette of up to 256 colours keeps flat artwork sharp and small
execFileSync(
  'python3',
  [
    '-c',
    `import sys
from PIL import Image
for path in sys.argv[1:]:
    Image.open(path).convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT).save(path, optimize=True)`,
    ...written
  ],
  { stdio: 'inherit' }
);

for (const file of written) console.log(`Wrote ${file.slice(ROOT.length)}`);
