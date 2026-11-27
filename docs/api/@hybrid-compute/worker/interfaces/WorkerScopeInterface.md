[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerScopeInterface

# Interface: WorkerScopeInterface

Defined in:
[packages/worker/src/types.ts:124](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L124)

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
[packages/worker/src/types.ts:125](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L125)

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
postMessage(message: unknown, transfer?: Transferable[]): void;
```

Defined in:
[packages/worker/src/types.ts:129](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L129)

#### Parameters

##### message

`unknown`

##### transfer?

`Transferable`\[]

#### Returns

`void`
