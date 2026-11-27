[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteProgressMessageInterface

# Interface: RemoteProgressMessageInterface

Defined in:
[packages/remote/src/types.ts:138](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L138)

What a WebSocket server may send while a task runs, before its reply: the
request's `id` and a `progress` value, passed to the caller's `onProgress`. Any
message with a `progress` key is one of these. It doesn't reset the timeout. The
fetch transport has no progress messages.

## Example

```json
{ "id": 1, "progress": 50 }
```

## Properties

### id

```ts
id: number;
```

Defined in:
[packages/remote/src/types.ts:139](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L139)

---

### progress

```ts
progress: unknown;
```

Defined in:
[packages/remote/src/types.ts:140](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L140)
