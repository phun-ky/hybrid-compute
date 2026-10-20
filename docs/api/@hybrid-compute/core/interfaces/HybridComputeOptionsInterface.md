[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridComputeOptionsInterface

# Interface: HybridComputeOptionsInterface

Defined in:
[packages/core/src/types.ts:89](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L89)

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
optional local?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:90](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L90)

A backend that runs tasks on the calling thread.

---

### remote?

```ts
optional remote?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:92](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L92)

A backend that sends tasks to a server or service.

---

### worker?

```ts
optional worker?: ComputeBackendInterface;
```

Defined in:
[packages/core/src/types.ts:91](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L91)

A backend that runs tasks in a Web Worker.
