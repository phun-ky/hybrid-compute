import type { TaskContextInterface } from '@hybrid-compute/core';

/**
 * Options for {@link createThreadedCompute}.
 *
 * @property url - The worker script, started as a module worker. Usually
 * `new URL('./worker.js', import.meta.url)`, so bundlers find it.
 * @property canRunTasks - The tasks the worker script can run. Only these are
 * sent to it.
 * @property timeout - How long to wait for a reply, in milliseconds, before
 * rejecting with a `WorkerTaskError`. Defaults to `0`: no timeout, since
 * workers are for long running work.
 *
 * @example
 * ```ts
 * const options: ThreadedComputeOptionsInterface = {
 *   url: new URL('./worker.js', import.meta.url),
 *   canRunTasks: ['resizeImage'],
 *   timeout: 10_000
 * };
 * ```
 */
export interface ThreadedComputeOptionsInterface {
  url: string | URL;
  canRunTasks: readonly string[];
  timeout?: number;
}

/**
 * What the worker script receives for each task: the task name, its input
 * and an `id`, which the reply must repeat. The input is copied with the
 * structured clone algorithm, so it can't hold functions or DOM nodes.
 *
 * @example
 * ```ts
 * const message: WorkerTaskMessageInterface = { id: 1, task: 'double', input: 21 };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 */
export interface WorkerTaskMessageInterface<Input = unknown> {
  id: number;
  task: string;
  input: Input;
}

/**
 * What the worker script receives when a task is cancelled or times out:
 * the task's `id` and `cancel: true`. {@link exposeTasks} aborts the task's
 * signal; a hand written worker script can ignore it.
 *
 * @example
 * ```ts
 * const message: WorkerCancelMessageInterface = { id: 1, cancel: true };
 * ```
 */
export interface WorkerCancelMessageInterface {
  id: number;
  cancel: true;
}

/**
 * What the worker script sends back: the task's `id` with either a `result`
 * or an `error`. An `error` (a message string, or an object with a `message`)
 * rejects the task with a `WorkerTaskError`.
 *
 * @example
 * ```ts
 * self.postMessage({ id: 1, result: 42 } satisfies WorkerResultMessageInterface);
 * ```
 */
export interface WorkerResultMessageInterface<Output = unknown> {
  id: number;
  result?: Output;
  error?: unknown;
}

/**
 * A task in the worker script, for {@link exposeTasks}. It gets the input and
 * a context with a `signal`, which aborts when the caller cancels the task or
 * its timeout passes.
 *
 * @typeParam Input - The input type of the task.
 * @typeParam Output - The output type of the task.
 */
export type WorkerTaskType<Input = never, Output = unknown> = (
  input: Input,
  context: Required<TaskContextInterface>
) => Output | Promise<Output>;

/**
 * Where {@link exposeTasks} listens and replies. Defaults to the worker's
 * global scope (`self`); pass another one to adapt it, for example to a
 * `MessagePort`.
 */
export interface WorkerScopeInterface {
  addEventListener(
    type: 'message',
    listener: (event: { data: unknown }) => void
  ): void;
  postMessage(message: unknown): void;
}
