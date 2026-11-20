[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
createHybridCompute

# Function: createHybridCompute()

```ts
function createHybridCompute(
  backends: HybridComputeOptionsInterface,
  settings?: HybridComputeSettingsInterface
): HybridCompute;
```

Defined in:
[packages/core/src/index.ts:361](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/index.ts#L361)

Create a HybridCompute orchestrator: the usual way to start.

## Parameters

### backends

[`HybridComputeOptionsInterface`](../interfaces/HybridComputeOptionsInterface.md)

An object with at least one of the local, worker and remote backends.

### settings?

[`HybridComputeSettingsInterface`](../interfaces/HybridComputeSettingsInterface.md)

Optional settings, such as the `order` the `auto` strategy tries the backends
in.

## Returns

[`HybridCompute`](../classes/HybridCompute.md)

A new HybridCompute orchestrator.

## Throws

If `backends` isn't an object, a backend lacks `canRun` or `runTask`, or no
backend is given; or if `settings` isn't an object, or `order` isn't an array.

## Throws

If `backends` has a key other than local, worker or remote; or if `settings` has
a key other than order, or `order` is empty, names an unknown backend or names
one twice.

## Example

```ts
const hybrid = createHybridCompute({ local: createLocalCompute() });

// auto tries local first, then worker, and never remote
const localFirst = createHybridCompute(
  { local, worker, remote },
  { order: ['local', 'worker'] }
);
```
