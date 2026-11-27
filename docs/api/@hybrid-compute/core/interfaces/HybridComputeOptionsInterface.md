[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridComputeOptionsInterface

# Interface: HybridComputeOptionsInterface

Defined in:
[packages/core/src/types.ts:156](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L156)

Configuration options for initializing the HybridCompute orchestrator.

Each backend is optional, but at least one must be given, and no other keys are
allowed.

## Example

```ts
const options: HybridComputeOptionsInterface = {
  local: createLocalCompute(),
  remote: createRemoteCompute({ ... })
};
```

## See

- https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## Properties

### local?

```ts
local?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:157](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L157)

A backend that runs tasks on the calling thread.

---

### remote?

```ts
remote?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:159](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L159)

A backend that sends tasks to a server or service.

---

### worker?

```ts
worker?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:158](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L158)

A backend that runs tasks in a Web Worker.
