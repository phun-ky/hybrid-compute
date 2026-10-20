[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTaskResponseInterface

# Interface: RemoteTaskResponseInterface\<Output>

Defined in:
[packages/remote/src/types.ts:80](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L80)

What the remote service sends back: a JSON object with either a `result` or an
`error`, plus the request's `id` for the WebSocket transport. An `error` (a
message string, or an object with a `message`) rejects the task with a
`RemoteTaskError`; a fetch reply must also have a 2xx status.

## Example

```json
{ "id": 1, "result": { "text": "hei" } }
```

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### error?

```ts
optional error?: unknown;
```

Defined in:
[packages/remote/src/types.ts:83](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L83)

---

### id?

```ts
optional id?: number;
```

Defined in:
[packages/remote/src/types.ts:81](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L81)

---

### result?

```ts
optional result?: Output;
```

Defined in:
[packages/remote/src/types.ts:82](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L82)
