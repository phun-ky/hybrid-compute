[Documentation](../../../index.md) / [@hybrid-compute/local](../index.md) /
createLocalCompute

# Function: createLocalCompute()

```ts
function createLocalCompute(): LocalCompute;
```

Defined in:
[index.ts:187](https://github.com/phun-ky/hybrid-compute/blob/main/packages/local/src/index.ts#L187)

Creates a LocalCompute backend with no tasks registered.

## Returns

[`LocalCompute`](../classes/LocalCompute.md)

A new `LocalCompute` instance.

## Example

```ts
const local = createLocalCompute();

local.registerTask({ name: 'echo', run: (input: string) => input });
```
