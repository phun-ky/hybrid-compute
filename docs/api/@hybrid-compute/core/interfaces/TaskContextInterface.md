[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
TaskContextInterface

# Interface: TaskContextInterface

Defined in:
[packages/core/src/types.ts:94](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L94)

What a task's `run` gets besides its input.

## Properties

### progress?

```ts
progress?: (value: unknown) => void;
```

Defined in:
[packages/core/src/types.ts:96](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L96)

Reports progress to the caller's `onProgress`. Calls after the task settles or
is cancelled are dropped. A worker or WebSocket backend sends each value as a
message, so keep them small and clonable.

#### Parameters

##### value

`unknown`

#### Returns

`void`

---

### signal?

```ts
signal?: AbortSignal;
```

Defined in:
[packages/core/src/types.ts:95](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L95)

The signal passed to `runTask`, if any. A long task can check `signal.aborted`
or listen for `abort` to stop early.
