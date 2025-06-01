# RemoteCompute Test Harness & CURL Examples

This guide provides a simple test harness and `curl` commands to validate that
your remote backend endpoints (both fetch and websocket) are working correctly.

## Table of Contents<!-- omit from toc -->

- [RemoteCompute Test Harness \& CURL Examples](#remotecompute-test-harness--curl-examples)
  - [HTTP `fetch` Test Harness (Node.js)](#http-fetch-test-harness-nodejs)
    - [File: `test-fetch.js`](#file-test-fetchjs)
    - [CURL Test: `fetch`](#curl-test-fetch)
  - [WebSocket Test Harness (Node.js)](#websocket-test-harness-nodejs)
    - [File: `test-websocket.js`](#file-test-websocketjs)
    - [WebSocket Manual Testing (via `wscat`)](#websocket-manual-testing-via-wscat)
  - [What to Verify](#what-to-verify)
  - [Security Tip](#security-tip)

---

## HTTP `fetch` Test Harness (Node.js)

### File: `test-fetch.js`

```js
const taskName = 'generatePDF';
const input = { content: 'Hello, PDF World!' };

async function run() {
  const res = await fetch('http://localhost:3000/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: taskName, input })
  });

  const json = await res.json();
  console.log('Response:', json);
}

run().catch(console.error);
```

### CURL Test: `fetch`

```bash
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"task": "generatePDF", "input": { "content": "Hello from CURL" }}'
```

Expected output:

```json
{ "result": "PDF with content: Hello from CURL" }
```

## WebSocket Test Harness (Node.js)

### File: `test-websocket.js`

```js
import WebSocket from 'ws';

const socket = new WebSocket('ws://localhost:8080');
const taskId = 1;

socket.onopen = () => {
  socket.send(
    JSON.stringify({
      task: 'summarizeText',
      input: {
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      id: taskId
    })
  );
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('WS response:', data);
  socket.close();
};

socket.onerror = (err) => {
  console.error('WebSocket error:', err);
};
```

### WebSocket Manual Testing (via `wscat`)

You can use `wscat` from the terminal:

```bash
npm install -g wscat
wscat -c ws://localhost:8080
```

Once connected, send this JSON payload:

```json
{
  "task": "summarizeText",
  "input": { "text": "WebSocket test with a longer text to summarize" },
  "id": 42
}
```

Expected response:

```json
{
  "id": 42,
  "result": "Summary: WebSocket test with..."
}
```

## What to Verify

| Test              | Expected                                        |
| ----------------- | ----------------------------------------------- |
| fetch POST        | JSON response with `"result"` or `"error"`      |
| WebSocket send    | JSON message with matching `"id"` and result    |
| Unregistered task | `"error": "Unknown task"`                       |
| Missing input     | backend should throw or return error gracefully |

## Security Tip

In production, always validate:

- Origin and authentication headers
- Rate limits
- Schema of incoming requests (e.g. using Zod or Yup)
