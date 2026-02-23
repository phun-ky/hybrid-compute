[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTransportType

# Type Alias: RemoteTransportType

```ts
type RemoteTransportType = 'fetch' | 'websocket';
```

Defined in:
[types.ts:13](https://github.com/phun-ky/hybrid-compute/blob/2daf6f06b8b3402a7faefa7f5d584c4b5589dd83/packages/remote/src/types.ts#L13)

Represents the communication method used by the `RemoteCompute` backend to
interact with a remote server.

- `'fetch'`: Sends HTTP POST requests for each task.
- `'websocket'`: Maintains a persistent WebSocket connection for bi-directional
  messaging.

## Example

```ts
const transport: RemoteTransportType = 'fetch';
```
