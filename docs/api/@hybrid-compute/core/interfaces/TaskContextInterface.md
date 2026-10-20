[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
TaskContextInterface

# Interface: TaskContextInterface

Defined in:
[packages/core/src/types.ts:69](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L69)

What a task's `run` gets besides its input.

## Properties

### signal?

```ts
optional signal?: AbortSignal;
```

Defined in:
[packages/core/src/types.ts:70](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L70)

The signal passed to `runTask`, if any. A long task can check `signal.aborted`
or listen for `abort` to stop early.
