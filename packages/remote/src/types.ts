/**
 * The transport used to reach the remote service.
 *
 * - `fetch`: one HTTP `POST` per task, or per batch of tasks with the
 *   `batch` option.
 * - `websocket`: one connection, opened on the first task and reused, with
 *   tasks matched to replies by `id`.
 */
export type RemoteTransportType = 'fetch' | 'websocket';

/**
 * Request headers for the fetch transport: an object, or a function that
 * returns one (or a Promise of one), called before every request, for
 * example to add a fresh access token.
 */
export type RemoteHeadersType =
  | Record<string, string>
  | (() => Record<string, string> | Promise<Record<string, string>>);

/**
 * Options for {@link createRemoteCompute}.
 *
 * @property transport - `'fetch'` or `'websocket'`.
 * @property endpoint - The URL to send tasks to: `http:` or `https:` for
 * fetch (a relative URL works in a browser page), `ws:` or `wss:` for
 * WebSocket.
 * @property canRunTasks - The tasks this backend may run, or `'*'` for every
 * task. Every task it accepts is sent over the network, so with the `auto`
 * strategy, `'*'` means any task no worker or local backend can run goes to
 * the remote service.
 * @property timeout - How long to wait for a reply, in milliseconds, before
 * rejecting with a `RemoteTaskError`. Defaults to 30000; `0` waits forever.
 * @property headers - Extra request headers for the fetch transport.
 * @property batch - Sends tasks in batches, for the fetch transport only, to
 * a server that accepts them: see {@link RemoteBatchOptionsInterface}.
 *
 * @example
 * ```ts
 * const options: RemoteComputeOptionsInterface = {
 *   transport: 'fetch',
 *   endpoint: 'https://api.example.com/compute',
 *   canRunTasks: ['translate'],
 *   timeout: 10_000,
 *   headers: async () => ({ Authorization: `Bearer ${await getToken()}` })
 * };
 * ```
 */
export interface RemoteComputeOptionsInterface {
  transport: RemoteTransportType;
  endpoint: string;
  canRunTasks: readonly string[] | '*';
  timeout?: number;
  headers?: RemoteHeadersType;
  batch?: RemoteBatchOptionsInterface;
}

/**
 * Batching for the fetch transport. Off unless given; `{}` turns it on with
 * the defaults. The server must accept the batch format: a JSON array of
 * tasks, each with an `id`, answered by a JSON array of replies with those
 * `id`s, in any order.
 *
 * A batch is sent `wait` milliseconds after its first task, or at once when it
 * holds `size` tasks. Each task keeps its own timeout and signal: one that
 * settles first is left out of a batch not sent yet, and once every task in a
 * sent batch has settled, its request is aborted. A failed request (an
 * unreachable server, a non-2xx status, a reply that isn't a JSON array)
 * rejects every task in it.
 *
 * @property size - The most tasks in one batch. Defaults to 20.
 * @property wait - How long to wait for more tasks after the first, in
 * milliseconds. Defaults to `0`: the tasks started together, such as in a
 * loop or with `Promise.all`.
 *
 * @example
 * ```ts
 * const remote = createRemoteCompute({
 *   transport: 'fetch',
 *   endpoint: 'https://api.example.com/compute',
 *   canRunTasks: ['translate'],
 *   batch: { size: 50, wait: 10 }
 * });
 *
 * // One request: [{ "id": 1, "task": "translate", "input": "hi" }, ...]
 * await Promise.all(texts.map((text) => remote.runTask('translate', text)));
 * ```
 */
export interface RemoteBatchOptionsInterface {
  size?: number;
  wait?: number;
}

/**
 * What the remote service receives for each task: a JSON object with the
 * task name and its input. The WebSocket transport and batches add an `id`,
 * which the reply must repeat. A batch is a JSON array of these.
 *
 * @example
 * ```json
 * { "task": "translate", "input": { "text": "hello" }, "id": 1 }
 * ```
 */
export interface RemoteTaskRequestInterface<Input = unknown> {
  task: string;
  input: Input;
  id?: number;
}

/**
 * What the remote service sends back: a JSON object with either a `result`
 * or an `error`, plus the request's `id` for the WebSocket transport and in
 * batches, where the reply is a JSON array of these. An
 * `error` (a message string, or an object with a `message`) rejects the task
 * with a `RemoteTaskError`; a fetch reply must also have a 2xx status.
 *
 * @example
 * ```json
 * { "id": 1, "result": { "text": "hei" } }
 * ```
 */
export interface RemoteTaskResponseInterface<Output = unknown> {
  id?: number;
  result?: Output;
  error?: unknown;
}

/**
 * What a WebSocket server may send while a task runs, before its reply: the
 * request's `id` and a `progress` value, passed to the caller's `onProgress`.
 * Any message with a `progress` key is one of these. It doesn't reset the
 * timeout. The fetch transport has no progress messages.
 *
 * @example
 * ```json
 * { "id": 1, "progress": 50 }
 * ```
 */
export interface RemoteProgressMessageInterface {
  id: number;
  progress: unknown;
}
