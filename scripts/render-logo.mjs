// Render the logo's PNGs from the SVG marks in docs/public/logo: the README
// banners, the social cards and the PNG icons. They're drawn as HTML with the
// site's Geist font in headless Chrome, so the text matches the docs.
// Needs google-chrome (or CHROME=/path/to/chrome) and Python with Pillow,
// which turns each PNG into a palette image to keep it small.
// Usage: node scripts/render-logo.mjs
import { execFileSync, spawn } from 'node:child_process';
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOGO = join(ROOT, 'docs', 'public', 'logo');
const FONTS = join(ROOT, 'node_modules', '@fontsource');
const work = mkdtempSync(join(tmpdir(), 'hybrid-compute-logo-'));

for (const [from, to] of [
  ['geist/files/geist-latin-400-normal.woff2', 'geist-400.woff2'],
  ['geist/files/geist-latin-600-normal.woff2', 'geist-600.woff2'],
  ['geist-mono/files/geist-mono-latin-400-normal.woff2', 'geist-mono.woff2']
]) {
  copyFileSync(join(FONTS, from), join(work, to));
}

/** The inner shapes of an SVG file, to inline in a page. */
const svg = (file) => readFileSync(join(LOGO, file), 'utf8');
const markDark = svg('mark-dark.svg');
const markLight = svg('mark.svg');
const favicon = svg('favicon.svg');
const THEMES = {
  dark: {
    bg: '#0f1013',
    line: '#2a2e37',
    text: '#e8eaee',
    muted: '#a3a9b5',
    mark: markDark
  },
  light: {
    bg: '#fafafa',
    line: '#dfe2e8',
    text: '#15171c',
    muted: '#4d5360',
    mark: markLight
  }
};
const TAGLINE =
  'Run each task where it fits: locally, in a worker, or remotely.';
const page = (body, { bg }) => `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family: Geist; src: url(geist-400.woff2); font-weight: 400; }
  @font-face { font-family: Geist; src: url(geist-600.woff2); font-weight: 600; }
  @font-face { font-family: Geist Mono; src: url(geist-mono.woff2); }
  html, body { margin: 0; background: ${bg}; font-family: Geist; overflow: hidden; }
  .lanes { position: absolute; inset: 0; }
  .lanes i { position: absolute; left: 0; right: 0; height: 1px; }
  .card { position: relative; display: flex; align-items: center; height: 100%; }
  .card svg { flex: none; }
  h1 { margin: 0; font-weight: 600; letter-spacing: -0.03em; line-height: 1; }
  p { margin: 0; }
</style>${body}`;
/** Faint horizontal lines behind the text, like the profiler's lanes. */
const lanes = (count, gap, color) =>
  `<div class="lanes">${Array.from(
    { length: count },
    (_, i) =>
      `<i style="top:${gap * (i + 1)}px;background:${color};opacity:.6"></i>`
  ).join('')}</div>`;
const banner = (theme) =>
  page(
    `<div style="position:relative;width:1280px;height:320px">
      ${lanes(4, 64, theme.line)}
      <div class="card" style="padding:0 96px;gap:40px">
        <div style="width:144px;height:144px">${theme.mark.replace('<svg ', '<svg width="144" height="144" ')}</div>
        <div>
          <h1 style="font-size:76px;color:${theme.text}">Hybrid Compute</h1>
          <p style="margin-top:18px;font-size:27px;color:${theme.muted}">${TAGLINE}</p>
        </div>
      </div>
    </div>`,
    theme
  );
