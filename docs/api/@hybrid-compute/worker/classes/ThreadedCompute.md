[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
ThreadedCompute

# Class: ThreadedCompute

Defined in:
[index.ts:27](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/worker/src/index.ts#L27)

`ThreadedCompute` is a compute backend that runs tasks in a dedicated Web
Worker.

It manages communication with the worker via `postMessage`, assigns unique task
request IDs, and resolves results asynchronously. Tasks are registered by name
during construction and mapped internally for availability checks.

## Example

```ts
const threaded = new ThreadedCompute(new URL('./worker.js', import.meta.url), [
  'add'
]);

const result = await threaded.runTask<number, number>('add', 5);
console.log(result); // Output from worker
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Worker

## Implements

- [`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new ThreadedCompute(workerPath: string, taskNames: string[]): ThreadedCompute;
```

Defined in:
[index.ts:47](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/worker/src/index.ts#L47)

Constructs a new `ThreadedCompute` backend with a specified worker and list of
available task names.

#### Parameters

##### workerPath

`string`

Path to the worker script (typically a URL via `import.meta.url`).

##### taskNames

`string`\[]

A list of task identifiers this worker is capable of executing.

#### Returns

`ThreadedCompute`

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[index.ts:68](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/worker/src/index.ts#L68)

Checks whether the current worker is registered to handle a given task.

#### Parameters

##### taskName

`string`

The name of the task to check.

#### Returns

`boolean`

`true` if the task is supported, otherwise `false`.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`canRun`](../../core/interfaces/ComputeBackendInterface.md#canrun)

---

### runTask()

```ts
runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
```

Defined in:
[index.ts:90](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/worker/src/index.ts#L90)

Runs a task inside the Web Worker.

The task is assigned a unique ID and sent via `postMessage`. The result or error
is resolved asynchronously when the worker responds.

#### Type Parameters

##### Input

`Input`

The input type for the task.

##### Output

`Output`

The output type returned by the task.

#### Parameters

##### taskName

`string`

The name of the task to execute.

##### input

`Input`

The input payload for the task.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task output.

#### Example

```ts
const result = await threaded.runTask('square', 9); // 81
```

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)
