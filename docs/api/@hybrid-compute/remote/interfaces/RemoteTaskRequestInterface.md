[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTaskRequestInterface

# Interface: RemoteTaskRequestInterface\<Input>

Defined in:
[packages/remote/src/types.ts:63](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L63)

What the remote service receives for each task: a JSON object with the task name
and its input. The WebSocket transport adds an `id`, which the reply must
repeat.

## Example

```json
{ "task": "translate", "input": { "text": "hello" }, "id": 1 }
```

## Type Parameters

### Input

`Input` = `unknown`

## Properties

### id?

```ts
optional id?: number;
```

Defined in:
[packages/remote/src/types.ts:66](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L66)

---

### input

```ts
input: Input;
```

Defined in:
[packages/remote/src/types.ts:65](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L65)

---

### task

```ts
task: string;
```

Defined in:
[packages/remote/src/types.ts:64](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L64)
