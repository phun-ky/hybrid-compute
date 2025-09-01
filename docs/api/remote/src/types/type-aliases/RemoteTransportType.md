<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [remote/src/types](../README.md) /
RemoteTransportType

# Type Alias: RemoteTransportType

> Last updated 2025-09-01T12:36:29.192Z

```ts
type RemoteTransportType = 'fetch' | 'websocket';
```

Defined in:
[remote/src/types.ts:13](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L13)

Represents the communication method used by the `RemoteCompute` backend to
interact with a remote server.

- `'fetch'`: Sends HTTP POST requests for each task.
- `'websocket'`: Maintains a persistent WebSocket connection for bi-directional
  messaging.

## Example

```ts
const transport: RemoteTransportType = 'fetch';
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
