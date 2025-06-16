<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [worker/src/types](../README.md) /
WorkerResultMessageInterface

# Interface: WorkerResultMessageInterface

> Last updated 2025-06-16T18:17:28.393Z

Defined in:
[worker/src/types.ts:48](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L48)

The message format sent from a Web Worker back to the main thread upon task
completion.

This message includes the result of the task execution or an error message if
the task failed.

## Example

```ts
const response: WorkerResultMessageInterface = {
  id: 1,
  result: 42
};
postMessage(response);
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Using\_web\_workers

## Properties

| Property                     | Type     | Description                                                        | Defined in                                                                                                     |
| ---------------------------- | -------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| <a id="error"></a> `error?`  | `string` | An optional error message if the task failed.                      | [worker/src/types.ts:52](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L52) |
| <a id="id"></a> `id`         | `number` | The unique identifier that matches a previously sent task message. | [worker/src/types.ts:49](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L49) |
| <a id="result"></a> `result` | `any`    | The result of the task execution (if successful).                  | [worker/src/types.ts:51](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L51) |

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
