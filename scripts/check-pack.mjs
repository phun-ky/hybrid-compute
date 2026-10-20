// Check what npm would publish: pack every package, check each tarball holds
// the files its package.json points at and no tests, then install the
// tarballs in an empty project and import them. Run after `npm run build`.
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES_DIR = join(ROOT, 'packages');
const npm = (args, cwd) =>
  execFileSync('npm', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
/** Every file path a package.json points at, without the leading ./ */
const entryPoints = (pkg) => {
  const paths = [];
  const collect = (value) => {
    if (typeof value === 'string') paths.push(value);
    else if (value && typeof value === 'object')
      Object.values(value).forEach(collect);
  };

  collect(pkg.exports);
  collect(pkg.main);
  collect(pkg.types);

  return paths.map((path) => path.replace(/^\.\//, ''));
};
const work = mkdtempSync(join(tmpdir(), 'hybrid-compute-pack-'));
const problems = [];
const tarballs = [];
const names = [];

try {
  for (const dir of readdirSync(PACKAGES_DIR)) {
    const cwd = join(PACKAGES_DIR, dir);
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    const output = JSON.parse(
      npm(['pack', '--json', '--pack-destination', work], cwd)
    );
    // An array in npm 11, an object keyed by package name in a workspace in npm 12
    const packed = Array.isArray(output) ? output[0] : Object.values(output)[0];
    const files = new Set(packed.files.map((file) => file.path));

    for (const path of entryPoints(pkg)) {
      if (!files.has(path))
        problems.push(`${pkg.name}: ${path} is not in the tarball`);
    }

    for (const path of files) {
      if (/(^|\/)__tests__\/|\.tsbuildinfo$/.test(path)) {
        problems.push(`${pkg.name}: ${path} should not be published`);
      }
    }

    tarballs.push(join(work, packed.filename));
    names.push(pkg.name);
    console.log(
      `${pkg.name}@${pkg.version}: ${files.size} files, ${packed.size} bytes`
    );
  }

  if (problems.length === 0) {
    const app = join(work, 'app');

    mkdirSync(app);
    writeFileSync(
      join(app, 'package.json'),
      '{ "name": "app", "private": true, "type": "module" }\n'
    );
    npm(
      [
        'install',
        '--no-audit',
        '--no-fund',
        '--ignore-scripts',
        '--offline',
        ...tarballs
      ],
      app
    );

    // Import every package, and run a task through core and local
    const smoke = `
      const names = ${JSON.stringify(names)};
      for (const name of names) {
        const exported = Object.keys(await import(name));
        if (exported.length === 0) throw new Error(name + ' exports nothing');
        console.log(name + ': ' + exported.join(', '));
      }
      const { createHybridCompute } = await import('@hybrid-compute/core');
      const { createLocalCompute } = await import('@hybrid-compute/local');
      const local = createLocalCompute();
      local.registerTask({ name: 'double', run: (n) => n * 2 });
      const result = await createHybridCompute({ local }).runTask('double', 21);
      if (result !== 42) throw new Error('double(21) gave ' + result);
      console.log('core and local ran a task: double(21) = 42');
    `;

    try {
      execFileSync('node', ['--input-type=module', '-e', smoke], {
        cwd: app,
        stdio: 'inherit'
      });
    } catch {
      problems.push('the installed tarballs could not be imported or run');
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (problems.length > 0) {
  console.error('\nThe packages would not publish correctly:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nCheck "files" in package.json, and run npm run build first.'
  );
  process.exit(1);
}

console.log(`\nAll ${names.length} packages pack, install and import.`);
