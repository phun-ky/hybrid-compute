[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerCancelMessageInterface

# Interface: WorkerCancelMessageInterface

Defined in:
[packages/worker/src/types.ts:57](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L57)

What the worker script receives when a task is cancelled or times out: the
task's `id` and `cancel: true`. [exposeTasks](../functions/exposeTasks.md)
aborts the task's signal; a hand written worker script can ignore it.

## Example

```ts
const message: WorkerCancelMessageInterface = { id: 1, cancel: true };
```

## Properties

### cancel

```ts
cancel: true;
```

Defined in:
[packages/worker/src/types.ts:59](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L59)

---

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:58](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L58)
