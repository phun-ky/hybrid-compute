[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteTaskResponseInterface

# Interface: RemoteTaskResponseInterface\<Output = `unknown`>

Defined in:
[packages/remote/src/types.ts:121](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L121)

What the remote service sends back: a JSON object with either a `result` or an
`error`, plus the request's `id` for the WebSocket transport and in batches,
where the reply is a JSON array of these. An `error` (a message string, or an
object with a `message`) rejects the task with a `RemoteTaskError`; a fetch
reply must also have a 2xx status.

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
error?: unknown;
```

Defined in:
[packages/remote/src/types.ts:124](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L124)

---

### id?

```ts
id?: number;
```

Defined in:
[packages/remote/src/types.ts:122](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L122)

---

### result?

```ts
result?: Output;
```

Defined in:
[packages/remote/src/types.ts:123](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L123)
