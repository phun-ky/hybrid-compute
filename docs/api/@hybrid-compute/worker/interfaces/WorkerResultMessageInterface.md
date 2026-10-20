[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerResultMessageInterface

# Interface: WorkerResultMessageInterface\<Output>

Defined in:
[packages/worker/src/types.ts:82](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L82)

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
[packages/worker/src/types.ts:85](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L85)

---

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:83](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L83)

---

### result?

```ts
optional result?: Output;
```

Defined in:
[packages/worker/src/types.ts:84](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L84)
