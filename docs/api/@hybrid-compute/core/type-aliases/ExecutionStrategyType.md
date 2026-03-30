[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ExecutionStrategyType

# Type Alias: ExecutionStrategyType

```ts
type ExecutionStrategyType = 'auto' | 'local' | 'worker' | 'remote';
```

Defined in:
[types.ts:14](https://github.com/phun-ky/hybrid-compute/blob/bb27d092566034ca0db7820e6d72140b6acace60/packages/core/src/types.ts#L14)

The strategy used to determine which compute backend to use.

- `auto`: Automatically select the best backend available.
- `local`: Run tasks directly on the main thread.
- `worker`: Offload tasks to WebWorker or thread-based compute.
- `remote`: Offload tasks to a remote server or service.

## Example

```ts
const strategy: ExecutionStrategyType = 'worker';
```
