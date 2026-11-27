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
| `workers`      | No                     | How many workers may run at once, to run tasks in parallel. `1` by default                                                          |

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

## Progress

A task reports progress with the `progress` function in its context. Each value
reaches the `onProgress` option of `runTask`, until the task settles:

```ts
exposeTasks({
  resize: async (images: Blob[], { progress }) => {
    for (const [index, image] of images.entries()) {
      await resizeOne(image);
      progress((index + 1) / images.length);
    }

    return 'done';
  }
});
```

```ts
await compute.runTask('resize', images, 'worker', {
  onProgress: (share) => console.log(`${Math.round(share * 100)}%`)
});
```

Progress doesn't reset the timeout. If `onProgress` throws, the task rejects
with that error and the worker is told to cancel it.

## Transferring buffers

The input and the result are copied by default. To move an `ArrayBuffer` (or
another transferable object) instead, list it in `transfer`. It's detached on
the sending side, so don't use it there afterwards:

```ts
const pixels = new Uint8Array(width * height * 4);

await compute.runTask('blur', pixels, 'worker', { transfer: [pixels.buffer] });
```

In the worker script, wrap the result in `transfer` to move it back:

```ts
import { exposeTasks, transfer } from '@hybrid-compute/worker';

exposeTasks({
  blur: (pixels: Uint8Array) => transfer(blurInPlace(pixels), [pixels.buffer])
});
```

Only the worker backend transfers. The local and remote backends ignore
`transfer`, so with the `auto` strategy the caller's buffer is emptied or not
depending on the backend that runs the task.

A `SharedArrayBuffer` needs neither: it's shared with the worker, not copied, so
both sides see each other's writes. Don't list it in `transfer`. In browsers it
exists only on cross-origin isolated pages, served with the
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` headers.

## Several workers

One worker runs its tasks on one thread, so heavy tasks wait for each other. Set
`workers` to run up to that many at once:

```ts
const worker = createThreadedCompute({
  url: '/workers/resize.worker.js',
  canRunTasks: ['resizeImage'],
  workers: navigator.hardwareConcurrency
});

// Up to that many images are resized in parallel
await Promise.all(images.map((image) => worker.runTask('resizeImage', image)));
```

Another worker starts only when the running ones are all busy, and each task
goes to an idle worker, or else the one with the fewest tasks. Each worker loads
its own copy of the worker script, so state in it isn't shared between tasks on
different workers. If a worker crashes, only its tasks reject. In Node.js,
`os.availableParallelism()` gives the number of cores.

## Closing the worker

Call `worker.close()` when you're done with it: it terminates the workers, and
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
string, or an object with a `message`). Before it, the script may send any
number of `{ id, progress }` messages (`WorkerProgressMessageInterface`).
Replies with an `id` no task waits for are ignored.

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
