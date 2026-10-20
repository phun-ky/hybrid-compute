[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridCompute

# Class: HybridCompute

Defined in:
[packages/core/src/index.ts:114](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L114)

The HybridCompute class acts as an orchestrator to delegate compute tasks across
different backends (local, worker, or remote) using a flexible strategy.

It supports four strategies:

- `'local'`, `'worker'`, `'remote'`: use that backend, if it is configured and
  its `canRun(taskName)` returns true.
- `'auto'` (the default): use the first backend whose `canRun(taskName)` returns
  true, in the order worker, local, remote.

The constructor checks the backends it's given and keeps a frozen copy.
`createHybridCompute` is the usual way to create one.

## Example

```ts
const compute = new HybridCompute({
  local: createLocalCompute(),
  worker: createThreadedCompute(workerPath, ['double']),
  remote: createRemoteCompute({
    transport: 'fetch',
    endpoint: '/api/compute',
    canRunTasks: ['double']
  })
});

const result = await compute.runTask<number, number>('double', 21, 'auto');
console.log(result); // 42
```

## Constructors

### Constructor

```ts
new HybridCompute(backends: HybridComputeOptionsInterface): HybridCompute;
```

Defined in:
[packages/core/src/index.ts:128](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L128)

Creates a new HybridCompute orchestrator.

#### Parameters

##### backends

[`HybridComputeOptionsInterface`](../interfaces/HybridComputeOptionsInterface.md)

An object with at least one of the local, worker and remote backends. A backend
given as `undefined` is skipped.

#### Returns

`HybridCompute`

#### Throws

If `backends` isn't an object, a backend lacks `canRun` or `runTask`, or no
backend is given.

#### Throws

If `backends` has a key other than local, worker or remote.

## Methods

### runTask()

```ts
runTask<Input, Output>(
   taskName: string,
   input: Input,
   strategy?: ExecutionStrategyType,
options?: RunTaskOptionsInterface): Promise<Output>;
```

Defined in:
[packages/core/src/index.ts:163](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L163)

Runs a task using the specified execution strategy.

With `'auto'`, it tries the worker, then the local, then the remote backend, and
runs the task on the first whose `canRun(taskName)` returns true. With an
explicit strategy, that backend must be configured and its `canRun(taskName)`
must return true.

#### Type Parameters

##### Input

`Input`

The type of the input expected by the task.

##### Output

`Output`

The expected output type returned by the task.

#### Parameters

##### taskName

`string`

The name of the task to execute.

##### input

`Input`

The input payload for the task.

##### strategy?

[`ExecutionStrategyType`](../type-aliases/ExecutionStrategyType.md) = `'auto'`

The execution strategy to use. Defaults to `'auto'`.

##### options?

[`RunTaskOptionsInterface`](../interfaces/RunTaskOptionsInterface.md)

Options for this call, such as an `AbortSignal` to cancel it with. They're
passed on to the backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task's output. It rejects with:

- a `TypeError` if `taskName` isn't a non-empty string or `strategy` isn't a
  string
- a `RangeError` if `strategy` isn't one of `'auto'`, `'local'`, `'worker'` or
  `'remote'`
- a [NoBackendError](NoBackendError.md) if no configured backend can run the
  task
- the signal's reason, if `options.signal` is or becomes aborted
- whatever the backend's `runTask` rejects with

#### Example

```ts
const output = await compute.runTask('greetUser', { name: 'Alice' }, 'worker');
```
