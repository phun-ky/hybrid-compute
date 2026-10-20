# Upgrading

How Hybrid Compute versions its packages, how deprecations work, and the code
changes for each major release. For what changed and why, read the
[release notes](./releases/index.md) first.

[[toc]]

## How versions work

All four packages (`core`, `local`, `remote` and `worker`) follow
[Semantic Versioning](https://semver.org/), each with its own version:

- **Patch** (1.0.**1**): bug fixes. Nothing to change.
- **Minor** (1.**1**.0): new features. Nothing to change.
- **Major** (**2**.0.0): breaking changes, listed on this page with the code to
  change.

From 1.0, the public API only breaks in a major release. With `^1.0.0` ranges,
`npm update` never needs a change to your code.

### Deprecations

Deprecating an API isn't a breaking change, so it can happen in any release:

- The API is marked `@deprecated` in its types, naming its replacement and the
  major it will be removed in. Editors show it struck through.
- It keeps working through one full major. Deprecated during 1.x, it can be
  removed in 3.0 at the earliest.
- The release notes for the next major list everything deprecated and removed.

A security fix is the one exception: if a vulnerability can't be fixed without
changing an API, the fix may come in a patch or minor release. See the
[security policy](https://github.com/phun-ky/hybrid-compute/blob/main/SECURITY.md#supported-versions).

## Migrating from 0.x to 1.0

1.0 settles the API that the 0.x releases worked out. The breaking changes all
came during October 2026, in 0.38 to 0.40. If you're on 0.37 or older, read
every section below; otherwise start from your version.

### Checklist

1. **Update all four packages together** to `^1.0.0`. `local`, `remote` and
   `worker` depend on `core ^1.0.0`.
2. **Check your runtime:** Node.js 22 or later, or a browser from 2022 or later
   (Chrome 93, Firefox 92, Safari 15.4). The packages are ES2022 and ES modules
   only.
3. **Catch the new error types** instead of matching on error messages:
   `NoBackendError` from core, `RemoteTaskError` and `WorkerTaskError`.
4. **local:** give every task a unique name; replace a task with
   `unregisterTask` first.
5. **remote:** pass `canRunTasks` (a list, or `'*'`), and decide on the 30
   second timeout.
6. **worker:** pass an options object, with `createWorker` if you use a bundler.

### core

#### Invalid input fails instead of being accepted

`createHybridCompute` checks its backends, and `runTask` checks its arguments.
Mistakes that used to slip through now fail straight away:

| Mistake                                                | 0.x                               | 1.0                                    |
| ------------------------------------------------------ | --------------------------------- | -------------------------------------- |
| A misspelt backend key, such as `wokrer`               | ignored                           | `RangeError: Unknown backend 'wokrer'` |
| A backend without `canRun` or `runTask`, or no backend | accepted, failed later            | `TypeError`                            |
| An empty or non-string task name                       | `Error: No backend available ...` | `TypeError`                            |
| A strategy other than auto, local, worker or remote    | fell back to `auto`, or `Error`   | `RangeError: Unknown strategy 'gpu'`   |

#### An explicit strategy checks canRun

`runTask(name, input, 'worker')` used to send the task to the worker backend
even if the backend couldn't run it. Now the backend's `canRun(name)` must be
true, as it already had to be for `auto`. Make sure the backend lists the task:
register it with `local`, or include it in `canRunTasks` for `remote` and
`worker`.

#### NoBackendError instead of Error

When nothing can run a task, `runTask` rejects with a `NoBackendError`, which
has the `taskName` and `strategy`. The message changed too, so match on the
type:

```ts
// 0.x
try {
  await compute.runTask('resize', image);
} catch (error) {
  if (/No backend available/.test((error as Error).message)) useFallback();
}

// 1.0
import { NoBackendError } from '@hybrid-compute/core';

try {
  await compute.runTask('resize', image);
} catch (error) {
  if (error instanceof NoBackendError) useFallback();
}
```

### local

#### registerTask checks the task, and refuses duplicate names

A task needs a non-empty `name` and a `run` function, and its name must be new.
Registering the same name again used to replace the task silently; now it throws
a `RangeError`. To replace a task, unregister it first:

```ts
// 0.x
local.registerTask({ name: 'resize', run: resizeV1 });
local.registerTask({ name: 'resize', run: resizeV2 }); // replaced resizeV1

// 1.0
local.registerTask({ name: 'resize', run: resizeV1 });
local.unregisterTask('resize');
local.registerTask({ name: 'resize', run: resizeV2 });
```

#### A missing task rejects with NoBackendError

`local.runTask` with a name that isn't registered rejects with a
`NoBackendError` (from `@hybrid-compute/core`) instead of
`Error: Local task 'x' not found.`

A task's `run` can now return a plain value as well as a Promise, and gets
`{ signal }` as its second argument when the caller passes one.

### remote

#### canRunTasks is required

Leaving `canRunTasks` out used to mean "every task", which quietly sent any task
no worker or local backend could run to your server. Now you choose:

```ts
// 0.x
createRemoteCompute({ transport: 'fetch', endpoint: '/api/compute' });

// 1.0: the tasks the server runs
createRemoteCompute({
  transport: 'fetch',
  endpoint: '/api/compute',
  canRunTasks: ['translate', 'summarise']
});

// 1.0: or every task, as before
createRemoteCompute({
  transport: 'fetch',
  endpoint: '/api/compute',
  canRunTasks: '*'
});
```

The options are checked when the backend is created: an unknown transport, an
endpoint with the wrong URL scheme (`http:` or `https:` for fetch, `ws:` or
`wss:` for WebSocket) or a bad `timeout` throws a `TypeError` or `RangeError`.

#### RemoteTaskError for every failure

Failures used to reject with an `Error`, a `SyntaxError` or the server's raw
`error` string. Now they all reject with a `RemoteTaskError`, which has the
`taskName`, the server's `error` value as `detail`, the HTTP `status` and the
underlying `cause`:

```ts
// 0.x
try {
  await remote.runTask('translate', text);
} catch (error) {
  if (error === 'Unauthorised') signIn();
}

// 1.0
import { RemoteTaskError } from '@hybrid-compute/remote';

try {
  await remote.runTask('translate', text);
} catch (error) {
  if (error instanceof RemoteTaskError && error.status === 401) signIn();
}
```

A response with a non-2xx status now fails, even when its body has a `result`.

#### Tasks time out after 30 seconds

Remote tasks used to wait forever. Now they reject with a `RemoteTaskError`
after 30 seconds. Set `timeout` (in milliseconds) for longer tasks, or `0` for
no timeout.

#### The WebSocket connects on the first task

The WebSocket transport used to connect when the backend was created, and
`runTask` rejected if the socket wasn't open yet. Now it connects on the first
task, waits for the connection, and connects again after it closes. Call
`remote.close()` when you're done with it.

### worker

#### An options object, and createWorker for bundlers

`createThreadedCompute(url, taskNames)` becomes an options object. With a
bundler such as Vite or webpack, use `createWorker`: they only build the worker
script when they see `new Worker(new URL(...))` written out in full:

```ts
// 0.x
const worker = createThreadedCompute(new URL('./worker.js', import.meta.url), [
  'resize'
]);
// 1.0, with a bundler
const worker = createThreadedCompute({
  createWorker: () =>
    new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
  canRunTasks: ['resize']
});
// 1.0, a worker script served as it is
const worker = createThreadedCompute({
  url: '/workers/worker.js',
  canRunTasks: ['resize']
});
```

#### WorkerTaskError for every failure

An `{ error }` reply used to reject with the raw value. Now every failure
rejects with a `WorkerTaskError`, with the `taskName` and the worker's `error`
as `detail`. A falsy `error` such as `''` now counts as an error too.

A task that isn't in `canRunTasks` rejects with `NoBackendError` instead of
being sent to the worker.

#### Tasks no longer hang

A worker that crashes, or whose script fails to load, used to leave its tasks
waiting forever. Now they reject, and the next task starts a new worker. Tasks
have no timeout by default; set `timeout` if you want one.

#### The worker script

Hand-written worker scripts keep working. They may now get
`{ id, cancel: true }` when a task is cancelled, which they can ignore. Or use
`exposeTasks` to write the script for you:

```ts
// 0.x worker.js
self.onmessage = async ({ data: { id, task, input } }) => {
  try {
    self.postMessage({ id, result: await tasks[task](input) });
  } catch (error) {
    self.postMessage({ id, error: (error as Error).message });
  }
};

// 1.0 worker.js
import { exposeTasks } from '@hybrid-compute/worker';

exposeTasks(tasks);
```

### All packages: ES2022 and ES modules

The packages are compiled to ES2022, so they need Node.js 22 (as `engines`
already said) or a browser from 2022 or later. For older browsers, have your
bundler transpile them. They're ES modules only: from CommonJS, use
`await import('@hybrid-compute/core')`, or `require()` on Node.js 22.12 or
later.
