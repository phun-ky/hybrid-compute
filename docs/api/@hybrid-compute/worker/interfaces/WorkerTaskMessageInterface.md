[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerTaskMessageInterface

# Interface: WorkerTaskMessageInterface

Defined in:
[types.ts:21](https://github.com/phun-ky/hybrid-compute/blob/774342810573b6e4351c15e144ce8c225de245e0/packages/worker/src/types.ts#L21)

The message format sent from the main thread to a Web Worker when executing a
task.

This message includes a task name, its input payload, and a unique ID used to
match the response from the worker.

## Example

```ts
const message: WorkerTaskMessageInterface = {
  task: 'double',
  input: 21,
  id: 1
};
worker.postMessage(message);
```

## Properties

### id

```ts
id: number;
```

Defined in:
[types.ts:25](https://github.com/phun-ky/hybrid-compute/blob/774342810573b6e4351c15e144ce8c225de245e0/packages/worker/src/types.ts#L25)

A unique identifier for correlating the response message.

---

### input

```ts
input: any;
```

Defined in:
[types.ts:24](https://github.com/phun-ky/hybrid-compute/blob/774342810573b6e4351c15e144ce8c225de245e0/packages/worker/src/types.ts#L24)

The input data for the task. This can be any JSON-serializable value.

---

### task

```ts
task: string;
```

Defined in:
[types.ts:22](https://github.com/phun-ky/hybrid-compute/blob/774342810573b6e4351c15e144ce8c225de245e0/packages/worker/src/types.ts#L22)

The name of the task to be executed in the worker.
