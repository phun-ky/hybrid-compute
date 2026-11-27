[Documentation](../../../index.md) / [@hybrid-compute/worker](../index.md) /
transfer

# Function: transfer()

```ts
function transfer<T extends object>(value: T, list: Transferable[]): T;
```

Defined in:
[packages/worker/src/expose.ts:79](https://github.com/phun-ky/hybrid-compute/blob/main/packages/worker/src/expose.ts#L79)

Marks a task's result to be transferred back to the caller instead of copied.
Return what it returns. The objects in `list` are detached in the worker once
the reply is sent.

Don't list a `SharedArrayBuffer`: it's shared without transferring, and listing
it fails the task with a `DataCloneError`.

## Type Parameters

### T

`T` _extends_ `object`

## Parameters

### value

`T`

The result, holding the objects in `list`.

### list

`Transferable`\[]

The objects to transfer, such as `ArrayBuffer`s.

## Returns

`T`

`value`, unchanged.

## Throws

If `value` isn't an object or `list` isn't an array.

## Example

```ts
exposeTasks({
  invert: (pixels: Uint8Array) => {
    for (let i = 0; i < pixels.length; i++) pixels[i] = 255 - pixels[i];

    return transfer(pixels, [pixels.buffer]);
  }
});
```

## See

https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Transferable\_objects
