<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [local/src](../README.md) / LocalCompute

# Class: LocalCompute

> Last updated 2025-09-29T08:40:34.182Z

Defined in:
[local/src/index.ts:27](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L27)

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

- [`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md)

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
canRun(taskName): boolean;
```

Defined in:
[local/src/index.ts:51](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L51)

Determines whether the backend has a task by this name.

#### Parameters

| Parameter  | Type     | Description          |
| ---------- | -------- | -------------------- |
| `taskName` | `string` | The task identifier. |

#### Returns

`boolean`

`true` if the task is registered, otherwise `false`.

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`canRun`](../../../core/src/types/interfaces/ComputeBackendInterface.md#canrun)

---

### registerTask()

```ts
registerTask<Input, Output>(task): void;
```

Defined in:
[local/src/index.ts:41](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L41)

Registers a new task to be executed by this backend.

#### Type Parameters

| Type Parameter | Description                           |
| -------------- | ------------------------------------- |
| `Input`        | The input type expected by the task.  |
| `Output`       | The output type returned by the task. |

#### Parameters

| Parameter | Type                                                                                                    | Description                                        |
| --------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `task`    | [`ComputeTaskInterface`](../../../core/src/types/interfaces/ComputeTaskInterface.md)<`Input`, `Output`> | A named compute task with an async `run` function. |

#### Returns

`void`

---

### runTask()

```ts
runTask<Input, Output>(taskName, input): Promise<Output>;
```

Defined in:
[local/src/index.ts:70](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L70)

Executes a registered task with the given input.

#### Type Parameters

| Type Parameter | Description                           |
| -------------- | ------------------------------------- |
| `Input`        | The expected input type of the task.  |
| `Output`       | The expected output type of the task. |

#### Parameters

| Parameter  | Type     | Description                         |
| ---------- | -------- | ----------------------------------- |
| `taskName` | `string` | The name of the task to run.        |
| `input`    | `Input`  | The input data to pass to the task. |

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
