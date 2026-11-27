[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
ThreadedComputeOptionsInterface

# Interface: ThreadedComputeOptionsInterface

Defined in:
[packages/worker/src/types.ts:37](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L37)

Options for [createThreadedCompute](../functions/createThreadedCompute.md). Give
exactly one of `url` and `createWorker`.

## Example

```ts
const options: ThreadedComputeOptionsInterface = {
  createWorker: () =>
    new Worker(new URL('./resize.worker.ts', import.meta.url), {
      type: 'module'
    }),
  canRunTasks: ['resizeImage'],
  timeout: 10_000
};
```

## Properties

### canRunTasks

```ts
canRunTasks: readonly string[];
```

Defined in:
[packages/worker/src/types.ts:40](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L40)

The tasks the worker script can run. Only these are sent to it.

---

### createWorker?

```ts
createWorker?: () => Worker;
```

Defined in:
[packages/worker/src/types.ts:38](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L38)

A function that returns a new module `Worker`. Use it with a bundler: Vite and
webpack build the worker script only when they see
`new Worker(new URL('./x.worker.ts', import.meta.url), ...)` written out in
full. It's called on the first task, and again to start a new worker after a
crash or [ThreadedCompute.close](../classes/ThreadedCompute.md#close).

#### Returns

[`Worker`](https://developer.mozilla.org/docs/Web/API/Worker)

---

### timeout?

```ts
timeout?: number;
```

Defined in:
[packages/worker/src/types.ts:41](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L41)

How long to wait for a reply, in milliseconds, before rejecting with a
`WorkerTaskError`. Defaults to `0`: no timeout, since workers are for long
running work.

---

### url?

```ts
url?: string | URL;
```

Defined in:
[packages/worker/src/types.ts:39](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L39)

The worker script, for a script served as it is, without a bundler. It's started
as a module worker.

---

### workers?

```ts
workers?: number;
```

Defined in:
[packages/worker/src/types.ts:42](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L42)

How many workers may run at once. Defaults to `1`. More workers run tasks in
parallel on more cores, but each loads its own copy of the worker script;
`navigator.hardwareConcurrency` (or `os.availableParallelism()` in Node.js) is a
common upper bound. Workers start only when the running ones are all busy.
