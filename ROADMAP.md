# Roadmap

What Hybrid Compute intends to do, and not do, from October 2026 to
October 2027. It's a plan, not a promise: priorities can change, and changes to
this file are made in pull requests like any other. Individual pieces of work
are tracked as
[GitHub issues](https://github.com/phun-ky/hybrid-compute/issues), grouped in
milestones.

## Planned

### A stable 1.0

All four packages (`core`, `local`, `remote` and `worker`) go to 1.0 together: a
promise that their API won't break without a major version. Before that, the
[1.0 milestone](https://github.com/phun-ky/hybrid-compute/milestone/4) settles
every decision that would be a breaking change afterwards:

- **An API review of each package:** `core`
  ([#82](https://github.com/phun-ky/hybrid-compute/issues/82)), `local`
  ([#83](https://github.com/phun-ky/hybrid-compute/issues/83)), `remote`
  ([#84](https://github.com/phun-ky/hybrid-compute/issues/84)) and `worker`
  ([#85](https://github.com/phun-ky/hybrid-compute/issues/85)): naming, argument
  order, option shapes, input validation, error behaviour, and for `remote` and
  `worker` timeouts, cancellation and the message format.
- **Modern TypeScript configuration and package exports**
  ([#87](https://github.com/phun-ky/hybrid-compute/issues/87)): an `exports` map
  with a `types` condition, and only built files in the published packages.
- **Tests** ([#88](https://github.com/phun-ky/hybrid-compute/issues/88)):
  keeping each package's own code fully covered (today all four are at 100% of
  lines) with a threshold in CI, and property-based tests.
- **The 1.0 release itself**
  ([#89](https://github.com/phun-ky/hybrid-compute/issues/89)), with release
  notes and a migration guide.

Below 1.0 a minor release may contain breaking changes. From 1.0 on, the current
major is supported as a whole and the previous one gets high and critical
security fixes for 6 months; see the
[security policy](SECURITY.md#supported-versions). Packages added later start
below 1.0.

### Project health

- **OpenSSF Best Practices:** the passing badge, then silver and OSPS Baseline
  levels 1 to 3 ([#81](https://github.com/phun-ky/hybrid-compute/issues/81)).
  The answers are kept in [`.bestpractices.json`](.bestpractices.json).
- **A second maintainer**, so that pull requests get a review from someone other
  than the author and access to the project doesn't rest on one person; see
  [governance](GOVERNANCE.md#continuity).

## Considered, not scheduled

Ideas that fit the project but have no date. Each would start as a 0.x package
or an addition to an existing one, after a discussion in its issue.

- **A WebAssembly backend**
  ([#86](https://github.com/phun-ky/hybrid-compute/issues/86), with the draft in
  [#32](https://github.com/phun-ky/hybrid-compute/pull/32)).
- **More transports for `remote`**, such as WebRTC data channels.
- **Node.js `worker_threads`** as well as browser Web Workers, depending on the
  outcome of the `worker` API review.

## Not planned

- **Sandboxing tasks.** Hybrid Compute decides where a task runs; it doesn't
  isolate what the task does. Local tasks run with your application's rights.
- **Authentication and transport security in `remote`.** Use `https:` and `wss:`
  endpoints, and authenticate on the server side.
- **A hosted compute service.** The project provides libraries; you run the
  remote endpoint yourself.
- **Collecting data.** The packages and the website don't collect, store or send
  data anywhere on their own.
