[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerProgressMessageInterface

# Interface: WorkerProgressMessageInterface

Defined in:
[packages/worker/src/types.ts:99](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L99)

What the worker script sends while a task runs: the task's `id` and a `progress`
value, passed to the caller's `onProgress`. Any number may come before the
result; any message with a `progress` key is one of these. It doesn't reset the
timeout.

## Example

```ts
self.postMessage({
  id: 1,
  progress: 50
} satisfies WorkerProgressMessageInterface);
```

## Properties

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:100](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L100)

---

### progress

```ts
progress: unknown;
```

Defined in:
[packages/worker/src/types.ts:101](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L101)
