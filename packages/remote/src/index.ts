import type {
  ComputeBackendInterface,
  RunTaskOptionsInterface
} from '@hybrid-compute/core';

import { RemoteTaskError } from './errors.js';
import type {
  RemoteComputeOptionsInterface,
  RemoteHeadersType,
  RemoteTaskResponseInterface,
  RemoteTransportType
} from './types.js';

export * from './errors.js';

export * from './types.js';

/** How long to wait for a reply when no timeout is given, in milliseconds. */
const DEFAULT_TIMEOUT = 30_000;
/** The URL schemes each transport accepts. */
const SCHEMES: Readonly<Record<RemoteTransportType, readonly string[]>> =
  Object.freeze({
    fetch: Object.freeze(['http:', 'https:']),
    websocket: Object.freeze(['ws:', 'wss:'])
  });

/** A task waiting for its WebSocket reply. */
type PendingTaskType = {
  taskName: string;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

/** What a value is, for error messages: null, an array, or its typeof. */
const describeValue = (value: unknown) => {
  if (value === null) return 'null';

  if (Array.isArray(value)) return 'an array';

  if (value === '') return 'an empty string';

  return typeof value;
};
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
/** The page's URL in a browser, so a relative fetch endpoint can be checked. */
const baseUrl = () =>
  (globalThis as { location?: { href?: string } }).location?.href;
/**
 * Check the options and return them normalised.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For an unknown transport, an endpoint with the wrong
 * URL scheme, or a negative timeout.
 */
const toSettings = (options: unknown) => {
  if (!isPlainObject(options)) {
    throw new TypeError(
      `createRemoteCompute expects an options object, got ${describeValue(options)}`
    );
  }

  const { transport, endpoint, canRunTasks, timeout, headers } = options;

  if (transport !== 'fetch' && transport !== 'websocket') {
    throw new RangeError(
      `Unknown transport ${JSON.stringify(transport)}; use 'fetch' or 'websocket'`
    );
  }

  if (typeof endpoint !== 'string' || endpoint === '') {
    throw new TypeError(
      `endpoint must be a non-empty URL string, got ${describeValue(endpoint)}`
    );
  }

  let url: URL;

  try {
    url = new URL(endpoint, transport === 'fetch' ? baseUrl() : undefined);
  } catch {
    throw new TypeError(
      `endpoint '${endpoint}' isn't a valid URL${transport === 'fetch' ? '' : '; WebSocket endpoints must be absolute ws: or wss: URLs'}`
    );
  }

  if (!SCHEMES[transport].includes(url.protocol)) {
    throw new RangeError(
      `endpoint '${endpoint}' uses ${url.protocol}; the ${transport} transport needs ${SCHEMES[transport].join(' or ')}`
    );
  }

  let allowed: ReadonlySet<string> | null;

  if (canRunTasks === '*') {
    allowed = null;
  } else if (
    Array.isArray(canRunTasks) &&
    canRunTasks.every((name) => typeof name === 'string' && name !== '')
  ) {
    allowed = new Set(canRunTasks as string[]);
  } else {
    throw new TypeError(
      `canRunTasks must be an array of task names, or '*' to accept every task, got ${describeValue(canRunTasks)}`
    );
  }

  if (
    timeout !== undefined &&
    (typeof timeout !== 'number' || !Number.isFinite(timeout))
  ) {
    throw new TypeError(
      `timeout must be a number of milliseconds, got ${describeValue(timeout)}`
    );
  }

  if (typeof timeout === 'number' && timeout < 0) {
    throw new RangeError(
      `timeout must be 0 (no timeout) or more, got ${timeout}`
    );
  }

  if (
    headers !== undefined &&
    typeof headers !== 'function' &&
    !(
      isPlainObject(headers) &&
      Object.values(headers).every((value) => typeof value === 'string')
    )
  ) {
    throw new TypeError(
      'headers must be an object of string values, or a function returning one'
    );
  }

  if (headers !== undefined && transport === 'websocket') {
    throw new TypeError(
      'headers only work with the fetch transport; browsers cannot set WebSocket headers'
    );
  }

  return {
    transport,
    // Resolved once, so a relative endpoint means the same in every runtime,
    // and doesn't change if the page's URL changes later
    endpoint: url.href,
    allowed,
    timeout: (timeout as number | undefined) ?? DEFAULT_TIMEOUT,
    headers: headers as RemoteHeadersType | undefined
  };
};
/** The message for a server's `error`: a string, or an object's message. */
const messageOf = (error: unknown) => {
  if (typeof error === 'string') return error;

  if (isPlainObject(error) && typeof error.message === 'string') {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/**
 * RemoteCompute is a backend that sends tasks to a remote service, over HTTP
 * with fetch or over a WebSocket.
 *
 * Each task is one JSON request and one JSON reply; see
 * {@link RemoteTaskRequestInterface} and {@link RemoteTaskResponseInterface}
 * for the message format. Every failure (an `error` in the reply, an unusable
 * response, a timeout, an unreachable server) rejects with a
 * {@link RemoteTaskError}.
 *
 * The WebSocket transport connects on the first task, not when it's created,
 * reuses the connection, and connects again on the next task after it closes.
 * Call {@link RemoteCompute.close} when you're done with it.
 *
 * @example Fetch transport
 * ```ts
 * const remote = createRemoteCompute({
 *   transport: 'fetch',
 *   endpoint: 'https://api.example.com/compute',
 *   canRunTasks: ['translateText']
 * });
 *
 * const result = await remote.runTask('translateText', { text: 'hello' });
 * ```
 *
 * @example WebSocket transport
 * ```ts
 * const remote = createRemoteCompute({
 *   transport: 'websocket',
 *   endpoint: 'wss://api.example.com/ws',
 *   canRunTasks: ['analyzeSentiment']
 * });
 *
 * const result = await remote.runTask('analyzeSentiment', { text: 'It works!' });
 *
 * remote.close();
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export class RemoteCompute implements ComputeBackendInterface {
  private readonly settings: ReturnType<typeof toSettings>;
  private socket?: WebSocket;
  private opening?: Promise<WebSocket>;
  private connecting?: WebSocket;
  private readonly pending = new Map<number, PendingTaskType>();
  private nextId = 1;

  /**
   * Creates the backend. It checks the options, and does no network I/O
   * until the first task.
   *
   * @param options - The transport, endpoint, allowed tasks and, optionally,
   * a timeout and fetch headers.
   *
   * @throws {TypeError} For a missing or wrongly typed option.
   * @throws {RangeError} For an unknown transport, an endpoint with the wrong
   * URL scheme, or a negative timeout.
   */
  constructor(options: RemoteComputeOptionsInterface) {
    this.settings = toSettings(options);
  }

  /**
   * Determines if this backend may run the given task.
   *
   * @param taskName - Name of the task.
   * @returns `true` if the task is in `canRunTasks`, or if `canRunTasks` is
   * `'*'`.
   */
  canRun(taskName: string): boolean {
    return (
      this.settings.allowed === null || this.settings.allowed.has(taskName)
    );
  }

  /**
   * Sends a task to the remote service and waits for its reply.
   *
   * @typeParam Input - The input data structure expected by the task.
   * @typeParam Output - The output structure returned by the task.
   *
   * @param taskName - Name of the remote task.
   * @param input - Input data to send. It must be serialisable as JSON.
   * @param options - Options for this call, such as an `AbortSignal`.
   * @returns A Promise resolving to the reply's `result`. It rejects with a
   * {@link RemoteTaskError} if the task fails, the reply is unusable, the
   * timeout passes or the server can't be reached, and with the signal's
   * reason if the call is cancelled.
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input,
    options?: RunTaskOptionsInterface
  ): Promise<Output> {
    const signal = options?.signal;

    if (signal?.aborted) throw signal.reason;

    return (
      this.settings.transport === 'fetch'
        ? this.viaFetch(taskName, input, signal)
        : this.viaSocket(taskName, input, signal)
    ) as Promise<Output>;
  }

  /**
   * Closes the WebSocket, if one is open or opening. Tasks still waiting for
   * a reply reject with a {@link RemoteTaskError}. The next task opens a new
   * connection. Does nothing for the fetch transport.
   */
  close(): void {
    const sockets = [this.socket, this.connecting];

    this.socket = undefined;
    this.opening = undefined;
    this.connecting = undefined;
    this.rejectPending('the connection was closed');

    for (const socket of sockets) socket?.close();
  }

  /** Turn a reply into the task's result, or throw a RemoteTaskError. */
  private settle(taskName: string, reply: unknown, status?: number) {
    if (!isPlainObject(reply)) {
      throw new RemoteTaskError(
        taskName,
        `Remote task '${taskName}' got a reply that isn't a JSON object`,
        { status }
      );
    }

    const { error } = reply as RemoteTaskResponseInterface;

    if (error !== undefined && error !== null) {
      throw new RemoteTaskError(
        taskName,
        `Remote task '${taskName}' failed: ${messageOf(error)}`,
        { detail: error, status }
      );
    }

    if (!('result' in reply)) {
      throw new RemoteTaskError(
        taskName,
        `Remote task '${taskName}' got a reply with neither a result nor an error`,
        { status }
      );
    }

    return reply.result;
  }

  /** One HTTP POST per task. */
  private async viaFetch(
    taskName: string,
    input: unknown,
    signal?: AbortSignal
  ) {
    const { endpoint, timeout, headers } = this.settings;
    const body = JSON.stringify({ task: taskName, input });
    const controller = new AbortController();
    const onAbort = () => controller.abort(signal?.reason);
    const timer =
      timeout > 0
        ? setTimeout(
            () =>
              controller.abort(
                new RemoteTaskError(
                  taskName,
                  `Remote task '${taskName}' timed out after ${timeout} ms`
                )
              ),
            timeout
          )
        : undefined;

    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const extra = typeof headers === 'function' ? await headers() : headers;

      let response: Response;

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...extra },
          body,
          signal: controller.signal
        });
      } catch (error) {
        if (controller.signal.aborted) throw controller.signal.reason;

        throw new RemoteTaskError(
          taskName,
          `Remote task '${taskName}' couldn't reach ${endpoint}`,
          { cause: error }
        );
      }

      if (!response.ok) {
        // Servers often send { error } with a 4xx or 5xx status: keep it
        const failed = await response.json().catch(() => undefined);
        const error = isPlainObject(failed) ? failed.error : undefined;
        const hasError = error !== undefined && error !== null;

        throw new RemoteTaskError(
          taskName,
          `Remote task '${taskName}' failed with HTTP ${response.status}${hasError ? `: ${messageOf(error)}` : ''}`,
          hasError
            ? { status: response.status, detail: error }
            : { status: response.status }
        );
      }

      let reply: unknown;

      try {
        reply = await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw controller.signal.reason;

        throw new RemoteTaskError(
          taskName,
          `Remote task '${taskName}' got a reply that isn't JSON`,
          { status: response.status, cause: error }
        );
      }

      return this.settle(taskName, reply, response.status);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  /** One message per task on a shared WebSocket, matched by id. */
  private viaSocket(taskName: string, input: unknown, signal?: AbortSignal) {
    const { timeout } = this.settings;
    const id = this.nextId++;
    // Serialise now, so input that isn't JSON fails before connecting
    const message = JSON.stringify({ task: taskName, input, id });

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const finish = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        this.pending.delete(id);
      };
      const onAbort = () => {
        finish();
        reject(signal?.reason);
      };

      // The timeout covers connecting as well as waiting for the reply
      if (timeout > 0) {
        timer = setTimeout(() => {
          finish();
          reject(
            new RemoteTaskError(
              taskName,
              `Remote task '${taskName}' timed out after ${timeout} ms`
            )
          );
        }, timeout);
      }

      signal?.addEventListener('abort', onAbort, { once: true });
      this.pending.set(id, {
        taskName,
        resolve: (value) => {
          finish();
          resolve(value);
        },
        reject: (reason) => {
          finish();
          reject(reason);
        }
      });

      this.connect().then(
        (socket) => {
          // Settled meanwhile (timeout, abort or close): don't send it
          if (!this.pending.has(id)) return;

          socket.send(message);
        },
        (error: unknown) =>
          this.pending
            .get(id)
            ?.reject(
              new RemoteTaskError(
                taskName,
                `Remote task '${taskName}' couldn't connect to ${this.settings.endpoint}`,
                { cause: error }
              )
            )
      );
    });
  }

  /** The open socket, opening one first if needed. */
  private connect(): Promise<WebSocket> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket);
    }

    if (this.opening) return this.opening;

    const opening = new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(this.settings.endpoint);

      this.connecting = socket;
      socket.addEventListener(
        'open',
        () => {
          // Abandoned by close() while connecting: don't keep it open
          if (this.opening !== opening) {
            socket.close();

            return;
          }

          this.opening = undefined;
          this.connecting = undefined;
          this.socket = socket;
          resolve(socket);
        },
        { once: true }
      );
      socket.addEventListener('message', (event) => this.onMessage(event));
      socket.addEventListener(
        'close',
        () => {
          if (this.opening === opening) {
            this.opening = undefined;
            this.connecting = undefined;
            reject(new Error('the connection closed before it opened'));
          }

          if (this.socket === socket) {
            this.socket = undefined;
            this.rejectPending('the connection closed');
          }
        },
        { once: true }
      );
    });

    this.opening = opening;

    return opening;
  }

  /** Match a reply to its task by id; ignore anything that can't be matched. */
  private onMessage(event: MessageEvent) {
    let reply: unknown;

    try {
      reply = JSON.parse(String(event.data));
    } catch {
      return;
    }

    if (!isPlainObject(reply) || typeof reply.id !== 'number') return;

    const task = this.pending.get(reply.id);

    if (!task) return;

    try {
      task.resolve(this.settle(task.taskName, reply));
    } catch (error) {
      task.reject(error);
    }
  }

  /** Reject every task still waiting for a reply. */
  private rejectPending(why: string) {
    for (const task of [...this.pending.values()]) {
      task.reject(
        new RemoteTaskError(
          task.taskName,
          `Remote task '${task.taskName}' got no reply: ${why}`
        )
      );
    }
  }
}

/**
 * Creates a RemoteCompute backend.
 *
 * @param options - The transport, endpoint, allowed tasks and, optionally,
 * a timeout and fetch headers.
 * @returns A new RemoteCompute instance.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For an unknown transport, an endpoint with the wrong
 * URL scheme, or a negative timeout.
 */
export function createRemoteCompute(options: RemoteComputeOptionsInterface) {
  return new RemoteCompute(options);
}
