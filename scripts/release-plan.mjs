// The release decisions, kept free of git and npm so they can be tested.
// scripts/release.mjs gathers the commits and runs the releases.
import semver from 'semver';

export const SCOPE = '@hybrid-compute';

export const RANK = { patch: 1, minor: 2, major: 3 };

/** The higher of two release levels; either may be null. */
export const higher = (a, b) => ((RANK[a] ?? 0) >= (RANK[b] ?? 0) ? a : b);

/**
 * Release level for one conventional commit, or null if it isn't releasable.
 * A breaking change (`type!:` or a `BREAKING CHANGE:` footer) is major from
 * 1.0 on, and minor while the package is below 1.0.
 */
export const levelOf = ({ subject, body = '' }, version) => {
  const match = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(subject);

  if (!match) return null;

  const [, type, bang] = match;

  if (bang || /^BREAKING[ -]CHANGE:/m.test(body)) {
    return semver.major(version) >= 1 ? 'major' : 'minor';
  }

  if (type === 'feat') return 'minor';

  if (['fix', 'perf', 'revert'].includes(type)) return 'patch';

  return null;
};

/** The highest level among commits, with a reason line for each one counted. */
export const levelFromCommits = (commits, version) => {
  let level = null;

  const reasons = [];

  for (const commit of commits) {
    const commitLevel = levelOf(commit, version);

    if (commitLevel) {
      level = higher(level, commitLevel);
      reasons.push(`${commitLevel}: ${commit.subject}`);
    }
  }

  return { level, reasons, ignored: commits.length - reasons.length };
};

/**
 * The version a `Release-As:` footer sets for one package, or null.
 * The footer names each package, e.g.
 * `Release-As: core@1.0.0, @hybrid-compute/local@1.0.0`,
 * so a version is never set for every package by accident.
 */
export const releaseAsIn = (body, name) => {
  let found = null;

  for (const [, value] of body.matchAll(/^Release-As:\s*(.+)$/gim)) {
    for (const entry of value.split(/[\s,]+/).filter(Boolean)) {
      const at = entry.lastIndexOf('@');

      if (at <= 0) {
        throw new Error(
          `Release-As: "${entry}" doesn't name a package; write <package>@<version>, e.g. core@1.0.0`
        );
      }

      const target = entry.slice(0, at).replace(`${SCOPE}/`, '');
      const version = entry.slice(at + 1);

      if (!semver.valid(version)) {
        throw new Error(`Release-As: "${version}" isn't a valid version`);
      }

      if (target === name) found = version;
    }
  }

  return found;
};

/**
 * Decide the next version of every package, in dependency order, so a
 * sibling's new version is known before its dependents are checked.
 * Each entry has { name, pkg: { name, version, dependencies }, level,
 * reasons, releaseAs }; level and reasons are updated in place. Returns the
 * next version of each released package, keyed by package name.
 */
export const plan = (entries) => {
  const next = new Map();

  for (const entry of entries) {
    if (entry.releaseAs) {
      if (!semver.gt(entry.releaseAs, entry.pkg.version)) {
        throw new Error(
          `Release-As: ${entry.name}@${entry.releaseAs} isn't higher than the current ${entry.pkg.version}`
        );
      }

      entry.reasons.unshift(`release-as: ${entry.releaseAs}`);
    }

    for (const [dependency, range] of Object.entries(
      entry.pkg.dependencies ?? {}
    )) {
      const version = next.get(dependency);

      if (version && !semver.satisfies(version, range)) {
        entry.level = higher(entry.level, 'patch');
        entry.reasons.push(
          `patch: ${dependency}@${version} is outside ${range}`
        );
      }
    }

    if (entry.releaseAs) {
      next.set(entry.pkg.name, entry.releaseAs);
    } else if (entry.level) {
      next.set(entry.pkg.name, semver.inc(entry.pkg.version, entry.level));
    }
  }

  return next;
};

/** What to pass to release-it's --increment: the explicit version, or the level. */
export const incrementFor = ({ releaseAs, level }) => releaseAs ?? level;
