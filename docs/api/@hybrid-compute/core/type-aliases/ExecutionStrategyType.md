[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ExecutionStrategyType

# Type Alias: ExecutionStrategyType

```ts
type ExecutionStrategyType = 'auto' | 'local' | 'worker' | 'remote';
```

Defined in:
[types.ts:14](https://github.com/phun-ky/hybrid-compute/blob/d18b1627450f81cebf05c918aed3d623166849b5/packages/core/src/types.ts#L14)

The strategy used to determine which compute backend to use.

- `auto`: Automatically select the best backend available.
- `local`: Run tasks directly on the main thread.
- `worker`: Offload tasks to WebWorker or thread-based compute.
- `remote`: Offload tasks to a remote server or service.

## Example

```ts
const strategy: ExecutionStrategyType = 'worker';
```
