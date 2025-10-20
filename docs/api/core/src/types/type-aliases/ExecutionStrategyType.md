<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [core/src/types](../README.md) /
ExecutionStrategyType

# Type Alias: ExecutionStrategyType

> Last updated 2025-10-20T07:10:16.193Z

```ts
type ExecutionStrategyType = 'auto' | 'local' | 'worker' | 'remote';
```

Defined in:
[core/src/types.ts:14](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L14)

The strategy used to determine which compute backend to use.

- `auto`: Automatically select the best backend available.
- `local`: Run tasks directly on the main thread.
- `worker`: Offload tasks to WebWorker or thread-based compute.
- `remote`: Offload tasks to a remote server or service.

## Example

```ts
const strategy: ExecutionStrategyType = 'worker';
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
