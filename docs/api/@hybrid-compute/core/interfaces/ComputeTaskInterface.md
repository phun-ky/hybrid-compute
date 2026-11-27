[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeTaskInterface

# Interface: ComputeTaskInterface\<Input = `unknown`, Output = `unknown`>

Defined in:
[packages/core/src/types.ts:99](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L99)

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
[packages/core/src/types.ts:100](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L100)

## Methods

### run()

```ts
run(input: Input, context?: TaskContextInterface):
  | Output
| Promise<Output>;
```

Defined in:
[packages/core/src/types.ts:101](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L101)

#### Parameters

##### input

`Input`

##### context?

[`TaskContextInterface`](TaskContextInterface.md)

#### Returns

| `Output` |
[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
