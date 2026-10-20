import {
  NoBackendError,
  type ComputeBackendInterface,
  type RunTaskOptionsInterface
} from '@hybrid-compute/core';

import { WorkerTaskError } from './errors.js';
import type {
  ThreadedComputeOptionsInterface,
  WorkerCancelMessageInterface,
  WorkerTaskMessageInterface
} from './types.js';
import { describeValue, isPlainObject, messageOf } from './utils.js';

export * from './errors.js';

export * from './expose.js';

export * from './types.js';

/** A task waiting for its reply from the worker. */
type PendingTaskType = {
  taskName: string;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

/** Whether this runtime has Web Workers. */
const hasWorkers = () => typeof Worker === 'function';
/**
 * Check the options and return them normalised.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For a negative timeout.
 */
const toSettings = (options: unknown) => {
  if (!isPlainObject(options)) {
    throw new TypeError(
      `createThreadedCompute expects an options object, got ${describeValue(options)}`
    );
  }

  const { url, canRunTasks, timeout } = options;

  if (!(url instanceof URL) && (typeof url !== 'string' || url === '')) {
    throw new TypeError(
      `url must be a URL or a non-empty string, got ${describeValue(url)}`
    );
  }

  if (
    !Array.isArray(canRunTasks) ||
    !canRunTasks.every((name) => typeof name === 'string' && name !== '')
  ) {
    throw new TypeError(
      `canRunTasks must be an array of task names, got ${describeValue(canRunTasks)}`
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

  return {
    url: url as string | URL,
    tasks: new Set(canRunTasks as string[]) as ReadonlySet<string>,
    timeout: (timeout as number | undefined) ?? 0
  };
};

/**
 * ThreadedCompute is a backend that runs tasks in a dedicated module Web
 * Worker, so heavy work doesn't block the main thread.
 *
 * It starts the worker on the first task, not when it's created, sends each
 * task with an id and matches the replies by id. Write the worker script with
 * {@link exposeTasks}, or by hand following {@link WorkerTaskMessageInterface}
 * and {@link WorkerResultMessageInterface}.
 *
 * Every failure (an `error` in the reply, a crash, the timeout) rejects with a
 * {@link WorkerTaskError}. If the worker crashes, a new one starts on the next
 * task. Call {@link ThreadedCompute.close} when you're done with it.
 *
 * Web Workers only exist in browsers (and Deno and Bun): where there is no
 * global `Worker`, `canRun` returns `false`, so the `auto` strategy uses
 * another backend.
 *
 * @example
 * ```ts
 * const threaded = createThreadedCompute({
 *   url: new URL('./worker.js', import.meta.url),
 *   canRunTasks: ['add']
 * });
 *
 * const result = await threaded.runTask<number, number>('add', 5);
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */
export class ThreadedCompute implements ComputeBackendInterface {
  private readonly settings: ReturnType<typeof toSettings>;
  private worker?: Worker;
  private readonly pending = new Map<number, PendingTaskType>();
  private nextId = 1;

  /**
   * Creates the backend. It checks the options, and starts no worker until
   * the first task.
   *
   * @param options - The worker script, the tasks it can run and,
   * optionally, a timeout.
   *
   * @throws {TypeError} For a missing or wrongly typed option.
   * @throws {RangeError} For a negative timeout.
   */
  constructor(options: ThreadedComputeOptionsInterface) {
    this.settings = toSettings(options);
  }

  /**
   * Determines if this backend can run the given task.
   *
   * @param taskName - Name of the task.
   * @returns `true` if the task is in `canRunTasks` and this runtime has Web
   * Workers.
   */
  canRun(taskName: string): boolean {
    return hasWorkers() && this.settings.tasks.has(taskName);
  }

  /**
   * Runs a task in the worker and waits for its reply.
   *
   * @typeParam Input - The input type of the task.
   * @typeParam Output - The output type of the task.
   *
   * @param taskName - The name of the task to run.
   * @param input - The input for the task. It's copied with the structured
   * clone algorithm, so it can't hold functions or DOM nodes.
   * @param options - Options for this call. With a `signal`, `runTask`
   * rejects with the signal's reason as soon as it aborts, and the worker is
   * told to cancel the task.
   * @returns A Promise resolving to the reply's `result`. It rejects with a
   * `NoBackendError` (from `@hybrid-compute/core`) if the task isn't in
   * `canRunTasks`, a `TypeError` if this runtime has no Web Workers, a
   * {@link WorkerTaskError} if the task fails, and with the signal's reason
   * if the call is cancelled.
   *
   * @example
   * ```ts
   * const result = await threaded.runTask('square', 9); // 81
   * ```
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input,
    options?: RunTaskOptionsInterface
  ): Promise<Output> {
    if (!this.settings.tasks.has(taskName)) {
      throw new NoBackendError(
        taskName,
        'worker',
        `The worker can't run task '${taskName}'; it isn't in canRunTasks`
      );
    }

    if (!hasWorkers()) {
      throw new TypeError(
        'Web Workers are not available in this runtime; @hybrid-compute/worker needs a global Worker'
      );
    }

    const signal = options?.signal;

    if (signal?.aborted) throw signal.reason;

    const worker = this.start(taskName);
    const { timeout } = this.settings;
    const id = this.nextId++;

    return new Promise<Output>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const finish = () => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        this.pending.delete(id);
      };
      // Settled before the worker replied: tell the worker to stop
      const cancel = () => {
        const message: WorkerCancelMessageInterface = { id, cancel: true };

        worker.postMessage(message);
      };
      const onAbort = () => {
        finish();
        cancel();
        reject(signal?.reason);
      };

      if (timeout > 0) {
        timer = setTimeout(() => {
          finish();
          cancel();
          reject(
            new WorkerTaskError(
              taskName,
              `Worker task '${taskName}' timed out after ${timeout} ms`
            )
          );
        }, timeout);
      }

      signal?.addEventListener('abort', onAbort, { once: true });
      this.pending.set(id, {
        taskName,
        resolve: (value) => {
          finish();
          resolve(value as Output);
        },
        reject: (reason) => {
          finish();
          reject(reason);
        }
      });

      const message: WorkerTaskMessageInterface<Input> = {
        id,
        task: taskName,
        input
      };

      try {
        worker.postMessage(message);
      } catch (error) {
        this.pending
          .get(id)
          ?.reject(
            new WorkerTaskError(
              taskName,
              `Worker task '${taskName}' couldn't send its input to the worker`,
              { cause: error }
            )
          );
      }
    });
  }

  /**
   * Terminates the worker, if one is running. Tasks still waiting for a
   * reply reject with a {@link WorkerTaskError}. The next task starts a new
   * worker.
   */
  close(): void {
    const { worker } = this;

    this.worker = undefined;
    worker?.terminate();
    this.rejectPending('the worker was closed');
  }

  /** The running worker, starting one first if needed. */
  private start(taskName: string): Worker {
    if (this.worker) return this.worker;

    let worker: Worker;

    try {
      worker = new Worker(this.settings.url, { type: 'module' });
    } catch (error) {
      throw new WorkerTaskError(
        taskName,
        `Worker task '${taskName}' couldn't start the worker ${String(this.settings.url)}`,
        { cause: error }
      );
    }

    worker.addEventListener('message', (event) => this.onMessage(event));
    // An uncaught error, or a script that fails to load: the worker is in an
    // unknown state, so reject what it was doing and start over next time
    worker.addEventListener('error', (event) => {
      if (this.worker !== worker) return;

      const detail = (event as Partial<ErrorEvent>).message;

      this.worker = undefined;
      worker.terminate();
      this.rejectPending(
        detail
          ? `the worker threw: ${detail}`
          : 'the worker failed: its script did not load, or threw while starting',
        event
      );
    });
    // A reply that couldn't be deserialised: nothing tells which task it
    // was for, so reject them all instead of letting one wait forever
    worker.addEventListener('messageerror', (event) => {
      if (this.worker !== worker) return;

      this.rejectPending('a reply from the worker could not be read', event);
    });
    this.worker = worker;

    return worker;
  }

  /** Match a reply to its task by id; ignore anything that can't be matched. */
  private onMessage(event: MessageEvent) {
    const reply: unknown = event.data;

    if (!isPlainObject(reply) || typeof reply.id !== 'number') return;

    const task = this.pending.get(reply.id);

    if (!task) return;

    const { taskName } = task;
    const { error } = reply;

    if (error !== undefined && error !== null) {
      const text = messageOf(error);

      task.reject(
        new WorkerTaskError(
          taskName,
          `Worker task '${taskName}' failed${text ? `: ${text}` : ''}`,
          { detail: error }
        )
      );
    } else if ('result' in reply) {
      task.resolve(reply.result);
    } else {
      task.reject(
        new WorkerTaskError(
          taskName,
          `Worker task '${taskName}' got a reply with neither a result nor an error`
        )
      );
    }
  }

  /** Reject every task still waiting for a reply. */
  private rejectPending(why: string, cause?: unknown) {
    for (const task of [...this.pending.values()]) {
      task.reject(
        new WorkerTaskError(
          task.taskName,
          `Worker task '${task.taskName}' got no reply: ${why}`,
          { cause }
        )
      );
    }
  }
}

/**
 * Creates a ThreadedCompute backend.
 *
 * @param options - The worker script, the tasks it can run and,
 * optionally, a timeout.
 * @returns A new `ThreadedCompute` instance.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For a negative timeout.
 *
 * @example
 * ```ts
 * const backend = createThreadedCompute({
 *   url: new URL('./worker.js', import.meta.url),
 *   canRunTasks: ['resizeImage']
 * });
 * ```
 */
export function createThreadedCompute(
  options: ThreadedComputeOptionsInterface
) {
  return new ThreadedCompute(options);
}
