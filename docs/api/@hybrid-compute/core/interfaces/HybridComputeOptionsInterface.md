[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
HybridComputeOptionsInterface

# Interface: HybridComputeOptionsInterface

Defined in:
[types.ts:84](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/core/src/types.ts#L84)

Configuration options for initializing the HybridCompute orchestrator.

Backends are optional, and can be combined or omitted based on the environment
or needs.

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
optional local: ComputeBackendInterface;
```

Defined in:
[types.ts:85](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/core/src/types.ts#L85)

A local synchronous compute backend (main thread).

---

### remote?

```ts
optional remote: ComputeBackendInterface;
```

Defined in:
[types.ts:87](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/core/src/types.ts#L87)

A server-side or cloud compute backend.

---

### worker?

```ts
optional worker: ComputeBackendInterface;
```

Defined in:
[types.ts:86](https://github.com/phun-ky/hybrid-compute/blob/0019aa38a6f2721e563fc43e328e9923e73bf79a/packages/core/src/types.ts#L86)

A background-thread compute backend (e.g. WebWorker).
