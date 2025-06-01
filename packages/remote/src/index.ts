/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputeBackendInterface } from '@hybrid-compute/core';

import { RemoteComputeOptionsInterface, RemoteTransportType } from './types.js';

export * from './types.js';

/**
 * RemoteCompute is a backend that delegates compute tasks to a remote API
 * using either HTTP requests (fetch) or a persistent WebSocket connection.
 *
 * It supports bidirectional communication, which is useful for low-latency
 * or streaming scenarios using WebSocket, or traditional stateless interaction
 * using fetch.
 *
 * @remarks
 * WebSocket-based transport allows concurrent request handling via an internal
 * request/response map using `id`. This is useful when running multiple tasks in parallel.
 *
 * Fetch transport is simpler and more interoperable with typical REST APIs.
 *
 * @example Fetch transport
 * ```ts
 * const remote = new RemoteCompute({
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
 * const remote = new RemoteCompute({
 *   transport: 'websocket',
 *   endpoint: 'wss://api.example.com/ws',
 *   canRunTasks: ['analyzeSentiment']
 * });
 *
 * const result = await remote.runTask('analyzeSentiment', { text: 'It works!' });
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
      resolve: (value: any | PromiseLike<any>) => void;
      reject: (value: any | PromiseLike<any>) => void;
    }
  >();
  private nextId = 1;

  /**
   * Initializes the remote compute backend.
   *
   * @param options - Transport type and endpoint configuration.
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
   * Determines if this backend is allowed to handle the given task.
   *
   * @param taskName - Name of the task.
   * @returns `true` if task is permitted, or if no restrictions are set.
   */
  canRun(taskName: string): boolean {
    return this.canRunSet.size === 0 || this.canRunSet.has(taskName);
  }

  /**
   * Executes the specified task using remote communication.
   *
   * @typeParam Input - The input data structure expected by the task.
   * @typeParam Output - The output structure returned by the task.
   *
   * @param taskName - Name of the remote task.
   * @param input - Input data to send.
   * @returns A promise resolving to the result from the server.
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
 * Factory to create a RemoteCompute instance with given options.
 *
 * @param options - Remote connection configuration.
 * @returns Instance of RemoteCompute.
 */
export function createRemoteCompute(options: RemoteComputeOptionsInterface) {
  return new RemoteCompute(options);
}
