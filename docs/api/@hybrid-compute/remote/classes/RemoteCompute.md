[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteCompute

# Class: RemoteCompute

Defined in:
[index.ts:47](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/remote/src/index.ts#L47)

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

- [`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md)

## Constructors

### Constructor

```ts
new RemoteCompute(options: RemoteComputeOptionsInterface): RemoteCompute;
```

Defined in:
[index.ts:66](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/remote/src/index.ts#L66)

Initializes the remote compute backend.

#### Parameters

##### options

[`RemoteComputeOptionsInterface`](../interfaces/RemoteComputeOptionsInterface.md)

Transport type and endpoint configuration.

#### Returns

`RemoteCompute`

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[index.ts:91](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/remote/src/index.ts#L91)

Determines if this backend is allowed to handle the given task.

#### Parameters

##### taskName

`string`

Name of the task.

#### Returns

`boolean`

`true` if task is permitted, or if no restrictions are set.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`canRun`](../../core/interfaces/ComputeBackendInterface.md#canrun)

---

### runTask()

```ts
runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
```

Defined in:
[index.ts:105](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/remote/src/index.ts#L105)

Executes the specified task using remote communication.

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

Input data to send.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>

A promise resolving to the result from the server.

#### Implementation of

[`ComputeBackendInterface`](../../core/interfaces/ComputeBackendInterface.md).[`runTask`](../../core/interfaces/ComputeBackendInterface.md#runtask)
