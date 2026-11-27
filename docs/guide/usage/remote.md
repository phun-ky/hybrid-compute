# Usage with remote

This package provides:

- A remote compute backend that delegates tasks over HTTP or WebSocket
- Timeouts, cancellation with an `AbortSignal`, and one error type,
  `RemoteTaskError`, for every failure
- Transport-agnostic JSON message protocol
- Suitable for offloading work to distributed compute services

[[toc]]

## Install

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/remote
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/remote
```

:::

## Fetch

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://your-remote-service.com/compute',
  canRunTasks: ['echo']
});
const compute = createHybridCompute({
  remote
});

async function main() {
  try {
    const result = await compute.runTask('echo', 'Remote via fetch!');

    console.log(result); // Output from remote server
  } catch (error) {
    console.error('Task failed:', error);
  }
}

main();
```

### Server for the fetch example

```js
import express from 'express';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Dummy task implementations
const tasks = {
  echo: async (input) => {
    return `Echo from remote server: ${input}`;
  },

  // Example additional task
  reverse: async (input) => {
    if (typeof input !== 'string') throw new Error('Input must be a string');

    return input.split('').reverse().join('');
  }
};

// Route to handle compute requests
app.post('/compute', async (req, res) => {
  const { task, input } = req.body;

  try {
    if (!task || !tasks[task]) {
      throw new Error(`Unknown task '${task}'`);
    }

    const result = await tasks[task](input);

    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(
    `🧠 RemoteCompute server listening at http://localhost:${port}/compute`
  );
});
```

This can be tested locally:

```sh
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"task": "echo", "input": "hello"}'
```

## WebSocket

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'websocket',
  endpoint: 'wss://your-remote-service.com/socket',
  canRunTasks: ['echo']
});
const compute = createHybridCompute({
  remote
});

async function main() {
  try {
    const result = await compute.runTask('echo', 'Remote via WebSocket!');

    console.log(result); // Output from remote service
  } catch (error) {
    console.error('Task failed:', error);
  }
}

main();
```

### Server for the WebSocket example

```js
import { WebSocketServer } from 'ws';

import http from 'http';

// Simple task definitions
const tasks = {
  echo: async (input) => {
    return `Echo from WebSocket server: ${input}`;
  },

  reverse: async (input) => {
    if (typeof input !== 'string') throw new Error('Input must be a string');

    return input.split('').reverse().join('');
  }
};
// Create an HTTP server to attach WebSocket
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    let request;

    try {
      request = JSON.parse(message.toString());
    } catch (err) {
      ws.send(JSON.stringify({ id: null, error: 'Invalid JSON' }));

      return;
    }

    const { id, task, input } = request;

    if (!id || typeof task !== 'string') {
      ws.send(JSON.stringify({ id, error: 'Missing or invalid task name' }));

      return;
    }

    try {
      if (!tasks[task]) throw new Error(`Unknown task '${task}'`);

      const result = await tasks[task](input);

      ws.send(JSON.stringify({ id, result }));
    } catch (error) {
      ws.send(JSON.stringify({ id, error: error.message }));
    }
  });
});

server.listen(3001, () => {
  console.log(
    'WebSocket RemoteCompute server listening at ws://localhost:3001'
  );
});
```

## Options

| Option        | Required | What it does                                                                                                                                                                           |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transport`   | Yes      | `'fetch'` (one HTTP `POST` per task) or `'websocket'` (one connection, reused)                                                                                                         |
| `endpoint`    | Yes      | An `http:` or `https:` URL for fetch (relative works in a page), a `ws:` or `wss:` URL for WebSocket                                                                                   |
| `canRunTasks` | Yes      | The task names this backend may run, or `'*'` for every task. With the `auto` strategy, any task no worker or local backend can run is sent to the endpoint, so list them when you can |
| `timeout`     | No       | Milliseconds to wait for a reply (connecting included), default `30000`; `0` waits forever                                                                                             |
| `headers`     | No       | Extra fetch headers: an object, or a function returning one (or a Promise of one), called before every request                                                                         |
| `batch`       | No       | Fetch only: send tasks started together as one request, `{ size, wait }`, for a server that accepts batches. See [Batching](#batching)                                                 |

Invalid options throw a `TypeError` or `RangeError` when the backend is created.
Creating it does no network I/O: the WebSocket connects on the first task.

## Errors

Every failure rejects with a `RemoteTaskError`, which has the `taskName`, the
server's `error` value as `detail`, the HTTP `status` for fetch, and the
underlying `cause` for network failures:

```ts
import { RemoteTaskError } from '@hybrid-compute/remote';

