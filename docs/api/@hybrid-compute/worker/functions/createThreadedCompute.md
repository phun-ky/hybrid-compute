[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
createThreadedCompute

# Function: createThreadedCompute()

```ts
function createThreadedCompute(
  options: ThreadedComputeOptionsInterface
): ThreadedCompute;
```

Defined in:
[packages/worker/src/index.ts:385](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/index.ts#L385)

Creates a ThreadedCompute backend.

## Parameters

### options

[`ThreadedComputeOptionsInterface`](../interfaces/ThreadedComputeOptionsInterface.md)

The worker script, the tasks it can run and, optionally, a timeout.

## Returns

[`ThreadedCompute`](../classes/ThreadedCompute.md)

A new `ThreadedCompute` instance.

## Throws

For a missing or wrongly typed option.

## Throws

For a negative timeout.

## Example

```ts
const backend = createThreadedCompute({
  url: new URL('./worker.js', import.meta.url),
  canRunTasks: ['resizeImage']
});
```
