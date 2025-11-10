<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [core/src/types](../README.md) /
ComputeBackendInterface

# Interface: ComputeBackendInterface

> Last updated 2025-11-10T09:41:49.352Z

Defined in:
[core/src/types.ts:59](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L59)

Represents a backend capable of executing registered compute tasks.

Each backend must be able to:

- Determine if it can run a given task (`canRun`)
- Execute a named task with input and return a Promise of output (`runTask`)

## Template

The input type for task execution.

## Template

The output type for task execution.

## Example

```ts
const backend: ComputeBackendInterface = {
  canRun: (taskName) => taskName === 'double',
  runTask: async (taskName, input) => {
    if (taskName === 'double') return (input as number) * 2;
    throw new Error('Unknown task');
  }
};
```

## Methods

### canRun()

```ts
canRun(taskName): boolean;
```

Defined in:
[core/src/types.ts:60](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L60)

#### Parameters

| Parameter  | Type     |
| ---------- | -------- |
| `taskName` | `string` |

#### Returns

`boolean`

---

### runTask()

```ts
runTask<Input, Output>(taskName, input): Promise<Output>;
```

Defined in:
[core/src/types.ts:61](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L61)

#### Type Parameters

| Type Parameter |
| -------------- |
| `Input`        |
| `Output`       |

#### Parameters

| Parameter  | Type     |
| ---------- | -------- |
| `taskName` | `string` |
| `input`    | `Input`  |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

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
