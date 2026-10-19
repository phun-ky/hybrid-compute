// Brings package-lock.json in line with a release's version bump (and any
// sibling ranges sync-sibling-ranges.mjs moved), then stages it, so release-it's
// release commit includes it. Runs as an after:bump hook.
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
// release-it runs via `npm run release -w packages/<name>`; drop any workspace
// settings so the install updates the whole lockfile, not one workspace
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) => !/^npm_config_workspaces?$/i.test(key)
  )
);
const run = (command, args) =>
  execFileSync(command, args, { cwd: ROOT, env, stdio: 'inherit' });

run('npm', [
  'install',
  '--package-lock-only',
  '--ignore-scripts',
  '--no-audit',
  '--no-fund'
]);
run('git', ['add', 'package-lock.json']);
