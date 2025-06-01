import { ComputeBackendInterface } from '@hybrid-compute/core';

import {
  WorkerResultMessageInterface,
  WorkerTaskMessageInterface
} from './types.js';

export * from './types.js';

/**
 * `ThreadedCompute` is a compute backend that runs tasks in a dedicated Web Worker.
 *
 * It manages communication with the worker via `postMessage`, assigns unique task
 * request IDs, and resolves results asynchronously. Tasks are registered by name
 * during construction and mapped internally for availability checks.
 *
 * @example
 * ```ts
 * const threaded = new ThreadedCompute(new URL('./worker.js', import.meta.url), ['add']);
 *
 * const result = await threaded.runTask<number, number>('add', 5);
 * console.log(result); // Output from worker
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */
export class ThreadedCompute implements ComputeBackendInterface {
  private worker: Worker;
  private taskMap = new Set<string>();

  // Map of task response IDs to success callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks = new Map<number, (value: any) => void>();

  // Map of task response IDs to error callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private errors = new Map<number, (err: any) => void>();

  private nextId = 1;

  /**
   * Constructs a new `ThreadedCompute` backend with a specified worker and list of available task names.
   *
   * @param workerPath - Path to the worker script (typically a URL via `import.meta.url`).
   * @param taskNames - A list of task identifiers this worker is capable of executing.
   */
  constructor(workerPath: string, taskNames: string[]) {
    this.worker = new Worker(workerPath, { type: 'module' });
    this.taskMap = new Set(taskNames);

    this.worker.onmessage = (e: MessageEvent<WorkerResultMessageInterface>) => {
      const { id, result, error } = e.data;

      if (error) this.errors.get(id)?.(error);
      else this.callbacks.get(id)?.(result);

      this.callbacks.delete(id);
      this.errors.delete(id);
    };
  }

  /**
   * Checks whether the current worker is registered to handle a given task.
   *
   * @param taskName - The name of the task to check.
   * @returns `true` if the task is supported, otherwise `false`.
   */
  canRun(taskName: string): boolean {
    return this.taskMap.has(taskName);
  }

  /**
   * Runs a task inside the Web Worker.
   *
   * The task is assigned a unique ID and sent via `postMessage`. The result or error
   * is resolved asynchronously when the worker responds.
   *
   * @typeParam Input - The input type for the task.
   * @typeParam Output - The output type returned by the task.
   *
   * @param taskName - The name of the task to execute.
   * @param input - The input payload for the task.
   * @returns A Promise resolving to the task output.
   *
   * @example
   * ```ts
   * const result = await threaded.runTask('square', 9); // 81
   * ```
   */
  runTask<Input, Output>(taskName: string, input: Input): Promise<Output> {
    return new Promise<Output>((resolve, reject) => {
      const id = this.nextId++;

      this.callbacks.set(id, resolve);
      this.errors.set(id, reject);

      const message: WorkerTaskMessageInterface = { task: taskName, input, id };

      this.worker.postMessage(message);
    });
  }
}

/**
 * Factory function to create a new `ThreadedCompute` backend.
 *
 * @param workerPath - The module worker file path (e.g. `new URL('./worker.js', import.meta.url)`).
 * @param tasks - A list of supported task names this worker can execute.
 * @returns A new `ThreadedCompute` instance.
 *
 * @example
 * ```ts
 * const backend = createThreadedCompute(new URL('./worker.js', import.meta.url), ['resizeImage']);
 * ```
 */
export function createThreadedCompute(workerPath: string, tasks: string[]) {
  return new ThreadedCompute(workerPath, tasks);
}
