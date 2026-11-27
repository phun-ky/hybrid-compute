[Documentation](../../../index.md) / [@hybrid-compute/remote](../index.md) /
RemoteBatchOptionsInterface

# Interface: RemoteBatchOptionsInterface

Defined in:
[packages/remote/src/types.ts:88](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L88)

Batching for the fetch transport. Off unless given; `{}` turns it on with the
defaults. The server must accept the batch format: a JSON array of tasks, each
with an `id`, answered by a JSON array of replies with those `id`s, in any
order.

A batch is sent `wait` milliseconds after its first task, or at once when it
holds `size` tasks. Each task keeps its own timeout and signal: one that settles
first is left out of a batch not sent yet, and once every task in a sent batch
has settled, its request is aborted. A failed request (an unreachable server, a
non-2xx status, a reply that isn't a JSON array) rejects every task in it.

## Example

```ts
const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['translate'],
  batch: { size: 50, wait: 10 }
});

// One request: [{ "id": 1, "task": "translate", "input": "hi" }, ...]
await Promise.all(texts.map((text) => remote.runTask('translate', text)));
```

## Properties

### size?

```ts
size?: number;
```

Defined in:
[packages/remote/src/types.ts:89](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L89)

The most tasks in one batch. Defaults to 20.

---

### wait?

```ts
wait?: number;
```

Defined in:
[packages/remote/src/types.ts:90](https://github.com/phun-ky/hybrid-compute/blob/main/packages/remote/src/types.ts#L90)

How long to wait for more tasks after the first, in milliseconds. Defaults to
`0`: the tasks started together, such as in a loop or with `Promise.all`.
