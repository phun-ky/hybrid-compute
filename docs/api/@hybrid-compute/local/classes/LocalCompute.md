[Documentation](../../../index.md) / [@hybrid-compute/local](../index.md) /
LocalCompute

# Class: LocalCompute

Defined in:
[index.ts:27](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/local/src/index.ts#L27)

LocalCompute is a compute backend that executes tasks directly on the main
thread (synchronously in the JavaScript event loop).

It stores registered tasks in memory and dispatches them by name.

This backend is ideal for lightweight tasks or environments where worker threads
or remote execution are unavailable.

## Example

```ts
const local = new LocalCompute();
local.registerTask({
  name: 'square',
  run: async (n: number) => n * n
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
[index.ts:51](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/local/src/index.ts#L51)

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
[index.ts:41](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/local/src/index.ts#L41)

Registers a new task to be executed by this backend.

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

A named compute task with an async `run` function.

#### Returns

`void`

---

### runTask()

```ts
runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
```

Defined in:
[index.ts:70](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/local/src/index.ts#L70)

Executes a registered task with the given input.

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

A Promise resolving to the task’s output.

#### Throws

If the task is not found in the local registry.

#### Example

```ts
const result = await local.runTask('square', 4); // 16
```

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)
