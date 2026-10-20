[Documentation](../../../index.md) / [@hybrid-compute/local](../index.md) /
LocalCompute

# Class: LocalCompute

Defined in:
[index.ts:45](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L45)

LocalCompute is a compute backend that runs tasks on the calling thread: the
main thread in a page, or whichever worker or Node.js thread creates it.

It keeps the registered tasks in memory and runs them by name. A task's
synchronous work runs before `runTask` returns, so it suits small, cheap tasks;
heavy work belongs in the worker backend.

## Example

```ts
const local = new LocalCompute();

local.registerTask({
  name: 'square',
  run: (n: number) => n * n
});

const result = await local.runTask<number, number>('square', 5);
console.log(result); // 25
```

## Implements

- [`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new LocalCompute(): LocalCompute;
```

#### Returns

`LocalCompute`

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[index.ts:112](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L112)

Determines whether the backend has a task by this name.

#### Parameters

##### taskName

`string`

The task identifier.

#### Returns

`boolean`

`true` if the task is registered, otherwise `false`.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`canRun`](../../core/interfaces/ComputeBackendInterface.md#canrun)

---

### registerTask()

```ts
registerTask<Input, Output>(task: ComputeTaskInterface<Input, Output>): void;
```

Defined in:
[index.ts:63](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L63)

Registers a task with this backend. The task is copied, so changing the object
afterwards has no effect.

#### Type Parameters

##### Input

`Input`

The input type expected by the task.

##### Output

`Output`

The output type returned by the task.

#### Parameters

##### task

[`ComputeTaskInterface`](../../core/interfaces/ComputeTaskInterface.md)<`Input`,
`Output`>

A task with a unique, non-empty `name` and a `run` function, which may return
the output or a Promise of it.

#### Returns

`void`

#### Throws

If `task` isn't an object, its `name` isn't a non-empty string, or it has no
`run` function.

#### Throws

If a task with the same name is already registered. Call
[LocalCompute.unregisterTask](#unregistertask) first to replace it.

---

### runTask()

```ts
runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
```

Defined in:
[index.ts:132](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L132)

Runs a registered task with the given input.

#### Type Parameters

##### Input

`Input`

The expected input type of the task.

##### Output

`Output`

The expected output type of the task.

#### Parameters

##### taskName

`string`

The name of the task to run.

##### input

`Input`

The input data to pass to the task.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task's output. It rejects with a `NoBackendError`
(from `@hybrid-compute/core`) if no task has that name, and with whatever the
task throws or rejects with.

#### Example

```ts
const result = await local.runTask('square', 4); // 16
```

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)

---

### unregisterTask()

```ts
unregisterTask(taskName: string): boolean;
```

Defined in:
[index.ts:102](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L102)

Removes a registered task.

#### Parameters

##### taskName

`string`

The name of the task to remove.

#### Returns

`boolean`

`true` if a task was removed, `false` if none had that name.
