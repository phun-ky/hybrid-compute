<div><img alt="hybrid-compute logo" src="https://raw.githubusercontent.com/phun-ky/hybrid-compute/main/public/logo-hybrid-compute-horizontal-colored-package.svg?raw=true" style="max-height:32px;"/></div>

[hybrid-compute](../../../README.md) / [remote/src](../README.md) /
RemoteCompute

# Class: RemoteCompute

> Last updated 2025-05-29T13:00:13.313Z

Defined in:
[remote/src/index.ts:29](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L29)

RemoteCompute is a backend that delegates task execution to a remote service
over HTTP (`fetch`) or a persistent WebSocket connection.

It supports task registration via `canRunTasks` and routes input/output using a
JSON-based messaging protocol. Each task request is assigned a unique ID to
match responses (especially important for WebSocket communication).

## Example

```ts
const remote = new RemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['generateReport']
});

const result = await remote.runTask('generateReport', { userId: 'abc123' });
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
[remote/src/index.ts:50](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L50)

Constructs a RemoteCompute backend with either fetch or WebSocket transport.

#### Parameters

| Parameter | Type                                                                                    | Description                                                                        |
| --------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `options` | [`RemoteComputeOptionsInterface`](../types/interfaces/RemoteComputeOptionsInterface.md) | Configuration including transport type, endpoint URL, and optional task whitelist. |

#### Returns

`RemoteCompute`

## Methods

### canRun()

```ts
canRun(taskName): boolean;
```

Defined in:
[remote/src/index.ts:75](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L75)

Checks whether this backend can execute a specific task.

#### Parameters

| Parameter  | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| `taskName` | `string` | The name of the task to check. |

#### Returns

`boolean`

`true` if the task is allowed or unrestricted, `false` otherwise.

#### Implementation of

[`ComputeBackendInterface`](../../../core/src/types/interfaces/ComputeBackendInterface.md).[`canRun`](../../../core/src/types/interfaces/ComputeBackendInterface.md#canrun)

---

### runTask()

```ts
runTask<Input, Output>(taskName, input): Promise<Output>;
```

Defined in:
[remote/src/index.ts:95](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L95)

Runs a task using the remote backend, via HTTP or WebSocket transport.

#### Type Parameters

| Type Parameter | Description                                        |
| -------------- | -------------------------------------------------- |
| `Input`        | Input data structure expected by the task.         |
| `Output`       | Expected output structure returned by the backend. |

#### Parameters

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `taskName` | `string` | The task to run.         |
| `input`    | `Input`  | Input data for the task. |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the output.

#### Throws

If transport fails or task is rejected remotely.

#### Example

```ts
const output = await remote.runTask('translateText', { text: 'hello' });
```

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
documentation or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).

---

This project created by [Alexander Vassbotn Røyne-Helgesen](http://phun-ky.net)
is licensed under a [MIT License](https://choosealicense.com/licenses/mit/).
