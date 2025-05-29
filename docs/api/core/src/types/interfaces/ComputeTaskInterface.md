<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [core/src/types](../README.md) /
ComputeTaskInterface

# Interface: ComputeTaskInterface\<Input, Output>

> Last updated 2025-05-29T13:00:13.225Z

Defined in:
[core/src/types.ts:33](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L33)

Describes a unit of work that can be executed by a compute backend.

## Example

```ts
const task: ComputeTaskInterface<number, number> = {
  name: 'double',
  run: async (x) => x * 2
};
```

## Type Parameters

| Type Parameter | Default type | Description                           |
| -------------- | ------------ | ------------------------------------- |
| `Input`        | `unknown`    | The input type expected by the task.  |
| `Output`       | `unknown`    | The output type returned by the task. |

## Properties

| Property                 | Type     | Description                              | Defined in                                                                                                 |
| ------------------------ | -------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| <a id="name"></a> `name` | `string` | A unique name used to identify the task. | [core/src/types.ts:34](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L34) |

## Methods

### run()

```ts
run(input): Promise<Output>;
```

Defined in:
[core/src/types.ts:35](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L35)

A function that takes input and returns a Promise of the output.

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `input`   | `Input` |

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
documentation or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).

---

This project created by [Alexander Vassbotn Røyne-Helgesen](http://phun-ky.net)
is licensed under a [MIT License](https://choosealicense.com/licenses/mit/).
