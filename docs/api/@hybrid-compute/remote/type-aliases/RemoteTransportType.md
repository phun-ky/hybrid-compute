[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTransportType

# Type Alias: RemoteTransportType

```ts
type RemoteTransportType = 'fetch' | 'websocket';
```

Defined in:
[packages/remote/src/types.ts:8](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L8)

The transport used to reach the remote service.

- `fetch`: one HTTP `POST` per task.
- `websocket`: one connection, opened on the first task and reused, with tasks
  matched to replies by `id`.
