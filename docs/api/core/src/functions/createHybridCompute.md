<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [core/src](../README.md) /
createHybridCompute

# Function: createHybridCompute()

> Last updated 2025-07-07T13:14:13.657Z

```ts
function createHybridCompute(backends): HybridCompute;
```

Defined in:
[core/src/index.ts:108](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L108)

Factory function for creating a HybridCompute instance.

## Parameters

| Parameter  | Type                                                                                    | Description                                          |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `backends` | [`HybridComputeOptionsInterface`](../types/interfaces/HybridComputeOptionsInterface.md) | Configuration options specifying available backends. |

## Returns

[`HybridCompute`](../classes/HybridCompute.md)

A new HybridCompute orchestrator.

## Example

```ts
const hybrid = createHybridCompute({ local: createLocalCompute() });
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
