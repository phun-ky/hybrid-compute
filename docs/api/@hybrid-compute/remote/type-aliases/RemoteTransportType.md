[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTransportType

# Type Alias: RemoteTransportType

```ts
type RemoteTransportType = 'fetch' | 'websocket';
```

Defined in:
[types.ts:13](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/remote/src/types.ts#L13)

Represents the communication method used by the `RemoteCompute` backend to
interact with a remote server.

- `'fetch'`: Sends HTTP POST requests for each task.
- `'websocket'`: Maintains a persistent WebSocket connection for bi-directional
  messaging.

## Example

```ts
const transport: RemoteTransportType = 'fetch';
```
