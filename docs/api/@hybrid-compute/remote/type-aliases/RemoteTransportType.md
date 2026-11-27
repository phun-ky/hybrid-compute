[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTransportType

# Type Alias: RemoteTransportType

```ts
type RemoteTransportType = 'fetch' | 'websocket';
```

Defined in:
[packages/remote/src/types.ts:9](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L9)

The transport used to reach the remote service.

- `fetch`: one HTTP `POST` per task, or per batch of tasks with the `batch`
  option.
- `websocket`: one connection, opened on the first task and reused, with tasks
  matched to replies by `id`.
