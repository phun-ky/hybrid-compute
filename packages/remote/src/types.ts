/**
 * The transport used to reach the remote service.
 *
 * - `fetch`: one HTTP `POST` per task.
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
}

/**
 * What the remote service receives for each task: a JSON object with the
 * task name and its input. The WebSocket transport adds an `id`, which the
 * reply must repeat.
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
 * or an `error`, plus the request's `id` for the WebSocket transport. An
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
