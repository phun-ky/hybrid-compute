[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ExecutionStrategyType

# Type Alias: ExecutionStrategyType

```ts
type ExecutionStrategyType = 'auto' | 'local' | 'worker' | 'remote';
```

Defined in:
[packages/core/src/types.ts:17](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L17)

The strategy used to determine which compute backend to use.

- `auto`: the first backend whose `canRun` returns true, in the order worker,
  local, remote.
- `local`: the local backend, which runs tasks on the calling thread.
- `worker`: the worker backend, which runs tasks in a Web Worker.
- `remote`: the remote backend, which sends tasks to a server or service.

An explicit strategy uses that backend only if its `canRun` returns true.

## Example

```ts
const strategy: ExecutionStrategyType = 'worker';
```
