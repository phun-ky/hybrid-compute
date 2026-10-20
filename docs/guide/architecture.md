# Architecture

Hybrid Compute is a TypeScript monorepo of four npm packages, managed with npm
workspaces. Each package is an ES module with its own version, changelog and
release.

## Packages and how they depend on each other

`core` defines the interfaces and the orchestrator. Each backend implements
`ComputeBackendInterface` from `core`, and nothing else depends on a backend, so
an application installs `core` plus only the backends it uses.

| Package  | Contains                                                                         | Runtime dependencies |
| -------- | -------------------------------------------------------------------------------- | -------------------- |
| `core`   | `HybridCompute` and `createHybridCompute`, the strategies, the shared interfaces | `@phun-ky/typeof`    |
| `local`  | `LocalCompute`: runs registered tasks on the calling thread                      | `core`               |
| `worker` | `ThreadedCompute`: runs tasks in a Web Worker through `postMessage`              | `core`               |
| `remote` | `RemoteCompute`: sends tasks to an endpoint over `fetch` or WebSocket            | `core`               |

## How a task is dispatched

<figure class="arch">
<svg viewBox="0 0 780 300" role="img" aria-labelledby="arch-title arch-desc">
<title id="arch-title">How runTask reaches a backend</title>
<desc id="arch-desc">The application calls runTask on core. Core picks the local, worker or remote backend from the strategy, and every backend returns a Promise to the application.</desc>
<rect class="arch-box" x="10" y="120" width="180" height="60" rx="6" />
<text class="arch-label" x="100" y="146" text-anchor="middle">Application</text>
<text class="arch-mono" x="100" y="166" text-anchor="middle">runTask(name, input)</text>
<path class="arch-line" d="M190 150 H230" />
<rect class="arch-box arch-core" x="230" y="105" width="240" height="90" rx="6" />
<text class="arch-label" x="350" y="135" text-anchor="middle">core</text>
<text class="arch-mono" x="350" y="157" text-anchor="middle">strategy</text>
<text class="arch-mono" x="350" y="177" text-anchor="middle">auto · local · worker · remote</text>
<path class="arch-line" d="M470 130 C505 130 505 50 540 50" />
<path class="arch-line" d="M470 150 H540" />
<path class="arch-line" d="M470 170 C505 170 505 250 540 250" />
<rect class="arch-box" x="540" y="20" width="230" height="60" rx="6" />
<text class="arch-label" x="655" y="45" text-anchor="middle">local</text>
<text class="arch-mono" x="655" y="65" text-anchor="middle">same thread · registered task</text>
<rect class="arch-box" x="540" y="120" width="230" height="60" rx="6" />
<text class="arch-label" x="655" y="145" text-anchor="middle">worker</text>
<text class="arch-mono" x="655" y="165" text-anchor="middle">Web Worker · postMessage</text>
<rect class="arch-box" x="540" y="220" width="230" height="60" rx="6" />
<text class="arch-label" x="655" y="245" text-anchor="middle">remote</text>
<text class="arch-mono" x="655" y="265" text-anchor="middle">fetch or WebSocket · JSON</text>
</svg>
<figcaption>Every backend returns a Promise of the task's output.</figcaption>
</figure>

`runTask(taskName, input, strategy = 'auto')` on `core` picks the backend:

- **`local`, `worker` or `remote`:** the matching backend runs the task, if it
  is configured. The backend's `canRun` is not consulted.
- **`auto`:** the first backend whose `canRun(taskName)` is true, in the order
  worker, local, remote.
- **No match:** `runTask` rejects with
  `No backend available for task '<name>' using strategy '<strategy>'`.

A backend's `canRun` answers differently per package:

| Backend  | `canRun(taskName)` is true when                                            |
| -------- | -------------------------------------------------------------------------- |
| `local`  | a task with that name was registered with `registerTask`                   |
| `worker` | the name is in the task list passed to `createThreadedCompute`             |
| `remote` | the name is in `canRunTasks`, or `canRunTasks` was not given (accepts all) |

## Message formats

The backends that cross a boundary use small JSON messages. The `id` matches a
result to its call, so several tasks can be in flight at once.

| Backend              | Sends                                                  | Receives                  |
| -------------------- | ------------------------------------------------------ | ------------------------- |
| `worker`             | `postMessage({ task, input, id })`                     | `{ id, result, error? }`  |
| `remote` (fetch)     | `POST` to the endpoint, JSON body `{ task, input }`    | JSON `{ result, error? }` |
| `remote` (WebSocket) | `{ task, input, id }` on the socket opened at creation | `{ id, result, error? }`  |

An `error` in the reply rejects the task's Promise. The worker script and the
remote service are yours to write; see the [worker](/guide/usage/worker) and
[remote](/guide/usage/remote) guides.

## Design

- **Small and explicit.** Tasks are registered and dispatched by name. There is
  no scheduling, queueing or retrying; an application adds those around
  `runTask` if it needs them.
- **Backends are interfaces.** Anything implementing `canRun` and `runTask` can
  be passed to `createHybridCompute`, which also makes backends easy to replace
  with test doubles.
- **No hidden I/O.** Only `remote` uses the network, and only to the endpoint it
  was given. What can and can't be relied on is in the
  [security policy](https://github.com/phun-ky/hybrid-compute/blob/main/SECURITY.md#security-expectations).

## Repository layout

| Path                  | What's there                                                              |
| --------------------- | ------------------------------------------------------------------------- |
| `packages/<name>/src` | Each package's source, with its tests in `__tests__`                      |
| `scripts`             | Release planning and checks, with their tests in `__tests__`              |
| `docs`                | This site (VitePress); `docs/api` is generated by TypeDoc at each release |
| `.github/workflows`   | Checks, dependency review, Scorecard, publish and docs deploy             |

## Build, test and release

- **Build:** `npm run build` runs `tsc -b` with project references, building
  `core` first. Each package's `tsconfig.build.json` builds the published `dist`
  without tests; `tsconfig.json` type-checks the tests too.
- **Checks:** every pull request is built, linted, type-checked and tested, and
  its API docs are checked, by the Checks workflow. Dependency review, the DCO
  sign-off and CodeQL must pass as well before it can merge.
- **Release:** merging a pull request runs the publish workflow. It releases
  only the packages with releasable changes, in dependency order, publishes them
  to npm with trusted publishing and provenance, and attaches a software bill of
  materials to each GitHub release. Which commits release what is in the
  [development guide](/guide/development#releases).
