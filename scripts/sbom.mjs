// Write a CycloneDX software bill of materials for one package, covering its
// runtime dependencies, to stdout. npm names the monorepo root as the subject,
// so the package itself is set as the subject instead.
// Usage: node scripts/sbom.mjs <package>, e.g. node scripts/sbom.mjs core
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [name] = process.argv.slice(2);

if (!name) {
  console.error('Usage: node scripts/sbom.mjs <package>');
  process.exit(1);
}

const pkg = JSON.parse(
  readFileSync(
    new URL(`../packages/${name}/package.json`, import.meta.url),
    'utf8'
  )
);
const sbom = JSON.parse(
  execFileSync(
    'npm',
    [
      'sbom',
      '--sbom-format',
      'cyclonedx',
      '--omit',
      'dev',
      '--workspace',
      `packages/${name}`
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  )
);
// A package URL encodes the scope and name separately: pkg:npm/%40scope/name@1.0.0
const purl = `pkg:npm/${pkg.name
  .split('/')
  .map((part) => encodeURIComponent(part))
  .join('/')}@${pkg.version}`;
const rootRef = sbom.metadata.component['bom-ref'];
const packageRef = sbom.components.find(
  (component) => component.name === pkg.name
)?.['bom-ref'];
const rename = (ref) => (ref === packageRef ? purl : ref);

sbom.metadata.component = {
  'bom-ref': purl,
  type: 'library',
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  purl,
  licenses: [{ license: { id: pkg.license } }]
};
// The package is now the subject: drop its duplicate component, the monorepo
// root's dependency entry, and point every reference at the new subject
sbom.components = sbom.components.filter(
  (component) => component['bom-ref'] !== packageRef
);
sbom.dependencies = (sbom.dependencies ?? [])
  .filter((dependency) => dependency.ref !== rootRef)
  .map((dependency) => ({
    ...dependency,
    ref: rename(dependency.ref),
    dependsOn: (dependency.dependsOn ?? [])
      .filter((ref) => ref !== rootRef)
      .map(rename)
  }));

process.stdout.write(`${JSON.stringify(sbom, null, 2)}\n`);
