[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
BackendNameType

# Type Alias: BackendNameType

```ts
type BackendNameType = Exclude<ExecutionStrategyType, 'auto'>;
```

Defined in:
[packages/core/src/types.ts:165](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L165)

The name of a backend: its key in the backends object, and its strategy.
