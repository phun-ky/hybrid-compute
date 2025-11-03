<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [core/src/types](../README.md) /
HybridComputeOptionsInterface

# Interface: HybridComputeOptionsInterface

> Last updated 2025-11-03T12:14:12.573Z

Defined in:
[core/src/types.ts:84](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L84)

Configuration options for initializing the HybridCompute orchestrator.

Backends are optional, and can be combined or omitted based on the environment
or needs.

## Example

```ts
const options: HybridComputeOptionsInterface = {
  local: createLocalCompute(),
  remote: createRemoteCompute({ ... })
};
```

## See

- https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Properties

| Property                      | Type                                                    | Description                                           | Defined in                                                                                                 |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| <a id="local"></a> `local?`   | [`ComputeBackendInterface`](ComputeBackendInterface.md) | A local synchronous compute backend (main thread).    | [core/src/types.ts:85](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L85) |
| <a id="remote"></a> `remote?` | [`ComputeBackendInterface`](ComputeBackendInterface.md) | A server-side or cloud compute backend.               | [core/src/types.ts:87](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L87) |
| <a id="worker"></a> `worker?` | [`ComputeBackendInterface`](ComputeBackendInterface.md) | A background-thread compute backend (e.g. WebWorker). | [core/src/types.ts:86](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L86) |

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
