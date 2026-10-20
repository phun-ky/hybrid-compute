[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerTaskType

# Type Alias: WorkerTaskType\<Input, Output>

```ts
type WorkerTaskType<Input, Output> = (
  input: Input,
  context: Required<TaskContextInterface>
) => Output | Promise<Output>;
```

Defined in:
[packages/worker/src/types.ts:96](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L96)

A task in the worker script, for [exposeTasks](../functions/exposeTasks.md). It
gets the input and a context with a `signal`, which aborts when the caller
cancels the task or its timeout passes.

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
