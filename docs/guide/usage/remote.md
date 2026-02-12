# Usage with remote

This package provides:

- A remote compute backend that delegates tasks over HTTP or WebSocket
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

```curl
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
