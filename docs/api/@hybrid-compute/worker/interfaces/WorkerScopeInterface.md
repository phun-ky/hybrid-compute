[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerScopeInterface

# Interface: WorkerScopeInterface

Defined in:
[packages/worker/src/types.ts:130](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L130)

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
[packages/worker/src/types.ts:131](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L131)

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
[packages/worker/src/types.ts:135](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L135)

#### Parameters

##### message

`unknown`

##### transfer?

`Transferable`\[]

#### Returns

`void`
