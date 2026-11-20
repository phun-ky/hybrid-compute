[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridComputeSettingsInterface

# Interface: HybridComputeSettingsInterface

Defined in:
[packages/core/src/types.ts:159](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L159)

Settings for the HybridCompute orchestrator, the second argument to
`createHybridCompute`.

## Example

```ts
// Cheap local work first, and the network only if nothing else can
const compute = createHybridCompute(
  { local, worker, remote },
  { order: ['local', 'worker', 'remote'] }
);
```

## Properties

### order?

```ts
order?: readonly BackendNameType[];
```

Defined in:
[packages/core/src/types.ts:160](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L160)

The backends the `auto` strategy tries, in order. Defaults to
`['worker', 'local', 'remote']`. Each name may appear once. A backend left out
is never used by `auto`, but can still be used with its own strategy.
