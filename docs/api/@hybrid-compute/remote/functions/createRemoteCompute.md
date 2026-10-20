[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
createRemoteCompute

# Function: createRemoteCompute()

```ts
function createRemoteCompute(
  options: RemoteComputeOptionsInterface
): RemoteCompute;
```

Defined in:
[packages/remote/src/index.ts:563](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/index.ts#L563)

Creates a RemoteCompute backend.

## Parameters

### options

[`RemoteComputeOptionsInterface`](../interfaces/RemoteComputeOptionsInterface.md)

The transport, endpoint, allowed tasks and, optionally, a timeout and fetch
headers.

## Returns

[`RemoteCompute`](../classes/RemoteCompute.md)

A new RemoteCompute instance.

## Throws

For a missing or wrongly typed option.

## Throws

For an unknown transport, an endpoint with the wrong URL scheme, or a negative
timeout.
