<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [worker/src](../README.md) /
ThreadedCompute

# Class: ThreadedCompute

> Last updated 2025-06-09T10:17:02.705Z

Defined in:
[worker/src/index.ts:27](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L27)

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

- [`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new ThreadedCompute(workerPath, taskNames): ThreadedCompute;
```

Defined in:
[worker/src/index.ts:47](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L47)

Constructs a new `ThreadedCompute` backend with a specified worker and list of
available task names.

#### Parameters

| Parameter    | Type        | Description                                                        |
| ------------ | ----------- | ------------------------------------------------------------------ |
| `workerPath` | `string`    | Path to the worker script (typically a URL via `import.meta.url`). |
| `taskNames`  | `string`\[] | A list of task identifiers this worker is capable of executing.    |

#### Returns

`ThreadedCompute`

## Methods

### canRun()

```ts
canRun(taskName): boolean;
```

Defined in:
[worker/src/index.ts:68](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L68)

Checks whether the current worker is registered to handle a given task.

#### Parameters

| Parameter  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `taskName` | `string` | The name of the task to check. |

#### Returns

`boolean`

`true` if the task is supported, otherwise `false`.

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`canRun`](../../../core/src/types/interfaces/ComputeBackendInterface.md#canrun)

---

### runTask()

```ts
runTask<Input, Output>(taskName, input): Promise<Output>;
```

Defined in:
[worker/src/index.ts:90](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L90)

Runs a task inside the Web Worker.

The task is assigned a unique ID and sent via `postMessage`. The result or error
is resolved asynchronously when the worker responds.

#### Type Parameters

| Type Parameter | Description                           |
| -------------- | ------------------------------------- |
| `Input`        | The input type for the task.          |
| `Output`       | The output type returned by the task. |

#### Parameters

| Parameter  | Type     | Description                      |
| ---------- | -------- | -------------------------------- |
| `taskName` | `string` | The name of the task to execute. |
| `input`    | `Input`  | The input payload for the task.  |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the task output.

#### Example

```ts
const result = await threaded.runTask('square', 9); // 81
```

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`runTask`](../../../core/src/types/interfaces/ComputeBackendInterface.md#runtask)

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
