# Release notes

Every major release gets **release notes**: a readable account of what changed
since the previous major, why it changed, and what it means for you. They sit
next to the [upgrading guide](../upgrading.md), which has the step-by-step code
changes. Read the release notes to decide when to upgrade, and the upgrading
guide when you do.

| Release         | Status                | Covers                     |
| --------------- | --------------------- | -------------------------- |
| [1.0](./1.0.md) | Released October 2026 | Everything from 0.x to 1.0 |

Each package's `CHANGELOG.md` still lists every single release, minor and patch
included. The release notes are the summary for people, the changelogs the
complete record.

## What every release note covers

- **Overview:** the release in a few sentences, and who it matters to.
- **What's new:** by package, with examples.
- **What's not changing:** so you know what you can leave alone.
- **Deprecated:** what's deprecated and still works, what replaces it, and the
  major it will be removed in.
- **Removed:** what this major removes, after its grace period.
- **FAQ:** whether you need to upgrade now, how big the work is, and what
  happens to the previous major.
- **Getting help:** where to ask, and how to report a problem with the release.

Each major release also gets a set of **release banners** for the notes and for
sharing: a banner, a social card, a square and a portrait image, each at 1x and
2x, rendered from `scripts/banners/<release>.mjs` with `npm run banners`.
