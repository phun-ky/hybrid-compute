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
import {
  describeValue,
  isPlainObject,
  messageOf,
  RUNTIME,
  WEB_RUNTIME,
  type WorkerRuntimeInterface
} from './utils.js';

export * from './errors.js';

export * from './expose.js';

export * from './types.js';

/** A task waiting for its reply from the worker. */
type PendingTaskType = {
  taskName: string;
  worker: Worker;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  progress: (value: unknown) => void;
};

/**
 * Check the options and return them normalised.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For a negative timeout, or fewer than one worker.
 */
const toSettings = (options: unknown) => {
  if (!isPlainObject(options)) {
    throw new TypeError(
      `createThreadedCompute expects an options object, got ${describeValue(options)}`
    );
  }

  const { url, createWorker, canRunTasks, timeout, workers } = options;

  if ((url === undefined) === (createWorker === undefined)) {
    throw new TypeError(
      'Give either url or createWorker: url for a worker script served as it is, createWorker when a bundler builds it'
    );
  }

  if (
    url !== undefined &&
    !(url instanceof URL) &&
    (typeof url !== 'string' || url === '')
  ) {
    throw new TypeError(
      `url must be a URL or a non-empty string, got ${describeValue(url)}`
    );
  }

  if (createWorker !== undefined && typeof createWorker !== 'function') {
    throw new TypeError(
      `createWorker must be a function that returns a new Worker, got ${describeValue(createWorker)}`
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

  if (workers !== undefined && !Number.isInteger(workers)) {
    throw new TypeError(
      `workers must be a whole number, got ${describeValue(workers)}`
    );
  }

  if (typeof workers === 'number' && workers < 1) {
    throw new RangeError(`workers must be 1 or more, got ${workers}`);
  }

  // Web Workers, unless an entry point such as ./node.ts passed another
  const runtime =
    (options as { [RUNTIME]?: WorkerRuntimeInterface })[RUNTIME] ?? WEB_RUNTIME;

  return {
    available: runtime.available,
    // One way to start a worker, whichever option was given
    createWorker:
      createWorker === undefined
        ? () => runtime.fromUrl(url as string | URL)
        : () => runtime.wrap((createWorker as () => unknown)()),
    // For error messages
    source:
      createWorker === undefined ? `the worker ${String(url)}` : 'createWorker',
    tasks: new Set(canRunTasks as string[]) as ReadonlySet<string>,
    timeout: (timeout as number | undefined) ?? 0,
    workers: (workers as number | undefined) ?? 1
  };
};

/**
 * ThreadedCompute is a backend that runs tasks in a dedicated module Web
 * Worker, so heavy work doesn't block the main thread.
 *
 * It starts the worker on the first task, not when it's created, sends each
 * task with an id and matches the replies by id. With `workers` above 1, it
 * starts another worker only when every running one is busy, up to that
 * many, and sends each task to an idle worker, or else the least busy one. Write the worker script with
 * {@link exposeTasks}, or by hand following {@link WorkerTaskMessageInterface}
 * and {@link WorkerResultMessageInterface}.
 *
 * Every failure (an `error` in the reply, a crash, the timeout) rejects with a
 * {@link WorkerTaskError}. If a worker crashes, only its tasks reject, and a
 * new one starts when needed. Call {@link ThreadedCompute.close} when you're done with it.
 *
 * Web Workers only exist in browsers (and Deno and Bun): where there is no
 * global `Worker`, `canRun` returns `false`, so the `auto` strategy uses
 * another backend. For Node.js's `worker_threads`, import
 * `createThreadedCompute` from `@hybrid-compute/worker/node` instead.
 *
 * @example With a bundler
 * ```ts
 * // Vite and webpack build the worker script when they see this literal
 * // new Worker(new URL(...)), so keep it written out in full
 * const threaded = createThreadedCompute({
 *   createWorker: () =>
 *     new Worker(new URL('./add.worker.ts', import.meta.url), {
 *       type: 'module'
 *     }),
 *   canRunTasks: ['add']
 * });
 *
 * const result = await threaded.runTask<number, number>('add', 5);
 * ```
 *
 * @example Without a bundler
 * ```ts
 * const threaded = createThreadedCompute({
 *   url: '/workers/add.worker.js',
 *   canRunTasks: ['add']
 * });
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */
export class ThreadedCompute implements ComputeBackendInterface {
  private readonly settings: ReturnType<typeof toSettings>;
  private workers: Worker[] = [];
  private readonly pending = new Map<number, PendingTaskType>();
  private nextId = 1;

  /**
   * Creates the backend. It checks the options, and starts no worker until
   * the first task.
   *
   * @param options - The worker script (`url` or `createWorker`), the tasks
   * it can run and, optionally, a timeout.
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
    return this.settings.available() && this.settings.tasks.has(taskName);
  }

  /**
   * Runs a task in the worker and waits for its reply.
   *
   * @typeParam Input - The input type of the task.
   * @typeParam Output - The output type of the task.
   *
   * @param taskName - The name of the task to run.
   * @param input - The input for the task. It's copied with the structured
   * clone algorithm, so it can't hold functions or DOM nodes. A
   * `SharedArrayBuffer` in it is shared, not copied, where the page is
   * cross-origin isolated.
   * @param options - Options for this call. With a `signal`, `runTask`
   * rejects with the signal's reason as soon as it aborts, and the worker is
   * told to cancel the task. The objects in `transfer` are transferred to the
   * worker instead of copied. `onProgress` gets each progress value the task
   * sends; if it throws, the task rejects with that error and the worker is
   * told to cancel it.
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

    if (!this.settings.available()) {
      throw new TypeError(
        "Web Workers are not available in this runtime; @hybrid-compute/worker needs a global Worker. In Node.js, use '@hybrid-compute/worker/node'"
      );
    }

    const signal = options?.signal;

    if (signal?.aborted) throw signal.reason;

    const worker = this.pick(taskName);
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
        worker,
        resolve: (value) => {
          finish();
          resolve(value as Output);
        },
        reject: (reason) => {
          finish();
          reject(reason);
        },
        progress: (value) => {
          try {
            options?.onProgress?.(value);
          } catch (error) {
            finish();
            cancel();
            reject(error);
          }
        }
      });

      const message: WorkerTaskMessageInterface<Input> = {
        id,
        task: taskName,
        input
      };

      try {
        worker.postMessage(message, [...(options?.transfer ?? [])]);
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
   * Terminates the running workers. Tasks still waiting for a reply reject
   * with a {@link WorkerTaskError}. The next task starts a new worker.
   */
  close(): void {
    const { workers } = this;

    this.workers = [];

    for (const worker of workers) worker.terminate();

    this.rejectPending('the worker was closed');
  }

  /**
   * An idle worker, else a new one while there's room, else the least busy.
   * A task the caller stopped waiting for no longer counts, even if the
   * worker script ignores the cancel and goes on running it.
   */
  private pick(taskName: string): Worker {
    const tasks = [...this.pending.values()];
    const load = this.workers.map(
      (worker) => tasks.filter((task) => task.worker === worker).length
    );
    const idle = load.indexOf(0);

    if (idle !== -1) return this.workers[idle];

    if (this.workers.length < this.settings.workers) {
      return this.start(taskName);
    }

    return this.workers[load.indexOf(Math.min(...load))];
  }

  /** Start a new worker and add it to the running ones. */
  private start(taskName: string): Worker {
    let worker: Worker;

    try {
      worker = this.settings.createWorker();
    } catch (error) {
      throw new WorkerTaskError(
        taskName,
        `Worker task '${taskName}' couldn't start ${this.settings.source}`,
        { cause: error }
      );
    }

    if (
      typeof worker?.postMessage !== 'function' ||
      typeof worker.addEventListener !== 'function' ||
      typeof worker.terminate !== 'function'
    ) {
      throw new WorkerTaskError(
        taskName,
        `Worker task '${taskName}' couldn't start: createWorker returned ${describeValue(worker)}, not a Worker`
      );
    }

    worker.addEventListener('message', (event) => this.onMessage(event));
    // An uncaught error, or a script that fails to load: the worker is in an
    // unknown state, so reject what it was doing and start over next time
    worker.addEventListener('error', (event) => {
      if (!this.workers.includes(worker)) return;

      const detail = (event as Partial<ErrorEvent>).message;

      this.workers = this.workers.filter((running) => running !== worker);
      worker.terminate();
      this.rejectPending(
        detail
          ? `the worker threw: ${detail}`
          : 'the worker failed: its script did not load, or threw while starting',
        event,
        worker
      );
    });
    // A reply that couldn't be deserialised: nothing tells which task it
    // was for, so reject all of this worker's instead of letting one wait
    worker.addEventListener('messageerror', (event) => {
      if (!this.workers.includes(worker)) return;

      this.rejectPending(
        'a reply from the worker could not be read',
        event,
        worker
      );
    });
    this.workers.push(worker);

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

    if ('progress' in reply) {
      task.progress(reply.progress);
    } else if (error !== undefined && error !== null) {
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

  /** Reject the tasks still waiting for a reply, all or one worker's. */
  private rejectPending(why: string, cause?: unknown, worker?: Worker) {
    for (const task of [...this.pending.values()]) {
      if (worker && task.worker !== worker) continue;

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
 * @param options - The worker script (`url` or `createWorker`), the tasks it
 * can run and, optionally, a timeout.
 * @returns A new `ThreadedCompute` instance.
 *
 * @throws {TypeError} For a missing or wrongly typed option.
 * @throws {RangeError} For a negative timeout.
 *
 * @example
 * ```ts
 * const backend = createThreadedCompute({
 *   createWorker: () =>
 *     new Worker(new URL('./resize.worker.ts', import.meta.url), {
 *       type: 'module'
 *     }),
 *   canRunTasks: ['resizeImage']
 * });
 * ```
 */
export function createThreadedCompute(
  options: ThreadedComputeOptionsInterface
) {
  return new ThreadedCompute(options);
}
