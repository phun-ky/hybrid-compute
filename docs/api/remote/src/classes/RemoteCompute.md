<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [remote/src](../README.md) /
RemoteCompute

# Class: RemoteCompute

> Last updated 2025-06-23T06:09:48.343Z

Defined in:
[remote/src/index.ts:47](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L47)

RemoteCompute is a backend that delegates compute tasks to a remote API using
either HTTP requests (fetch) or a persistent WebSocket connection.

It supports bidirectional communication, which is useful for low-latency or
streaming scenarios using WebSocket, or traditional stateless interaction using
fetch.

## Remarks

WebSocket-based transport allows concurrent request handling via an internal
request/response map using `id`. This is useful when running multiple tasks in
parallel.

Fetch transport is simpler and more interoperable with typical REST APIs.

## Examples

```ts
const remote = new RemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['translateText']
});

const result = await remote.runTask('translateText', { text: 'hello' });
```

```ts
const remote = new RemoteCompute({
  transport: 'websocket',
  endpoint: 'wss://api.example.com/ws',
  canRunTasks: ['analyzeSentiment']
});

const result = await remote.runTask('analyzeSentiment', { text: 'It works!' });
```

## See

- https://developer.mozilla.org/en-US/docs/Web/API/fetch
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Implements

- [`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new RemoteCompute(options): RemoteCompute;
```

Defined in:
[remote/src/index.ts:66](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L66)

Initializes the remote compute backend.

#### Parameters

| Parameter | Type                                                                                    | Description                                |
| --------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| `options` | [`RemoteComputeOptionsInterface`](../types/interfaces/RemoteComputeOptionsInterface.md) | Transport type and endpoint configuration. |

#### Returns

`RemoteCompute`

## Methods

### canRun()

```ts
canRun(taskName): boolean;
```

Defined in:
[remote/src/index.ts:91](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L91)

Determines if this backend is allowed to handle the given task.

#### Parameters

| Parameter  | Type     | Description       |
| ---------- | -------- | ----------------- |
| `taskName` | `string` | Name of the task. |

#### Returns

`boolean`

`true` if task is permitted, or if no restrictions are set.

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`canRun`](../../../core/src/types/interfaces/ComputeBackendInterface.md#canrun)

---

### runTask()

```ts
runTask<Input, Output>(taskName, input): Promise<Output>;
```

Defined in:
[remote/src/index.ts:105](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L105)

Executes the specified task using remote communication.

#### Type Parameters

| Type Parameter | Description                                    |
| -------------- | ---------------------------------------------- |
| `Input`        | The input data structure expected by the task. |
| `Output`       | The output structure returned by the task.     |

#### Parameters

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `taskName` | `string` | Name of the remote task. |
| `input`    | `Input`  | Input data to send.      |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A promise resolving to the result from the server.

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`runTask`](../../../core/src/types/interfaces/ComputeBackendInterface.md#runtask)

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