const social = (theme) =>
  page(
    `<div style="position:relative;width:1200px;height:630px">
      ${lanes(8, 70, theme.line)}
      <div style="position:absolute;left:96px;top:96px;width:176px;height:176px">${theme.mark.replace('<svg ', '<svg width="176" height="176" ')}</div>
      <div style="position:absolute;left:96px;bottom:96px">
        <h1 style="font-size:84px;color:${theme.text}">Hybrid Compute</h1>
        <p style="margin-top:22px;font-size:32px;color:${theme.muted}">${TAGLINE}</p>
        <p style="margin-top:26px;font-family:'Geist Mono';font-size:24px;color:${theme.muted}">phun-ky.net/hybrid-compute</p>
      </div>
    </div>`,
    theme
  );
const icon = (size, rounded) =>
  page(
    `<div style="width:${size}px;height:${size}px">${(rounded
      ? favicon
      : favicon.replace('rx="7"', 'rx="0"')
    ).replace('<svg ', `<svg width="${size}" height="${size}" `)}</div>`,
    { bg: 'transparent' }
  );
const OUTPUTS = [
  {
    file: 'banner-dark.png',
    html: banner(THEMES.dark),
    width: 1280,
    height: 320,
    scale: 2
  },
  {
    file: 'banner-light.png',
    html: banner(THEMES.light),
    width: 1280,
    height: 320,
    scale: 2
  },
  {
    file: 'social.png',
    html: social(THEMES.dark),
    width: 1200,
    height: 630,
    scale: 1
  },
  {
    file: 'social@2x.png',
    html: social(THEMES.dark),
    width: 1200,
    height: 630,
    scale: 2
  },
  {
    file: 'favicon-32.png',
    html: icon(32, true),
    width: 32,
    height: 32,
    scale: 1,
    transparent: true
  },
  // iOS rounds the corners itself, so the tile is square
  {
    file: 'apple-touch-icon.png',
    html: icon(180, false),
    width: 180,
    height: 180,
    scale: 1
  }
];
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn(process.env.CHROME ?? 'google-chrome', [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(work, 'profile')}`,
  'about:blank'
]);

try {
  let target;

  for (let i = 0; i < 50 && !target; i++) {
    await wait(200);

    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();

      target = list.find((entry) => entry.type === 'page');
    } catch {
      // Chrome isn't listening yet
    }
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve) =>
    ws.addEventListener('open', resolve, { once: true })
  );

  let id = 0;

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const mine = ++id;
      const onMessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.id !== mine) return;

        ws.removeEventListener('message', onMessage);
        resolve(message.result);
      };

      ws.addEventListener('message', onMessage);
      ws.send(JSON.stringify({ id: mine, method, params }));
    });

  await send('Page.enable');

  for (const output of OUTPUTS) {
    const file = join(work, `${output.file}.html`);

    writeFileSync(file, output.html);
    await send('Emulation.setDeviceMetricsOverride', {
      width: output.width,
      height: output.height,
      deviceScaleFactor: output.scale,
      mobile: false
    });
    await send('Emulation.setDefaultBackgroundColorOverride', {
      color: output.transparent ? { r: 0, g: 0, b: 0, a: 0 } : undefined
    });
    await send('Page.navigate', { url: pathToFileURL(file).href });
    await wait(800);
    await send('Runtime.evaluate', {
      expression: 'document.fonts.ready',
      awaitPromise: true
    });

    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: output.width, height: output.height, scale: 1 }
    });

    writeFileSync(join(LOGO, output.file), Buffer.from(data, 'base64'));
  }

  ws.close();
} finally {
  chrome.kill();
  rmSync(work, { recursive: true, force: true });
}

// A palette of up to 256 colours keeps flat artwork sharp and small
execFileSync(
  'python3',
  [
    '-c',
    `import sys
from PIL import Image
for path in sys.argv[1:]:
    image = Image.open(path)
    image = image.convert('RGBA') if image.mode != 'RGBA' else image
    image.quantize(256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)`,
    ...OUTPUTS.map(({ file }) => join(LOGO, file))
  ],
  { stdio: 'inherit' }
);

for (const { file } of OUTPUTS) {
  console.log(`${file}: ${statSync(join(LOGO, file)).size} bytes`);
}
