[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeTaskInterface

# Interface: ComputeTaskInterface\<Input, Output>

Defined in:
[packages/core/src/types.ts:73](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L73)

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `unknown`

## Properties

### name

```ts
name: string;
```

Defined in:
[packages/core/src/types.ts:74](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L74)

## Methods

### run()

```ts
run(input: Input, context?: TaskContextInterface):
  | Output
| Promise<Output>;
```

Defined in:
[packages/core/src/types.ts:75](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L75)

#### Parameters

##### input

`Input`

##### context?

[`TaskContextInterface`](TaskContextInterface.md)

#### Returns

| `Output` |
[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
