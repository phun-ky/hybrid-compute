[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
ThreadedComputeOptionsInterface

# Interface: ThreadedComputeOptionsInterface

Defined in:
[packages/worker/src/types.ts:32](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L32)

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
[packages/worker/src/types.ts:35](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L35)

The tasks the worker script can run. Only these are sent to it.

---

### createWorker?

```ts
optional createWorker?: () => Worker;
```

Defined in:
[packages/worker/src/types.ts:33](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L33)

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
optional timeout?: number;
```

Defined in:
[packages/worker/src/types.ts:36](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L36)

How long to wait for a reply, in milliseconds, before rejecting with a
`WorkerTaskError`. Defaults to `0`: no timeout, since workers are for long
running work.

---

### url?

```ts
optional url?: string | URL;
```

Defined in:
[packages/worker/src/types.ts:34](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L34)

The worker script, for a script served as it is, without a bundler. It's started
as a module worker.
