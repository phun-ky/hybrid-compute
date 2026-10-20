[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerTaskMessageInterface

# Interface: WorkerTaskMessageInterface\<Input>

Defined in:
[packages/worker/src/types.ts:51](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L51)

What the worker script receives for each task: the task name, its input and an
`id`, which the reply must repeat. The input is copied with the structured clone
algorithm, so it can't hold functions or DOM nodes.

## Example

```ts
const message: WorkerTaskMessageInterface = {
  id: 1,
  task: 'double',
  input: 21
};
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Structured\_clone\_algorithm

## Type Parameters

### Input

`Input` = `unknown`

## Properties

### id

```ts
id: number;
```

Defined in:
[packages/worker/src/types.ts:52](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L52)

---

### input

```ts
input: Input;
```

Defined in:
[packages/worker/src/types.ts:54](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L54)

---

### task

```ts
task: string;
```

Defined in:
[packages/worker/src/types.ts:53](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L53)
