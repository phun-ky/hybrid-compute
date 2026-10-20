import semver from 'semver';

import { readFileSync, readdirSync } from 'node:fs';

const PACKAGES_DIR = new URL('../packages/', import.meta.url);
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
];
const packages = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const file = new URL(`${entry.name}/package.json`, PACKAGES_DIR);

    return { dir: entry.name, pkg: JSON.parse(readFileSync(file, 'utf8')) };
  });
const versions = new Map(packages.map(({ pkg }) => [pkg.name, pkg.version]));
const problems = [];

for (const { dir, pkg } of packages) {
  for (const field of DEPENDENCY_FIELDS) {
    for (const [name, range] of Object.entries(pkg[field] ?? {})) {
      const localVersion = versions.get(name);

      if (!localVersion) continue;

      if (!semver.satisfies(localVersion, range)) {
        problems.push(
          `packages/${dir}: ${field}["${name}"] is "${range}", but the local version is ${localVersion}`
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Sibling ranges do not match local versions:\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nUpdate the ranges (e.g. with scripts/sync-sibling-ranges.mjs) and reinstall.'
  );
  process.exit(1);
}

console.log(
  `All sibling ranges match local versions (${packages.length} packages checked).`
);
