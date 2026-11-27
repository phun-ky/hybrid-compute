[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTaskRequestInterface

# Interface: RemoteTaskRequestInterface\<Input = `unknown`>

Defined in:
[packages/remote/src/types.ts:103](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L103)

What the remote service receives for each task: a JSON object with the task name
and its input. The WebSocket transport and batches add an `id`, which the reply
must repeat. A batch is a JSON array of these.

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
id?: number;
```

Defined in:
[packages/remote/src/types.ts:106](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L106)

---

### input

```ts
input: Input;
```

Defined in:
[packages/remote/src/types.ts:105](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L105)

---

### task

```ts
task: string;
```

Defined in:
[packages/remote/src/types.ts:104](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L104)
