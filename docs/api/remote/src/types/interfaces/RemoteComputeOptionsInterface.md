<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [remote/src/types](../README.md) /
RemoteComputeOptionsInterface

# Interface: RemoteComputeOptionsInterface

> Last updated 2025-06-01T19:11:58.582Z

Defined in:
[remote/src/types.ts:34](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L34)

Configuration options for initializing a `RemoteCompute` backend.

## Example

```ts
const options: RemoteComputeOptionsInterface = {
  transport: 'websocket',
  endpoint: 'wss://api.example.com/ws',
  canRunTasks: ['resizeImage', 'generatePDF']
};
```

## See

- https://developer.mozilla.org/en-US/docs/Web/API/fetch
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Properties

| Property                                | Type                                                            | Description                                                                                                          | Defined in                                                                                                     |
| --------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="canruntasks"></a> `canRunTasks?` | `string`\[]                                                     | An optional list of task names this backend can handle. If omitted, it is assumed the backend can attempt all tasks. | [remote/src/types.ts:37](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L37) |
| <a id="endpoint"></a> `endpoint`        | `string`                                                        | The server URL for handling task requests.                                                                           | [remote/src/types.ts:36](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L36) |
| <a id="transport"></a> `transport`      | [`RemoteTransportType`](../type-aliases/RemoteTransportType.md) | The transport mechanism to use (`fetch` or `websocket`).                                                             | [remote/src/types.ts:35](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L35) |

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

![@hybrid-compute banner with logo and text](https://github.com/phun-ky/speccer/blob/main/public/logo-banner.png?raw=true)

---

This project created by [Alexander Vassbotn Røyne-Helgesen](http://phun-ky.net)
is licensed under a [MIT License](https://choosealicense.com/licenses/mit/).
