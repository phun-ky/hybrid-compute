[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
ThreadedCompute

# Class: ThreadedCompute

Defined in:
[packages/worker/src/index.ts:146](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L146)

ThreadedCompute is a backend that runs tasks in a dedicated module Web Worker,
so heavy work doesn't block the main thread.

It starts the worker on the first task, not when it's created, sends each task
with an id and matches the replies by id. Write the worker script with
[exposeTasks](../functions/exposeTasks.md), or by hand following
[WorkerTaskMessageInterface](../interfaces/WorkerTaskMessageInterface.md) and
[WorkerResultMessageInterface](../interfaces/WorkerResultMessageInterface.md).

Every failure (an `error` in the reply, a crash, the timeout) rejects with a
[WorkerTaskError](WorkerTaskError.md). If the worker crashes, a new one starts
on the next task. Call [ThreadedCompute.close](#close) when you're done with it.

Web Workers only exist in browsers (and Deno and Bun): where there is no global
`Worker`, `canRun` returns `false`, so the `auto` strategy uses another backend.

## Examples

```ts
// Vite and webpack build the worker script when they see this literal
// new Worker(new URL(...)), so keep it written out in full
const threaded = createThreadedCompute({
  createWorker: () =>
    new Worker(new URL('./add.worker.ts', import.meta.url), {
      type: 'module'
    }),
  canRunTasks: ['add']
});

const result = await threaded.runTask<number, number>('add', 5);
```

```ts
const threaded = createThreadedCompute({
  url: '/workers/add.worker.js',
  canRunTasks: ['add']
});
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Worker

## Implements

- [`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new ThreadedCompute(options: ThreadedComputeOptionsInterface): ThreadedCompute;
```

Defined in:
[packages/worker/src/index.ts:162](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L162)

Creates the backend. It checks the options, and starts no worker until the first
task.

#### Parameters

##### options

[`ThreadedComputeOptionsInterface`](../interfaces/ThreadedComputeOptionsInterface.md)

The worker script (`url` or `createWorker`), the tasks it can run and,
optionally, a timeout.

#### Returns

`ThreadedCompute`

#### Throws

For a missing or wrongly typed option.

#### Throws

For a negative timeout.

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[packages/worker/src/index.ts:173](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L173)

Determines if this backend can run the given task.

#### Parameters

##### taskName

`string`

Name of the task.

#### Returns

`boolean`

`true` if the task is in `canRunTasks` and this runtime has Web Workers.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`canRun`](../../core/interfaces/ComputeBackendInterface.md#canrun)

---

### close()

```ts
close(): void;
```

Defined in:
[packages/worker/src/index.ts:300](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L300)

Terminates the worker, if one is running. Tasks still waiting for a reply reject
with a [WorkerTaskError](WorkerTaskError.md). The next task starts a new worker.

#### Returns

`void`

---

### runTask()

```ts
runTask<Input, Output>(
   taskName: string,
   input: Input,
options?: RunTaskOptionsInterface): Promise<Output>;
```

Defined in:
[packages/worker/src/index.ts:200](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L200)

Runs a task in the worker and waits for its reply.

#### Type Parameters

##### Input

`Input`

The input type of the task.

##### Output

`Output`

The output type of the task.

#### Parameters

##### taskName

`string`

The name of the task to run.

##### input

`Input`

The input for the task. It's copied with the structured clone algorithm, so it
can't hold functions or DOM nodes.

##### options?

[`RunTaskOptionsInterface`](../../core/interfaces/RunTaskOptionsInterface.md)

Options for this call. With a `signal`, `runTask` rejects with the signal's
reason as soon as it aborts, and the worker is told to cancel the task.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the reply's `result`. It rejects with a `NoBackendError`
(from `@hybrid-compute/core`) if the task isn't in `canRunTasks`, a `TypeError`
if this runtime has no Web Workers, a [WorkerTaskError](WorkerTaskError.md) if
the task fails, and with the signal's reason if the call is cancelled.

#### Example

```ts
const result = await threaded.runTask('square', 9); // 81
```

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)
