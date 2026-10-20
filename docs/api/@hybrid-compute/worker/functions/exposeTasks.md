[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
exposeTasks

# Function: exposeTasks()

```ts
function exposeTasks(
  tasks: Readonly<Record<string, WorkerTaskType>>,
  scope?: WorkerScopeInterface
): void;
```

Defined in:
[packages/worker/src/expose.ts:66](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/expose.ts#L66)

Answers tasks from [ThreadedCompute](../classes/ThreadedCompute.md) in a worker
script: it listens for task messages, runs the task with that name, and replies
with its result, or with an error if the task throws, rejects or doesn't exist.

Each task gets the input and a context with a `signal`, which aborts when the
caller cancels the task or its timeout passes. A task that checks the signal can
stop early; its reply is then not sent.

## Parameters

### tasks

[`Readonly`](https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype)<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<`string`,
[`WorkerTaskType`](../type-aliases/WorkerTaskType.md)>>

The tasks, by name. List the same names in `canRunTasks`.

### scope?

[`WorkerScopeInterface`](../interfaces/WorkerScopeInterface.md)

Where to listen and reply. Defaults to the worker's global scope.

## Returns

`void`

## Throws

If `tasks` isn't an object of functions, or if it's called outside a worker
without a `scope`.

## Example

```ts
// worker.js
import { exposeTasks } from '@hybrid-compute/worker';

exposeTasks({
  double: (n: number) => n * 2,
  slowSum: async (numbers: number[], { signal }) => {
    let sum = 0;

    for (const n of numbers) {
      signal.throwIfAborted();
      sum += n;
    }

    return sum;
  }
});
```
