[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
ThreadedComputeOptionsInterface

# Interface: ThreadedComputeOptionsInterface

Defined in:
[packages/worker/src/types.ts:23](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L23)

Options for [createThreadedCompute](../functions/createThreadedCompute.md).

## Example

```ts
const options: ThreadedComputeOptionsInterface = {
  url: new URL('./worker.js', import.meta.url),
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
[packages/worker/src/types.ts:25](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L25)

The tasks the worker script can run. Only these are sent to it.

---

### timeout?

```ts
optional timeout?: number;
```

Defined in:
[packages/worker/src/types.ts:26](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L26)

How long to wait for a reply, in milliseconds, before rejecting with a
`WorkerTaskError`. Defaults to `0`: no timeout, since workers are for long
running work.

---

### url

```ts
url: string | URL;
```

Defined in:
[packages/worker/src/types.ts:24](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L24)

The worker script, started as a module worker. Usually
`new URL('./worker.js', import.meta.url)`, so bundlers find it.
