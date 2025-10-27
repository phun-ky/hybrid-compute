<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../../README.md) / [worker/src/types](../README.md) /
WorkerTaskMessageInterface

# Interface: WorkerTaskMessageInterface

> Last updated 2025-10-27T10:56:59.431Z

Defined in:
[worker/src/types.ts:21](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L21)

The message format sent from the main thread to a Web Worker when executing a
task.

This message includes a task name, its input payload, and a unique ID used to
match the response from the worker.

## Example

```ts
const message: WorkerTaskMessageInterface = {
  task: 'double',
  input: 21,
  id: 1
};
worker.postMessage(message);
```

## Properties

| Property                   | Type     | Description                                                           | Defined in                                                                                                     |
| -------------------------- | -------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <a id="id"></a> `id`       | `number` | A unique identifier for correlating the response message.             | [worker/src/types.ts:25](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L25) |
| <a id="input"></a> `input` | `any`    | The input data for the task. This can be any JSON-serializable value. | [worker/src/types.ts:24](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L24) |
| <a id="task"></a> `task`   | `string` | The name of the task to be executed in the worker.                    | [worker/src/types.ts:22](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L22) |

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
