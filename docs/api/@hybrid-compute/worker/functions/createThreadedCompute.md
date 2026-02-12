[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
createThreadedCompute

# Function: createThreadedCompute()

```ts
function createThreadedCompute(
  workerPath: string,
  tasks: string[]
): ThreadedCompute;
```

Defined in:
[index.ts:116](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/worker/src/index.ts#L116)

Factory function to create a new `ThreadedCompute` backend.

## Parameters

### workerPath

`string`

The module worker file path (e.g. `new URL('./worker.js', import.meta.url)`).

### tasks

`string`\[]

A list of supported task names this worker can execute.

## Returns

[`ThreadedCompute`](../classes/ThreadedCompute.md)

A new `ThreadedCompute` instance.

## Example

```ts
const backend = createThreadedCompute(new URL('./worker.js', import.meta.url), [
  'resizeImage'
]);
```
