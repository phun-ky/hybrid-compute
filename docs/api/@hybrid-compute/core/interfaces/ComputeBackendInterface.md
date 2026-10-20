[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeBackendInterface

# Interface: ComputeBackendInterface

Defined in:
[packages/core/src/types.ts:100](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L100)

Represents a backend capable of executing registered compute tasks.

Each backend must be able to:

- Determine if it can run a given task (`canRun`). Core asks this before every
  task, for every strategy.
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
[packages/core/src/types.ts:101](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L101)

#### Parameters

##### taskName

`string`

#### Returns

`boolean`

---

### runTask()

```ts
runTask<Input, Output>(
   taskName: string,
   input: Input,
options?: RunTaskOptionsInterface): Promise<Output>;
```

Defined in:
[packages/core/src/types.ts:102](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L102)

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

##### options?

[`RunTaskOptionsInterface`](RunTaskOptionsInterface.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
