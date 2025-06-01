# RemoteCompute Usage Guide

This guide explains how to use the `RemoteCompute` backend for remote task
execution via `fetch` or `WebSocket`, and also illustrates how to implement the
server side for each transport.

## Table of Contents<!-- omit from toc -->

- [RemoteCompute Usage Guide](#remotecompute-usage-guide)
  - [Overview](#overview)
  - [Client-Side Usage](#client-side-usage)
    - [1. Using `fetch` Transport](#1-using-fetch-transport)
    - [2. Using `websocket` Transport](#2-using-websocket-transport)
  - [Backend Implementation](#backend-implementation)
    - [1. Backend for Fetch (Node.js/Express)](#1-backend-for-fetch-nodejsexpress)
    - [2. Backend for WebSocket (Node.js/ws)](#2-backend-for-websocket-nodejsws)
  - [Best Practices](#best-practices)
  - [Troubleshooting](#troubleshooting)
  - [References](#references)

---

## Overview

`RemoteCompute` allows clients to send computation tasks to a remote service
using one of two transport protocols:

- `fetch`: HTTP POST requests
- `websocket`: Persistent WebSocket connection

Each task must be known to the client (optionally restricted via `canRunTasks`)
and supported by the server.

---

## Client-Side Usage

### 1. Using `fetch` Transport

```ts
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://api.example.com/compute',
  canRunTasks: ['generatePDF']
});

const result = await remote.runTask('generatePDF', {
  content: 'Hello, world!'
});
console.log(result);
```

### 2. Using `websocket` Transport

```ts
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'websocket',
  endpoint: 'wss://api.example.com/ws',
  canRunTasks: ['summarizeText']
});

const result = await remote.runTask('summarizeText', {
  text: 'This is a long text...'
});
console.log(result);
```

---

## Backend Implementation

### 1. Backend for Fetch (Node.js/Express)

```ts
import express from 'express';
const app = express();
app.use(express.json());

const handlers = {
  generatePDF: async ({ content }) => {
    // simulate PDF generation
    return `PDF with content: ${content}`;
  }
};

app.post('/compute', async (req, res) => {
  const { task, input } = req.body;
  try {
    if (!handlers[task]) throw new Error('Unknown task');
    const result = await handlers[task](input);
    res.json({ result });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(3000);
```

### 2. Backend for WebSocket (Node.js/ws)

```ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const handlers = {
  summarizeText: async ({ text }) => {
    return `Summary: ${text.slice(0, 20)}...`;
  }
};

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { task, input, id } = JSON.parse(message.toString());
    try {
      if (!handlers[task]) throw new Error('Unknown task');
      const result = await handlers[task](input);
      ws.send(JSON.stringify({ id, result }));
    } catch (error) {
      ws.send(JSON.stringify({ id, error: error.message }));
    }
  });
});
```

---

## Best Practices

- Validate task names on both ends
- Enforce authentication and authorization for remote compute endpoints
- In WebSocket mode, monitor socket health and auto-reconnect if needed
- Always wrap remote responses with task `id` for proper correlation

---

## Troubleshooting

| Issue                           | Solution                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| `WebSocket not connected` error | Ensure WebSocket is open before sending messages                |
| Task not found                  | Confirm the task name is registered and listed in `canRunTasks` |
| JSON parse error                | Ensure backend and client speak the same message protocol       |

## References

- [MDN: fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch)
- [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket on NPM](https://www.npmjs.com/package/ws)
