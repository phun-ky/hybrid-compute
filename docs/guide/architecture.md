# Architecture

Hybrid Compute is a TypeScript monorepo of four npm packages, managed with npm
workspaces. Each package is an ES module with its own version, changelog and
release.

## Packages and how they depend on each other

`core` defines the interfaces and the orchestrator. Each backend implements
`ComputeBackendInterface` from `core`, and nothing else depends on a backend, so
an application installs `core` plus only the backends it uses.

| Package  | Contains                                                                                           | Runtime dependencies |
| -------- | -------------------------------------------------------------------------------------------------- | -------------------- |
| `core`   | `HybridCompute` and `createHybridCompute`, the strategies, the shared interfaces, `NoBackendError` | None                 |
| `local`  | `LocalCompute`: runs registered tasks on the calling thread                                        | `core`               |
| `worker` | `ThreadedCompute`: runs tasks in a Web Worker through `postMessage`                                | `core`               |
| `remote` | `RemoteCompute`: sends tasks to an endpoint over `fetch` or WebSocket                              | `core`               |

<PackagesDiagram />

## How a task is dispatched

<DispatchDiagram />

`runTask(taskName, input, strategy = 'auto')` on `core` picks the backend:

- **`local`, `worker` or `remote`:** that backend runs the task, if it is
  configured and its `canRun(taskName)` is true.
- **`auto`:** the first backend whose `canRun(taskName)` is true, in the order
  worker, local, remote.
- **No match:** `runTask` rejects with a `NoBackendError`, which has the
  `taskName` and `strategy` as properties.

Invalid input fails early: `createHybridCompute` throws a `TypeError` or
`RangeError` for a missing, misspelt or incomplete backend, and `runTask`
rejects with one for an empty task name or an unknown strategy.

A backend's `canRun` answers differently per package:

| Backend  | `canRun(taskName)` is true when                                       |
| -------- | --------------------------------------------------------------------- |
| `local`  | a task with that name was registered with `registerTask`              |
| `worker` | the name is in `canRunTasks`, and the runtime has Web Workers         |
| `remote` | the name is in `canRunTasks`, or `canRunTasks` is `'*'` (accepts all) |

## Message formats

The backends that cross a boundary use small JSON messages. The `id` matches a
result to its call, so several tasks can be in flight at once.

| Backend              | Sends                                                      | Receives                  |
| -------------------- | ---------------------------------------------------------- | ------------------------- |
| `worker`             | `postMessage({ id, task, input })`, `{ id, cancel: true }` | `{ id, result, error? }`  |
| `remote` (fetch)     | `POST` to the endpoint, JSON body `{ task, input }`        | JSON `{ result, error? }` |
| `remote` (WebSocket) | `{ task, input, id }` on a socket opened by the first task | `{ id, result, error? }`  |

An `error` in the reply rejects the task's Promise. For `remote`, every failure
rejects with a `RemoteTaskError`: an `error` reply, a non-2xx fetch status, a
reply that isn't usable, a connection that fails or closes, and the timeout (30
seconds by default). For `worker`, every failure rejects with a
`WorkerTaskError`: an `error` reply, a reply that isn't usable, a worker that
crashes or doesn't load, and the timeout (none by default). Any task can also be
cancelled with an `AbortSignal` passed to `runTask`; `worker` then sends
`{ id, cancel: true }` so the worker script can stop. The worker script and the
remote service are yours to write (`exposeTasks` writes the worker side for
you); see the [worker](/guide/usage/worker) and [remote](/guide/usage/remote)
guides.

<WorkerDiagram />

<RemoteDiagram />

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
