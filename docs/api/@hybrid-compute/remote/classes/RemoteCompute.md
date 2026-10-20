[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteCompute

# Class: RemoteCompute

Defined in:
[packages/remote/src/index.ts:208](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L208)

RemoteCompute is a backend that sends tasks to a remote service, over HTTP with
fetch or over a WebSocket.

Each task is one JSON request and one JSON reply; see
[RemoteTaskRequestInterface](../interfaces/RemoteTaskRequestInterface.md) and
[RemoteTaskResponseInterface](../interfaces/RemoteTaskResponseInterface.md) for
the message format. Every failure (an `error` in the reply, an unusable
response, a timeout, an unreachable server) rejects with a
[RemoteTaskError](RemoteTaskError.md).

The WebSocket transport connects on the first task, not when it's created,
reuses the connection, and connects again on the next task after it closes. Call
[RemoteCompute.close](#close) when you're done with it.

## Examples

```ts
const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['translateText']
});

const result = await remote.runTask('translateText', { text: 'hello' });
```

```ts
const remote = createRemoteCompute({
  transport: 'websocket',
  endpoint: 'wss://api.example.com/ws',
  canRunTasks: ['analyzeSentiment']
});

const result = await remote.runTask('analyzeSentiment', { text: 'It works!' });

remote.close();
```

## See

- https://developer.mozilla.org/en-US/docs/Web/API/fetch
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Implements

- [`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new RemoteCompute(options: RemoteComputeOptionsInterface): RemoteCompute;
```

Defined in:
[packages/remote/src/index.ts:227](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L227)

Creates the backend. It checks the options, and does no network I/O until the
first task.

#### Parameters

##### options

[`RemoteComputeOptionsInterface`](../interfaces/RemoteComputeOptionsInterface.md)

The transport, endpoint, allowed tasks and, optionally, a timeout and fetch
headers.

#### Returns

`RemoteCompute`

#### Throws

For a missing or wrongly typed option.

#### Throws

For an unknown transport, an endpoint with the wrong URL scheme, or a negative
timeout.

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[packages/remote/src/index.ts:238](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L238)

Determines if this backend may run the given task.

#### Parameters

##### taskName

`string`

Name of the task.

#### Returns

`boolean`

`true` if the task is in `canRunTasks`, or if `canRunTasks` is `'*'`.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`canRun`](../../core/interfaces/ComputeBackendInterface.md#canrun)

---

### close()

```ts
close(): void;
```

Defined in:
[packages/remote/src/index.ts:279](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L279)

Closes the WebSocket, if one is open or opening. Tasks still waiting for a reply
reject with a [RemoteTaskError](RemoteTaskError.md). The next task opens a new
connection. Does nothing for the fetch transport.

#### Returns

`void`

---

### runTask()

```ts
runTask<Input, Output>(
   taskName: string,
   input: Input,
options?: RunTaskOptionsInterface): Promise<Output>;
```

Defined in:
[packages/remote/src/index.ts:258](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L258)

Sends a task to the remote service and waits for its reply.

#### Type Parameters

##### Input

`Input`

The input data structure expected by the task.

##### Output

`Output`

The output structure returned by the task.

#### Parameters

##### taskName

`string`

Name of the remote task.

##### input

`Input`

Input data to send. It must be serialisable as JSON.

##### options?

[`RunTaskOptionsInterface`](../../core/interfaces/RunTaskOptionsInterface.md)

Options for this call, such as an `AbortSignal`.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A Promise resolving to the reply's `result`. It rejects with a
[RemoteTaskError](RemoteTaskError.md) if the task fails, the reply is unusable,
the timeout passes or the server can't be reached, and with the signal's reason
if the call is cancelled.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)
