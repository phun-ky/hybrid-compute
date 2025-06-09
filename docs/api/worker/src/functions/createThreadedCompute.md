<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [worker/src](../README.md) /
createThreadedCompute

# Function: createThreadedCompute()

> Last updated 2025-06-09T10:17:02.732Z

```ts
function createThreadedCompute(workerPath, tasks): ThreadedCompute;
```

Defined in:
[worker/src/index.ts:116](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L116)

Factory function to create a new `ThreadedCompute` backend.

## Parameters

| Parameter    | Type        | Description                                                                   |
| ------------ | ----------- | ----------------------------------------------------------------------------- |
| `workerPath` | `string`    | The module worker file path (e.g. `new URL('./worker.js', import.meta.url)`). |
| `tasks`      | `string`\[] | A list of supported task names this worker can execute.                       |

## Returns

[`ThreadedCompute`](../classes/ThreadedCompute.md)

A new `ThreadedCompute` instance.

## Example

```ts
const backend = createThreadedCompute(new URL('./worker.js', import.meta.url), [
  'resizeImage'
]);
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