try {
  await remote.runTask('echo', 'hello');
} catch (error) {
  if (error instanceof RemoteTaskError && error.status === 401) {
    // sign in again
  }
}
```

It covers an `{ error }` reply, a non-2xx status (with the server's `error`, if
it sent one), a reply that isn't JSON or has neither `result` nor `error`, a
server that can't be reached, a WebSocket that closes while a task waits, and
the timeout.

## Cancelling a task

Pass an `AbortSignal` as the fourth argument to `runTask`. The task rejects with
the signal's reason as soon as it aborts; a fetch request is aborted, and a late
WebSocket reply is ignored:

```ts
const controller = new AbortController();
const pending = compute.runTask('echo', 'hello', 'remote', {
  signal: controller.signal
});

controller.abort();
```

## Progress

Over WebSocket, the server may send `{ "id": 1, "progress": 50 }` messages
before its reply. Each `progress` value reaches the `onProgress` option of
`runTask`:

```ts
await compute.runTask('translate', text, 'remote', {
  onProgress: (value) => console.log(value)
});
```

Progress doesn't reset the timeout. If `onProgress` throws, the task rejects
with that error. The fetch transport has one reply per request, so it never
calls `onProgress`. Both transports send JSON, so the `transfer` option is
ignored.

## Batching

With the fetch transport, each task is its own HTTP request. When many tasks
start at once, the `batch` option sends them as one request instead:

```ts
const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['translate'],
  batch: { size: 50, wait: 10 }
});

// One request instead of one per text
await Promise.all(texts.map((text) => remote.runTask('translate', text)));
```

A batch is sent `wait` milliseconds after its first task (default `0`: the tasks
started together, such as in a loop or with `Promise.all`), or at once when it
holds `size` tasks (default `20`). `batch: {}` turns it on with the defaults.

The server must accept batches, so batching is off unless you turn it on. The
request body is a JSON array of tasks, each with an `id`, and the reply must be
a JSON array of replies with those `id`s, in any order:

```json
[
  { "id": 1, "task": "translate", "input": "hello" },
  { "id": 2, "task": "translate", "input": "goodbye" }
]
```

```json
[
  { "id": 2, "result": "ha det" },
  { "id": 1, "result": "hei" }
]
```

With the Express server above, a batch route can run the tasks in parallel and
answer each one:

```js
app.post('/compute/batch', async (req, res) => {
  const replies = await Promise.all(
    req.body.map(async ({ id, task, input }) => {
      try {
        if (!tasks[task]) throw new Error(`Unknown task '${task}'`);

        return { id, result: await tasks[task](input) };
      } catch (error) {
        return { id, error: error.message };
      }
    })
  );

  res.json(replies);
});
```

Each task still settles on its own: an `error` rejects only that task, and a
task with no reply in the batch rejects with a `RemoteTaskError`. A request that
fails (an unreachable server, a non-2xx status, a reply that isn't a JSON array)
rejects every task in it. Each task keeps its own timeout and signal; a task
cancelled before its batch is sent is left out, and once every task in a sent
batch has settled, the request is aborted.

## Closing the connection

The WebSocket transport keeps its connection open between tasks, and connects
again on the next task if it closes. Call `remote.close()` when you're done with
it: tasks still waiting reject, and in Node.js the process can exit. It does
nothing for the fetch transport.

## Message format

A task is one JSON request and one JSON reply, described by
`RemoteTaskRequestInterface` and `RemoteTaskResponseInterface`:

```json
{ "task": "echo", "input": "hello", "id": 1 }
```

```json
{ "id": 1, "result": "Echo: hello" }
```

With [batching](#batching), the request and the reply are JSON arrays of these.
The `id` is only used over WebSocket and in batches, where the reply must repeat
it. Over WebSocket, `{ "id": 1, "progress": … }` messages may come first
(`RemoteProgressMessageInterface`). A reply has either a `result` or an `error`
(a message string, or an object with a `message`). For fetch, the status must be
2xx for a `result` to count.
