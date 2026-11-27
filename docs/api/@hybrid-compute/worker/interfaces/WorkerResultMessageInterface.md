[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerResultMessageInterface

# Interface: WorkerResultMessageInterface\<Output = `unknown`>

Defined in:
[packages/worker/src/types.ts:88](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L88)

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
error?: unknown;
```

Defined in:
[packages/worker/src/types.ts:91](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L91)

---

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:89](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L89)

---

### result?

```ts
result?: Output;
```

Defined in:
[packages/worker/src/types.ts:90](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L90)
