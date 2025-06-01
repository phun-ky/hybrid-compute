/**
 * Represents the communication method used by the `RemoteCompute` backend
 * to interact with a remote server.
 *
 * - `'fetch'`: Sends HTTP POST requests for each task.
 * - `'websocket'`: Maintains a persistent WebSocket connection for bi-directional messaging.
 *
 * @example
 * ```ts
 * const transport: RemoteTransportType = 'fetch';
 * ```
 */
export type RemoteTransportType = 'fetch' | 'websocket';

/**
 * Configuration options for initializing a `RemoteCompute` backend.
 *
 * @property transport - The transport mechanism to use (`fetch` or `websocket`).
 * @property endpoint - The server URL for handling task requests.
 * @property canRunTasks - An optional list of task names this backend can handle. If omitted, it is assumed the backend can attempt all tasks.
 *
 * @example
 * ```ts
 * const options: RemoteComputeOptionsInterface = {
 *   transport: 'websocket',
 *   endpoint: 'wss://api.example.com/ws',
 *   canRunTasks: ['resizeImage', 'generatePDF']
 * };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export interface RemoteComputeOptionsInterface {
  transport: RemoteTransportType;
  endpoint: string;
  canRunTasks?: string[];
}
