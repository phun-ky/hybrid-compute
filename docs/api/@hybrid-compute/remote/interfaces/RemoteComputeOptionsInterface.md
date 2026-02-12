[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteComputeOptionsInterface

# Interface: RemoteComputeOptionsInterface

Defined in:
[types.ts:34](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/remote/src/types.ts#L34)

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

### canRunTasks?

```ts
optional canRunTasks: string[];
```

Defined in:
[types.ts:37](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/remote/src/types.ts#L37)

An optional list of task names this backend can handle. If omitted, it is
assumed the backend can attempt all tasks.

---

### endpoint

```ts
endpoint: string;
```

Defined in:
[types.ts:36](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/remote/src/types.ts#L36)

The server URL for handling task requests.

---

### transport

```ts
transport: RemoteTransportType;
```

Defined in:
[types.ts:35](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/remote/src/types.ts#L35)

The transport mechanism to use (`fetch` or `websocket`).
