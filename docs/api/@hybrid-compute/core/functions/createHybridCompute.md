[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
createHybridCompute

# Function: createHybridCompute()

```ts
function createHybridCompute(
  backends: HybridComputeOptionsInterface
): HybridCompute;
```

Defined in:
[packages/core/src/index.ts:235](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L235)

Create a HybridCompute orchestrator: the usual way to start.

## Parameters

### backends

[`HybridComputeOptionsInterface`](../interfaces/HybridComputeOptionsInterface.md)

An object with at least one of the local, worker and remote backends.

## Returns

[`HybridCompute`](../classes/HybridCompute.md)

A new HybridCompute orchestrator.

## Throws

If `backends` isn't an object, a backend lacks `canRun` or `runTask`, or no
backend is given.

## Throws

If `backends` has a key other than local, worker or remote.

## Example

```ts
const hybrid = createHybridCompute({ local: createLocalCompute() });
```
