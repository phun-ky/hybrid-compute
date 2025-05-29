/**
 * The message format sent from the main thread to a Web Worker when executing a task.
 *
 * This message includes a task name, its input payload, and a unique ID used to match
 * the response from the worker.
 *
 * @property task - The name of the task to be executed in the worker.
 * @property input - The input data for the task. This can be any JSON-serializable value.
 * @property id - A unique identifier for correlating the response message.
 *
 * @example
 * ```ts
 * const message: WorkerTaskMessageInterface = {
 *   task: 'double',
 *   input: 21,
 *   id: 1
 * };
 * worker.postMessage(message);
 * ```
 */
export interface WorkerTaskMessageInterface {
  task: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any;
  id: number;
}

/**
 * The message format sent from a Web Worker back to the main thread upon task completion.
 *
 * This message includes the result of the task execution or an error message if the task failed.
 *
 * @property id - The unique identifier that matches a previously sent task message.
 * @property result - The result of the task execution (if successful).
 * @property error - An optional error message if the task failed.
 *
 * @example
 * ```ts
 * const response: WorkerResultMessageInterface = {
 *   id: 1,
 *   result: 42
 * };
 * postMessage(response);
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
 */
export interface WorkerResultMessageInterface {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  error?: string;
}
