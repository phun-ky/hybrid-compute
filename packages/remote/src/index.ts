import { ComputeBackendInterface } from '@hybrid-compute/core';

import { RemoteComputeOptionsInterface, RemoteTransportType } from './types.js';

export * from './types.js';

/**
 * RemoteCompute is a backend that delegates task execution to a remote service
 * over HTTP (`fetch`) or a persistent WebSocket connection.
 *
 * It supports task registration via `canRunTasks` and routes input/output using
 * a JSON-based messaging protocol. Each task request is assigned a unique ID
 * to match responses (especially important for WebSocket communication).
 *
 * @example
 * ```ts
 * const remote = new RemoteCompute({
 *   transport: 'fetch',
 *   endpoint: 'https://api.example.com/compute',
 *   canRunTasks: ['generateReport']
 * });
 *
 * const result = await remote.runTask('generateReport', { userId: 'abc123' });
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export class RemoteCompute implements ComputeBackendInterface {
  private transport: RemoteTransportType;
  private endpoint: string;
  private canRunSet: Set<string>;
  private socket?: WebSocket;
  private pending = new Map<
    number,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve: (value: any | PromiseLike<any>) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reject: (value: any | PromiseLike<any>) => void;
    }
  >();
  private nextId = 1;

  /**
   * Constructs a RemoteCompute backend with either fetch or WebSocket transport.
   *
   * @param options - Configuration including transport type, endpoint URL, and optional task whitelist.
   */
  constructor(options: RemoteComputeOptionsInterface) {
    this.transport = options.transport;
    this.endpoint = options.endpoint;
    this.canRunSet = new Set(options.canRunTasks ?? []);

    if (this.transport === 'websocket') {
      this.socket = new WebSocket(this.endpoint);

      this.socket.onmessage = (event: MessageEvent) => {
        const { id, result, error } = JSON.parse(event.data);

        if (error) this.pending.get(id)?.reject(error);
        else this.pending.get(id)?.resolve(result);

        this.pending.delete(id);
      };
    }
  }

  /**
   * Checks whether this backend can execute a specific task.
   *
   * @param taskName - The name of the task to check.
   * @returns `true` if the task is allowed or unrestricted, `false` otherwise.
   */
  canRun(taskName: string): boolean {
    return this.canRunSet.size === 0 || this.canRunSet.has(taskName);
  }

  /**
   * Runs a task using the remote backend, via HTTP or WebSocket transport.
   *
   * @typeParam Input - Input data structure expected by the task.
   * @typeParam Output - Expected output structure returned by the backend.
   *
   * @param taskName - The task to run.
   * @param input - Input data for the task.
   * @returns A Promise resolving to the output.
   * @throws If transport fails or task is rejected remotely.
   *
   * @example
   * ```ts
   * const output = await remote.runTask('translateText', { text: 'hello' });
   * ```
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input
  ): Promise<Output> {
    const id = this.nextId++;

    if (this.transport === 'fetch') {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskName, input })
      });
      const { result, error } = await response.json();

      if (error) throw new Error(error);

      return result;
    }

    return new Promise<Output>((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));

        return;
      }

      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ task: taskName, input, id }));
    });
  }
}

/**
 * Factory function for creating a RemoteCompute instance.
 *
 * @param options - The backend transport type and endpoint configuration.
 * @returns A new `RemoteCompute` instance.
 *
 * @example
 * ```ts
 * const remote = createRemoteCompute({
 *   transport: 'websocket',
 *   endpoint: 'wss://example.org/ws',
 *   canRunTasks: ['analyzeSentiment']
 * });
 * ```
 */
export function createRemoteCompute(options: RemoteComputeOptionsInterface) {
  return new RemoteCompute(options);
}
