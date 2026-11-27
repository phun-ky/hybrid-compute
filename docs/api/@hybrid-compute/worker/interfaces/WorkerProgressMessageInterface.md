[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerProgressMessageInterface

# Interface: WorkerProgressMessageInterface

Defined in:
[packages/worker/src/types.ts:105](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L105)

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
[packages/worker/src/types.ts:106](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L106)

---

### progress

```ts
progress: unknown;
```

Defined in:
[packages/worker/src/types.ts:107](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L107)
