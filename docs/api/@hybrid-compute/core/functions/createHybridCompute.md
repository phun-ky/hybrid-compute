[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
createHybridCompute

# Function: createHybridCompute()

```ts
function createHybridCompute(
  backends: HybridComputeOptionsInterface
): HybridCompute;
```

Defined in:
[index.ts:108](https://github.com/phun-ky/hybrid-compute/blob/566231abfd6619d76a9d89ee87729f299a716dad/packages/core/src/index.ts#L108)

Factory function for creating a HybridCompute instance.

## Parameters

### backends

[`HybridComputeOptionsInterface`](../interfaces/HybridComputeOptionsInterface.md)

Configuration options specifying available backends.

## Returns

[`HybridCompute`](../classes/HybridCompute.md)

A new HybridCompute orchestrator.

## Example

```ts
const hybrid = createHybridCompute({ local: createLocalCompute() });
```
