[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerResultMessageInterface

# Interface: WorkerResultMessageInterface\<Output>

Defined in:
[packages/worker/src/types.ts:72](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L72)

What the worker script sends back: the task's `id` with either a `result` or an
`error`. An `error` (a message string, or an object with a `message`) rejects
the task with a `WorkerTaskError`.

## Example

```ts
self.postMessage({ id: 1, result: 42 } satisfies WorkerResultMessageInterface);
```

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### error?

```ts
optional error?: unknown;
```

Defined in:
[packages/worker/src/types.ts:75](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L75)

---

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:73](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L73)

---

### result?

```ts
optional result?: Output;
```

Defined in:
[packages/worker/src/types.ts:74](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L74)
