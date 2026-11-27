[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerTaskType

# Type Alias: WorkerTaskType\<Input = `never`, Output = `unknown`>

```ts
type WorkerTaskType<Input = never, Output = unknown> = (
  input: Input,
  context: Required<TaskContextInterface>
) => Output | Promise<Output>;
```

Defined in:
[packages/worker/src/types.ts:114](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L114)

A task in the worker script, for [exposeTasks](../functions/exposeTasks.md). It
gets the input and a context with a `signal`, which aborts when the caller
cancels the task or its timeout passes, and `progress`, which sends a value to
the caller's `onProgress`. Wrap the result in
[transfer](../functions/transfer.md) to transfer buffers back instead of copying
them.

## Type Parameters

### Input

`Input` = `never`

The input type of the task.

### Output

`Output` = `unknown`

The output type of the task.

## Parameters

### input

`Input`

### context

[`Required`](https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype)<[`TaskContextInterface`](../../core/interfaces/TaskContextInterface.md)>

## Returns

| `Output` |
[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
