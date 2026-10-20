[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteHeadersType

# Type Alias: RemoteHeadersType

```ts
type RemoteHeadersType =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);
```

Defined in:
[packages/remote/src/types.ts:15](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L15)

Request headers for the fetch transport: an object, or a function that returns
one (or a Promise of one), called before every request, for example to add a
fresh access token.
