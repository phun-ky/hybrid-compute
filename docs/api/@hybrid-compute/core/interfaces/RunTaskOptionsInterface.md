[Documentation](../../../index.md) / [@hybrid-compute/core](../index.md) /
RunTaskOptionsInterface

# Interface: RunTaskOptionsInterface

Defined in:
[packages/core/src/types.ts:79](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L79)

Options for a single `runTask` call.

## Examples

```ts
const controller = new AbortController();
const pending = compute.runTask('resizeImage', blob, 'auto', {
  signal: controller.signal
});

controller.abort(); // pending rejects with an AbortError
```

```ts
const pixels = new Uint8Array(4096);
await compute.runTask('blur', pixels, 'worker', {
  transfer: [pixels.buffer],
  onProgress: (done) => console.log(`${done}% done`)
});
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Transferable\_objects

## Properties

### onProgress?

```ts
onProgress?: (value: unknown) => void;
```

Defined in:
[packages/core/src/types.ts:81](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L81)

Called with each value the task reports through `context.progress`, until the
task settles. Backends that can't carry progress (the remote `fetch` transport)
never call it. If it throws, the task rejects with that error.

#### Parameters

##### value

`unknown`

#### Returns

`void`

---

### signal?

```ts
signal?: AbortSignal;
```

Defined in:
[packages/core/src/types.ts:80](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L80)

Cancels the task: when it aborts, `runTask` rejects with the signal's reason. A
backend stops waiting for the result; whether the work itself stops depends on
the backend and the task.

---

### transfer?

```ts
transfer?: readonly Transferable[];
```

Defined in:
[packages/core/src/types.ts:82](https://github.com/phun-ky/hybrid-compute/blob/main/packages/core/src/types.ts#L82)

Objects in the input to transfer to a worker instead of copying, such as
`ArrayBuffer`s. After sending they are detached: empty on the calling side. Only
the worker backend uses it; the local and remote backends ignore it, so with
`auto` the caller's buffers may or may not be emptied, depending on the backend
that runs the task.
