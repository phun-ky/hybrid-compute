[Documentation](../../../index.md) / [@hybrid-compute/local](../index.md) /
createLocalCompute

# Function: createLocalCompute()

```ts
function createLocalCompute(): LocalCompute;
```

Defined in:
[index.ts:96](https://github.com/phun-ky/hybrid-compute/blob/2d42a8ddb7f8129fdfc06f10b6a15fa9df85dda2/packages/local/src/index.ts#L96)

Factory function to create a new LocalCompute backend instance.

## Returns

[`LocalCompute`](../classes/LocalCompute.md)

A new `LocalCompute` instance with empty task registry.

## Example

```ts
const compute = createLocalCompute();
compute.runTask(…);
```
