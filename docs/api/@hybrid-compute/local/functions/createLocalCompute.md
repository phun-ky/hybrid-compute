[Documentation](../../../index.md) / [@hybrid-compute/local](../index.md) /
createLocalCompute

# Function: createLocalCompute()

```ts
function createLocalCompute(): LocalCompute;
```

Defined in:
[index.ts:96](https://github.com/phun-ky/hybrid-compute/blob/774342810573b6e4351c15e144ce8c225de245e0/packages/local/src/index.ts#L96)

Factory function to create a new LocalCompute backend instance.

## Returns

[`LocalCompute`](../classes/LocalCompute.md)

A new `LocalCompute` instance with empty task registry.

## Example

```ts
const compute = createLocalCompute();
compute.runTask(…);
```
