# Remote protocol

What a server must do to run tasks for `@hybrid-compute/remote`. The protocol is
JSON over HTTP or WebSocket, so a server can be written in any language; nothing
here depends on JavaScript.

In this page, **must** means the client relies on it, and **should** means the
client works without it but the server is safer or easier to debug with it.

[[toc]]

## Overview

The client sends a task as a name and an input, and the server answers with a
result or an error. There are two transports, chosen by the client:

| Transport               | Request                                                 | Reply                                                                            |
| ----------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Fetch](#fetch)         | `POST` with a JSON body `{ "task", "input" }`           | JSON `{ "result" }` or `{ "error" }`                                             |
| [Fetch batch](#batches) | `POST` with a JSON array of `{ "id", "task", "input" }` | JSON array of `{ "id", "result" or "error" }`                                    |
| [WebSocket](#websocket) | A text message `{ "id", "task", "input" }`              | `{ "id", "progress" }` any number of times, then `{ "id", "result" or "error" }` |

A server can support any of these. Supporting only single fetch requests, or
only WebSocket, is enough: batches and progress are optional, and the client
uses batches only when told to.

## Messages

### Task

| Field   | Type     | Present                       | Meaning                                   |
| ------- | -------- | ----------------------------- | ----------------------------------------- |
| `task`  | string   | Always                        | The name of the task to run               |
| `input` | any JSON | When the caller gave an input | The task's input; absent means no input   |
| `id`    | number   | In batches and over WebSocket | Identifies the task; the reply repeats it |

```json
{ "id": 1, "task": "translate", "input": { "text": "hello" } }
```

- The client picks the task names; the server must look them up only among the
  tasks it means to expose, never as arbitrary function or method names.
- `input` is absent, not `null`, when the caller passed no input. A server
  should treat a missing `input` the way its language treats "no value".
- An `id` is a whole number from 1 up, unique among the tasks one client has in
  flight. Treat it as an opaque number: don't rely on its order or range.
- Fields other than these may be added in future versions; a server should
  ignore fields it doesn't know.

### Reply

A reply has either a `result` or an `error`, plus the task's `id` in batches and
over WebSocket.

```json
{ "id": 1, "result": { "text": "hei" } }
```

```json
{ "id": 1, "error": { "message": "input must be a string" } }
```

- **`result`** can be any JSON value, including `null`. The key must be present:
  a reply with neither `result` nor `error` fails the task. A task that returns
  nothing should be answered with `"result": null`.
- **`error`** is a string, or an object with a string `message`. Any other value
  is shown to the caller as its JSON text. The client puts the message in the
  `RemoteTaskError` it rejects with, and keeps the whole value as
  `error.detail`, so an object can carry more fields, such as a `code`.
- An `error` that is present and not `null` wins: the task fails even if the
  reply also has a `result`.
- The `error` reaches the caller, and through it possibly the end user. A server
  should send a message only: never a stack trace, file paths or internal
  details. Log those on the server instead.

### Progress

Over WebSocket only, a server may send any number of progress messages for a
task before its reply:

```json
{ "id": 1, "progress": 50 }
```

- Any message with a `progress` key is a progress message, whatever else it
  holds. Its value, any JSON, is passed to the caller's `onProgress`.
- Progress doesn't reset the caller's timeout.
- Progress for a task that already has its reply is ignored.

## Fetch

The client sends one `POST` per task to its endpoint, with
`Content-Type: application/json` and the [task](#task) as the body, without an
`id`:

```http
POST /compute HTTP/1.1
Content-Type: application/json

{"task":"translate","input":{"text":"hello"}}
```

The server answers with the [reply](#reply) as a JSON body:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"result":{"text":"hei"}}
```

- **The status must be 2xx for the result to count.** Any other status fails the
  task, and the client includes the body's `error`, if the body is a JSON object
  with one, in the message.
- **A failed task should get a non-2xx status** as well as an `{ "error" }`
  body. The client treats an `{ "error" }` reply as a failure with any status,
  but proxies, logs and monitoring only see the status. A common choice:

  | Situation                                 | Status                                |
  | ----------------------------------------- | ------------------------------------- |
  | The body isn't JSON, or `task` is missing | 400                                   |
  | The request isn't allowed                 | 401 or 403                            |
  | No task with that name                    | 404                                   |
  | Not a `POST`                              | 405                                   |
  | The body is too large                     | 413                                   |
  | The task threw or failed                  | 500, or 4xx if the input was at fault |

- A 2xx reply must be a JSON object. A body that isn't JSON, or is JSON but not
  an object, fails the task.
- The client may abort the request, when the caller cancels the task or its
  timeout passes (30 seconds by default). A server should stop the task when the
  connection closes, if it can, and must not rely on the reply being read.
- Requests may carry extra headers the client was configured with, such as
  `Authorization`. See [authentication](#authentication).

Try it with curl:

```sh
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"task": "echo", "input": "hello"}'
```

## Batches

With the `batch` option, the client sends several tasks in one request to the
same endpoint. A server that doesn't accept batches can ignore this section; the
client sends batches only when it's configured to.

The body is a JSON array of [tasks](#task), each with an `id`:

```json
[
  { "id": 1, "task": "translate", "input": "hello" },
  { "id": 2, "task": "translate", "input": "goodbye" }
]
```

The reply is a JSON array of [replies](#reply), each with the `id` of its task,
in any order:

```json
[
  { "id": 2, "result": "ha det" },
  { "id": 1, "result": "hei" }
]
```

- **A server tells a batch from a single task by the body:** an array is a
  batch, an object is a single task.
- **Each task succeeds or fails on its own.** One task's `error` fails only that
  task, so the status should be 2xx whenever the batch itself was valid.
- **A non-2xx status, or a reply that isn't a JSON array, fails every task in
  the batch.** Use it for a batch that can't be handled at all: one that isn't
  valid JSON, is too long, or holds an entry without a numeric `id`.
- Every task should get a reply. A task without one fails with "got no reply in
  the batch". Replies with an `id` that isn't in the batch are ignored, and so
  is a second reply for the same `id`.
- The tasks should run concurrently, since the client batches tasks that were
  started together.
- A batch holds at most the client's `batch.size` tasks, 20 by default, but a
  server must not rely on that: it should set its own limit.
- The client aborts the request once every task in it has settled on its side,
  such as by timing out. A server should stop the remaining tasks when the
  connection closes, if it can.

## WebSocket

The client opens one WebSocket to its `ws:` or `wss:` endpoint, on its first
task, and sends every task over it as a text message, with an `id`:

```json
{ "task": "translate", "input": "hello", "id": 1 }
```

The server answers each one with a text message holding the [reply](#reply) and
the same `id`, after any number of [progress](#progress) messages:

```json
{ "id": 1, "progress": 50 }
```

```json
{ "id": 1, "result": "hei" }
```

- **Many tasks share the connection,** so the server must match each reply to
  its task by `id`, and should run tasks concurrently: replies may be sent in
  any order.
- **Every message is a single JSON object in a text frame.** The client ignores
  messages that aren't JSON objects, binary frames, and messages without a
  numeric `id` or with an `id` it isn't waiting for. A server may still answer
  an unreadable message with `{ "id": null, "error": … }` to help someone
  debugging by hand; the client ignores it.
- **Send exactly one reply per task.** Later messages with the same `id` are
  ignored.
- **When the connection closes,** every task the client is still waiting for
  fails. The client connects again on its next task; tasks are never resent. A
  server should stop the connection's running tasks when it closes, if it can.
- **Cancelling:** when the caller cancels a task or its timeout passes, the
  client stops waiting and ignores the reply when it comes. It sends nothing to
  the server, so the task keeps running.
- Browsers can't set headers on a WebSocket. See
  [authentication](#authentication).

## Limits and validation

The server is the trust boundary: anyone who can reach the endpoint can send
anything, not only the client. A server should:

- **Limit the size of a request body or message** before parsing it, for example
  to 1 MiB, and answer a larger fetch request with 413. Over WebSocket, most
  servers have a setting for the largest message; closing the connection with
  code 1009 ("message too big") is the usual answer.
- **Limit the number of tasks in a batch,** and the number of tasks running at
  once on one WebSocket connection.
- **Answer malformed input with an error, not a crash:** a body that isn't JSON,
  a `task` that isn't a string, a batch entry or WebSocket message without a
  numeric `id`, an unknown task.
- **Check each task's `input`** before using it, as with any request body.
- **Send error messages only,** never stack traces or internal details.

## Authentication

The protocol has none of its own, so authentication sits in front of it, in the
server's usual middleware:

- **Fetch:** the client can send headers with every request, from an object or a
  function called before each request, for example
  `Authorization: Bearer <token>`. Cookies work too, for an endpoint on the
  page's own site. Answer an unauthenticated request with 401 before reading the
  task; the caller gets a `RemoteTaskError` with `status` 401.
- **WebSocket:** browsers can't set headers on a WebSocket, so authenticate the
  HTTP request that opens it: a cookie, or a short-lived token in the endpoint's
  query string. Refuse the upgrade if it fails. Once the connection is open,
  every task on it runs as that user.

Use `https:` and `wss:` endpoints outside local development.

## Compatibility

| `@hybrid-compute/remote` | Protocol                                            |
| ------------------------ | --------------------------------------------------- |
| 1.0                      | Single fetch requests, WebSocket                    |
| 1.1                      | Adds WebSocket [progress](#progress)                |
| 1.2                      | Adds fetch [batches](#batches), only when turned on |

New features are added so that an existing server keeps working: they're
optional for the server, or the client uses them only when configured to. A
server written for 1.0 works with every 1.x client used without `batch`.

The types `RemoteTaskRequestInterface`, `RemoteTaskResponseInterface` and
`RemoteProgressMessageInterface` in `@hybrid-compute/remote` describe the same
messages for TypeScript servers.
