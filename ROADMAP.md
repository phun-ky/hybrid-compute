# Roadmap

What Hybrid Compute intends to do, and not do, from October 2026 to
October 2027. It's a plan, not a promise: priorities can change, and changes to
this file are made in pull requests like any other. Individual pieces of work
are tracked as
[GitHub issues](https://github.com/phun-ky/hybrid-compute/issues), grouped in
milestones.

## Planned

### 1.0, and keeping it stable

All four packages (`core`, `local`, `remote` and `worker`) reached 1.0 in
October 2026 ([#89](https://github.com/phun-ky/hybrid-compute/issues/89)), after
an API review of each, modern package exports, and tests enforced in CI; see the
[1.0 release notes](https://phun-ky.net/hybrid-compute/guide/releases/1.0). From
here:

- **No breaking changes in 1.x.** The current major is supported as a whole and
  the previous one gets high and critical security fixes for 6 months; see the
  [security policy](SECURITY.md#supported-versions).
- **Deprecations before removals:** a deprecated API keeps working through one
  full major, and every major comes with release notes and an
  [upgrading guide](https://phun-ky.net/hybrid-compute/guide/upgrading).
- **Packages added later start below 1.0**, so their API can settle first.

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

- **More transports for `remote`**, such as WebRTC data channels.
- **Node.js `worker_threads`** as well as browser Web Workers
  ([#127](https://github.com/phun-ky/hybrid-compute/issues/127)); `worker` is
  browser only at 1.0.

## Not planned

- **Sandboxing tasks.** Hybrid Compute decides where a task runs; it doesn't
  isolate what the task does. Local tasks run with your application's rights.
- **Authentication and transport security in `remote`.** Use `https:` and `wss:`
  endpoints, and authenticate on the server side.
- **A WebAssembly backend.** A WebAssembly module's exports are functions, so
  they run as `local` tasks or in a worker with `exposeTasks`; see the
  [WebAssembly guide](https://phun-ky.net/hybrid-compute/guide/usage/wasm)
  ([#86](https://github.com/phun-ky/hybrid-compute/issues/86)).
- **A hosted compute service.** The project provides libraries; you run the
  remote endpoint yourself.
- **Collecting data.** The packages and the website don't collect, store or send
  data anywhere on their own.
