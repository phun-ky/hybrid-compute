[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeBackendInterface

# Interface: ComputeBackendInterface

Defined in:
[types.ts:59](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/types.ts#L59)

Represents a backend capable of executing registered compute tasks.

Each backend must be able to:

- Determine if it can run a given task (`canRun`)
- Execute a named task with input and return a Promise of output (`runTask`)

## Template

The input type for task execution.

## Template

The output type for task execution.

## Example

```ts
const backend: ComputeBackendInterface = {
  canRun: (taskName) => taskName === 'double',
  runTask: async (taskName, input) => {
    if (taskName === 'double') return (input as number) * 2;
    throw new Error('Unknown task');
  }
};
```

## Methods

### canRun()

```ts
canRun(taskName: string): boolean;
```

Defined in:
[types.ts:60](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/types.ts#L60)

#### Parameters

##### taskName

`string`

#### Returns

`boolean`

---

### runTask()

```ts
runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
```

Defined in:
[types.ts:61](https://github.com/phun-ky/hybrid-compute/blob/245d63304b8c73c1564e241a5ecc221f8c01058b/packages/core/src/types.ts#L61)

#### Type Parameters

##### Input

`Input`

##### Output

`Output`

#### Parameters

##### taskName

`string`

##### input

`Input`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
