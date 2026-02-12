[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeTaskInterface

# Interface: ComputeTaskInterface\<Input, Output>

Defined in:
[types.ts:33](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/core/src/types.ts#L33)

Describes a unit of work that can be executed by a compute backend.

## Example

```ts
const task: ComputeTaskInterface<number, number> = {
  name: 'double',
  run: async (x) => x * 2
};
```

## Type Parameters

### Input

`Input` = `unknown`

The input type expected by the task.

### Output

`Output` = `unknown`

The output type returned by the task.

## Properties

### name

```ts
name: string;
```

Defined in:
[types.ts:34](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/core/src/types.ts#L34)

A unique name used to identify the task.

## Methods

### run()

```ts
run(input: Input): Promise<Output>;
```

Defined in:
[types.ts:35](https://github.com/phun-ky/hybrid-compute/blob/06125d8e4713eac0ec73aa47f10b979c19a091dd/packages/core/src/types.ts#L35)

A function that takes input and returns a Promise of the output.

#### Parameters

##### input

`Input`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
