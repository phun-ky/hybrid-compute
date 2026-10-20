[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
RunTaskOptionsInterface

# Interface: RunTaskOptionsInterface

Defined in:
[packages/core/src/types.ts:59](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L59)

Options for a single `runTask` call.

## Example

```ts
const controller = new AbortController();
const pending = compute.runTask('resizeImage', blob, 'auto', {
  signal: controller.signal
});

controller.abort(); // pending rejects with an AbortError
```

## Properties

### signal?

```ts
optional signal?: AbortSignal;
```

Defined in:
[packages/core/src/types.ts:60](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L60)

Cancels the task: when it aborts, `runTask` rejects with the signal's reason. A
backend stops waiting for the result; whether the work itself stops depends on
the backend and the task.
