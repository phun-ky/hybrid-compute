# Usage with worker

This package provides:

- A compute backend that runs tasks in a dedicated module Web Worker, so heavy
  work doesn't block the main thread
- `exposeTasks`, which turns an object of functions into a worker script
- Timeouts, cancellation with an `AbortSignal`, and one error type,
  `WorkerTaskError`, for every failure

[[toc]]

## Install

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/worker
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/worker
```

:::

## Example

Create a file named `worker.ts`:

```ts
import { exposeTasks } from '@hybrid-compute/worker';

exposeTasks({
  echo: (input: string) => `Echo from Worker: ${input}`
});
```

And your `main.ts`:

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createThreadedCompute } from '@hybrid-compute/worker';

const worker = createThreadedCompute({
  // Started on the first task. Bundlers build worker.ts because they see
  // new Worker(new URL(...)) written out in full
  createWorker: () =>
    new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
  canRunTasks: ['echo']
});
const compute = createHybridCompute({
  worker
});
const main = async () => {
  try {
    const result = await compute.runTask('echo', 'Hello from Worker!');

    console.log(result); // Echo from Worker: Hello from Worker!
  } catch (error) {
    console.error('Task failed:', error);
  }
};

main();
```

`exposeTasks` runs the task with that name and replies with its result, or with
an error if the task throws, rejects or doesn't exist. List the same names in
`canRunTasks`: only those are sent to the worker.

## Bundlers

Vite and webpack build a worker script, with its imports, only when they see
`new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`
written out in full. That's why the example passes a `createWorker` function
with that expression in it. Passing
`url: new URL('./worker.ts', import.meta.url)` instead doesn't work with a
bundler: Vite leaves the worker script out of the build, and webpack copies it
as it is, with its imports unresolved, so the worker fails to load.

Use `url` for a worker script that is served as it is, without a bundler:

```ts
const worker = createThreadedCompute({
  url: '/workers/worker.js',
  canRunTasks: ['echo']
});
```

## Options

| Option         | Required               | What it does                                                                                                                        |
| -------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `createWorker` | This or `url`          | A function that returns a new module `Worker`. Called on the first task, and again to start a new worker after a crash or `close()` |
| `url`          | This or `createWorker` | The worker script, as a `URL` or a string, for a script served without a bundler. It's started as a module worker                   |
| `canRunTasks`  | Yes                    | The task names the worker script can run. A task that isn't listed rejects with `NoBackendError`                                    |
| `timeout`      | No                     | Milliseconds to wait for a reply. No timeout by default, since workers are for long running work                                    |

Invalid options throw a `TypeError` or `RangeError` when the backend is created.
Creating it starts no worker: the worker starts on the first task.

## Errors

Every failure rejects with a `WorkerTaskError`, which has the `taskName`, the
worker script's `error` value as `detail`, and the underlying `cause` where
there is one:

```ts
import { WorkerTaskError } from '@hybrid-compute/worker';

try {
  await worker.runTask('echo', 'hello');
} catch (error) {
  if (error instanceof WorkerTaskError) {
    console.warn(error.taskName, error.detail);
  }
}
```

It covers an `{ error }` reply, a reply with neither `result` nor `error`, input
or a result that can't be copied to or from the worker, the timeout, and a
worker that crashes or whose script doesn't load. When the worker crashes, every
task waiting for it rejects, and the next task starts a new worker.

## Cancelling a task

Pass an `AbortSignal` as the fourth argument to `runTask`. The task rejects with
the signal's reason as soon as it aborts:

```ts
const controller = new AbortController();
const pending = compute.runTask('echo', 'hello', 'worker', {
  signal: controller.signal
});

controller.abort();
```

The worker is told to cancel the task too, on abort and when the timeout passes.
With `exposeTasks`, each task gets a `signal` that aborts then, so long running
work can stop early:

```ts
exposeTasks({
  sum: (numbers: number[], { signal }) => {
    let total = 0;

    for (const n of numbers) {
      signal.throwIfAborted();
      total += n;
    }

    return total;
  }
});
```

## Closing the worker

Call `worker.close()` when you're done with it: it terminates the worker, and
tasks still waiting reject. The next task starts a new worker.

## Writing the worker script by hand

`exposeTasks` is optional. A worker script can follow the message format itself,
described by `WorkerTaskMessageInterface`, `WorkerCancelMessageInterface` and
`WorkerResultMessageInterface`:

```ts
self.onmessage = async (event) => {
  const { id, task, input, cancel } = event.data;

  // { id, cancel: true } asks to stop task id; this script can't, so it ignores it
  if (cancel) return;

  try {
    if (task !== 'echo') throw new Error(`No task '${task}' in this worker`);

    self.postMessage({ id, result: `Echo from Worker: ${input}` });
  } catch (error) {
    self.postMessage({ id, error: (error as Error).message });
  }
};
```

A reply has the task's `id` and either a `result` or an `error` (a message
string, or an object with a `message`). Replies with an `id` no task waits for
are ignored.

## Where it runs

Web Workers exist in browsers, Deno and Bun. Where there is no global `Worker`,
as in Node.js, `canRun` returns `false`, so the `auto` strategy uses another
backend, and calling `runTask` directly rejects with a `TypeError`. That keeps
server-side rendering working: there, `auto` falls back to `local`.

## In Node.js

For Node.js's `worker_threads`, import from `@hybrid-compute/worker/node`. It
has the same API, and starts a thread instead of a Web Worker:

```ts
import { createThreadedCompute } from '@hybrid-compute/worker/node';

const threaded = createThreadedCompute({
  url: new URL('./worker.js', import.meta.url),
  canRunTasks: ['add']
});

await threaded.runTask('add', [2, 3]); // 5
```

- **The worker script is the same.** `exposeTasks` finds the thread's
  `parentPort` itself (on Node.js 22.3 and later; on earlier versions, pass
  `parentPort` from `node:worker_threads` as its second argument).
- **`url`** is a `file:` URL, an absolute path, or a path starting with `./`,
  relative to the working directory.
- **`createWorker`** returns a `Worker` from `node:worker_threads`, for options
  such as `resourceLimits`:

  ```ts
  import { Worker } from 'node:worker_threads';

  const threaded = createThreadedCompute({
    createWorker: () =>
      new Worker(new URL('./worker.js', import.meta.url), {
        resourceLimits: { maxOldGenerationSizeMb: 256 }
      }),
    canRunTasks: ['add']
  });
  ```

- **The thread only keeps the process alive while a task waits for its reply**,
  so a script can end without calling `close()`.
- Errors, timeouts and cancelling work as in the browser. A worker script that
  calls `process.exit()` rejects its waiting tasks with a `WorkerTaskError`, and
  the next task starts a new thread.

## WebAssembly

To run a WebAssembly module off the main thread, load it in the worker script
and expose its functions; the [WebAssembly guide](/guide/usage/wasm) walks
through it with Rust.
