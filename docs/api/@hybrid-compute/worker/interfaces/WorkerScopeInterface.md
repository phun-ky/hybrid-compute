[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
WorkerScopeInterface

# Interface: WorkerScopeInterface

Defined in:
[packages/worker/src/types.ts:96](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L96)

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
[packages/worker/src/types.ts:97](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L97)

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
[packages/worker/src/types.ts:101](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/types.ts#L101)

#### Parameters

##### message

`unknown`

#### Returns

`void`
