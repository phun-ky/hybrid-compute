[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteComputeOptionsInterface

# Interface: RemoteComputeOptionsInterface

Defined in:
[packages/remote/src/types.ts:45](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L45)

Options for [createRemoteCompute](../functions/createRemoteCompute.md).

## Example

```ts
const options: RemoteComputeOptionsInterface = {
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['translate'],
  timeout: 10_000,
  headers: async () => ({ Authorization: `Bearer ${await getToken()}` })
};
```

## Properties

### canRunTasks

```ts
canRunTasks: readonly string[] | "*";
```

Defined in:
[packages/remote/src/types.ts:48](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L48)

The tasks this backend may run, or `'*'` for every task. Every task it accepts
is sent over the network, so with the `auto` strategy, `'*'` means any task no
worker or local backend can run goes to the remote service.

---

### endpoint

```ts
endpoint: string;
```

Defined in:
[packages/remote/src/types.ts:47](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L47)

The URL to send tasks to: `http:` or `https:` for fetch (a relative URL works in
a browser page), `ws:` or `wss:` for WebSocket.

---

### headers?

```ts
optional headers?: RemoteHeadersType;
```

Defined in:
[packages/remote/src/types.ts:50](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L50)

Extra request headers for the fetch transport.

---

### timeout?

```ts
optional timeout?: number;
```

Defined in:
[packages/remote/src/types.ts:49](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L49)

How long to wait for a reply, in milliseconds, before rejecting with a
`RemoteTaskError`. Defaults to 30000; `0` waits forever.

---

### transport

```ts
transport: RemoteTransportType;
```

Defined in:
[packages/remote/src/types.ts:46](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L46)

`'fetch'` or `'websocket'`.
