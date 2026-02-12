[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridCompute

# Class: HybridCompute

Defined in:
[index.ts:32](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/index.ts#L32)

The HybridCompute class acts as an orchestrator to delegate compute tasks across
different backends (local, worker, or remote) using a flexible strategy.

It supports four strategies:

- `'local'`: Forces execution on the local (main thread) backend.
- `'worker'`: Forces execution on a threaded/WebWorker backend.
- `'remote'`: Forces execution on a remote/server backend.
- `'auto'`: Automatically selects the first available backend that supports the
  task.

## Example

```ts
const compute = new HybridCompute({
  local: createLocalCompute(),
  worker: createThreadedCompute(workerPath, ['double']),
  remote: createRemoteCompute({ transport: 'fetch', endpoint: '/api/compute' })
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
[index.ts:40](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/index.ts#L40)

Creates a new HybridCompute orchestrator.

#### Parameters

##### backends

[`HybridComputeOptionsInterface`](../interfaces/HybridComputeOptionsInterface.md)

An object containing optional local, worker, and remote backends.

#### Returns

`HybridCompute`

## Methods

### runTask()

```ts
runTask<Input, Output>(
   taskName: string,
   input: Input,
strategy?: ExecutionStrategyType): Promise<Output>;
```

Defined in:
[index.ts:65](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/index.ts#L65)

Runs a task using the specified execution strategy.

If `strategy` is `'auto'`, it will try the worker, then local, then remote
backend in order of priority.

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

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task's output.

#### Throws

If no backend is available or able to run the task.

#### Example

```ts
const output = await compute.runTask('greetUser', { name: 'Alice' }, 'worker');
```
