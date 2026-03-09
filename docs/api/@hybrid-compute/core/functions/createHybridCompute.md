[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
createHybridCompute

# Function: createHybridCompute()

```ts
function createHybridCompute(
  backends: HybridComputeOptionsInterface
): HybridCompute;
```

Defined in:
[index.ts:108](https://github.com/phun-ky/hybrid-compute/blob/2d42a8ddb7f8129fdfc06f10b6a15fa9df85dda2/packages/core/src/index.ts#L108)

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
