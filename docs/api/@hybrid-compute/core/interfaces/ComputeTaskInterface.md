[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
ComputeTaskInterface

# Interface: ComputeTaskInterface\<Input, Output>

Defined in:
[packages/core/src/types.ts:42](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L42)

Describes a unit of work that can be executed by a compute backend.

## Example

```ts
const double: ComputeTaskInterface<number, number> = {
  name: 'double',
  run: (x) => x * 2
};

const fetchUser: ComputeTaskInterface<string, User> = {
  name: 'fetchUser',
  run: async (id) => (await fetch(`/users/${id}`)).json()
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
[packages/core/src/types.ts:43](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L43)

A unique, non-empty name used to identify the task.

## Methods

### run()

```ts
run(input: Input):
  | Output
| Promise<Output>;
```

Defined in:
[packages/core/src/types.ts:44](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L44)

A function that takes the input and returns the output, or a Promise of it.
Synchronous work in `run` blocks the thread it runs on.

#### Parameters

##### input

`Input`

#### Returns

| `Output` |
[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<`Output`>
