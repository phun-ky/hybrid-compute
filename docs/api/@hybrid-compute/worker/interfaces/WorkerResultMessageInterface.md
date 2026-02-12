[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerResultMessageInterface

# Interface: WorkerResultMessageInterface

Defined in:
[types.ts:48](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/worker/src/types.ts#L48)

The message format sent from a Web Worker back to the main thread upon task
completion.

This message includes the result of the task execution or an error message if
the task failed.

## Example

```ts
const response: WorkerResultMessageInterface = {
  id: 1,
  result: 42
};
postMessage(response);
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Using\_web\_workers

## Properties

### error?

```ts
optional error: string;
```

Defined in:
[types.ts:52](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/worker/src/types.ts#L52)

An optional error message if the task failed.

---

### id

```ts
id: number;
```

Defined in:
[types.ts:49](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/worker/src/types.ts#L49)

The unique identifier that matches a previously sent task message.

---

### result

```ts
result: any;
```

Defined in:
[types.ts:51](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/worker/src/types.ts#L51)

The result of the task execution (if successful).
