<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [core/src](../README.md) / HybridCompute

# Class: HybridCompute

> Last updated 2025-10-13T06:51:07.117Z

Defined in:
[core/src/index.ts:32](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L32)

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
new HybridCompute(backends): HybridCompute;
```

Defined in:
[core/src/index.ts:40](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L40)

Creates a new HybridCompute orchestrator.

#### Parameters

| Parameter  | Type                                                                                    | Description                                                       |
| ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `backends` | [`HybridComputeOptionsInterface`](../types/interfaces/HybridComputeOptionsInterface.md) | An object containing optional local, worker, and remote backends. |

#### Returns

`HybridCompute`

## Methods

### runTask()

```ts
runTask<Input, Output>(
   taskName,
   input,
strategy): Promise<Output>;
```

Defined in:
[core/src/index.ts:65](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L65)

Runs a task using the specified execution strategy.

If `strategy` is `'auto'`, it will try the worker, then local, then remote
backend in order of priority.

#### Type Parameters

| Type Parameter | Description                                    |
| -------------- | ---------------------------------------------- |
| `Input`        | The type of the input expected by the task.    |
| `Output`       | The expected output type returned by the task. |

#### Parameters

| Parameter  | Type                                                                      | Default value | Description                                          |
| ---------- | ------------------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `taskName` | `string`                                                                  | `undefined`   | The name of the task to execute.                     |
| `input`    | `Input`                                                                   | `undefined`   | The input payload for the task.                      |
| `strategy` | [`ExecutionStrategyType`](../types/type-aliases/ExecutionStrategyType.md) | `'auto'`      | The execution strategy to use. Defaults to `'auto'`. |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task's output.

#### Throws

If no backend is available or able to run the task.

#### Example

```ts
const output = await compute.runTask('greetUser', { name: 'Alice' }, 'worker');
```

---

**Contributing**

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md)

**Sponsor me**

I'm an Open Source evangelist, creating stuff that does not exist yet to help
get rid of secondary activities and to enhance systems already in place, be it
documentation, tools or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).

![@hybrid-compute banner with logo and text](https://github.com/phun-ky/hybrid-compute/blob/main/public/logo-banner.png?raw=true)

---

This project created by [Alexander Vassbotn Røyne-Helgesen](http://phun-ky.net)
is licensed under a [MIT License](https://choosealicense.com/licenses/mit/).
