[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
createHybridCompute

# Function: createHybridCompute()

```ts
function createHybridCompute(
  backends: HybridComputeOptionsInterface
): HybridCompute;
```

Defined in:
[index.ts:108](https://github.com/phun-ky/hybrid-compute/blob/bb27d092566034ca0db7820e6d72140b6acace60/packages/core/src/index.ts#L108)

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
