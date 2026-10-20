[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerScopeInterface

# Interface: WorkerScopeInterface

Defined in:
[packages/worker/src/types.ts:106](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L106)

Where [exposeTasks](../functions/exposeTasks.md) listens and replies. Defaults
to the worker's global scope (`self`); pass another one to adapt it, for example
to a `MessagePort`.

## Methods

### addEventListener()

```ts
addEventListener(type: "message", listener: (event: {
  data: unknown;
}) => void): void;
```

Defined in:
[packages/worker/src/types.ts:107](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L107)

#### Parameters

##### type

`"message"`

##### listener

(`event`: { `data`: `unknown`; }) => `void`

#### Returns

`void`

---

### postMessage()

```ts
postMessage(message: unknown): void;
```

Defined in:
[packages/worker/src/types.ts:111](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L111)

#### Parameters

##### message

`unknown`

#### Returns

`void`
