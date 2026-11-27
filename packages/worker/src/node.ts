// The Node.js entry point, @hybrid-compute/worker/node: the same API, with
// workers started by node:worker_threads instead of the global Worker.
/// <reference types="node" />
import { Worker as Thread } from 'node:worker_threads';

import {
  isPlainObject,
  RUNTIME,
  type WorkerRuntimeInterface
} from './utils.js';

import {
  ThreadedCompute as WebThreadedCompute,
  type ThreadedComputeOptionsInterface
} from './index.js';

export * from './errors.js';

export * from './expose.js';

export * from './types.js';

/**
 * Options for {@link createThreadedCompute} in Node.js. Give exactly one of
 * `url` and `createWorker`.
 *
 * @property createWorker - A function that returns a new `Worker` from
 * `node:worker_threads`, for options such as `execArgv` or `resourceLimits`.
 * It's called on the first task, and again to start a new worker after a
 * crash or {@link ThreadedCompute.close}.
 * @property url - The worker script: a `file:` URL, an absolute path, or a
 * path starting with `./` relative to the working directory.
 * @property canRunTasks - The tasks the worker script can run. Only these are
 * sent to it.
 * @property timeout - How long to wait for a reply, in milliseconds, before
 * rejecting with a `WorkerTaskError`. Defaults to `0`: no timeout.
 *
 * @example
 * ```ts
 * const options: NodeThreadedComputeOptionsInterface = {
 *   url: new URL('./resize.worker.js', import.meta.url),
 *   canRunTasks: ['resizeImage']
 * };
 * ```
 */
export interface NodeThreadedComputeOptionsInterface extends Omit<
  ThreadedComputeOptionsInterface,
  'createWorker'
> {
  createWorker?: () => Thread;
}

/**
 * A worker_threads Worker as a Web Worker: the events ThreadedCompute listens
 * for, and a thread that only keeps the process alive while a task is
 * waiting for its reply.
 */
class ThreadWorker extends EventTarget {
  /** Ids of the tasks waiting for a reply. */
  private readonly waiting = new Set<number>();

  constructor(private readonly thread: Thread) {
    super();
    thread.unref();
    thread.on('message', (data: unknown) => {
      // A progress message isn't the reply: keep the thread alive for it
      if (
        isPlainObject(data) &&
        typeof data.id === 'number' &&
        !('progress' in data)
      ) {
        this.settle(data.id);
      }

      this.dispatchEvent(new MessageEvent('message', { data }));
    });
    thread.on('error', (error: Error) =>
      this.dispatchEvent(
        Object.assign(new Event('error'), { message: error.message, error })
      )
    );
    thread.on('messageerror', (error: Error) => {
      // ThreadedCompute rejects every waiting task on a messageerror
      this.waiting.clear();
      this.thread.unref();
      this.dispatchEvent(Object.assign(new Event('messageerror'), { error }));
    });
    // A worker script that calls process.exit() would otherwise leave its
    // tasks waiting forever. After an error or terminate(), ThreadedCompute
    // has let go of this worker and ignores the event.
    thread.on('exit', (code: number) =>
      this.dispatchEvent(
        Object.assign(new Event('error'), {
          message: `it exited with code ${code}`
        })
      )
    );
  }

  postMessage(message: unknown, transfer?: Transferable[]) {
    this.thread.postMessage(
      message,
      transfer as Parameters<Thread['postMessage']>[1]
    );

    if (!isPlainObject(message) || typeof message.id !== 'number') return;

    if (message.cancel === true) {
      this.settle(message.id);
    } else {
      this.waiting.add(message.id);
      this.thread.ref();
    }
  }

  terminate() {
    void this.thread.terminate();
  }

  /** A task got its reply or was cancelled: let the process exit when idle. */
  private settle(id: number) {
    this.waiting.delete(id);

    if (this.waiting.size === 0) this.thread.unref();
  }
}

const NODE_RUNTIME: WorkerRuntimeInterface = {
  available: () => true,
  fromUrl: (url) => new ThreadWorker(new Thread(url)) as unknown as Worker,
  // Anything else is left for ThreadedCompute to reject as not a Worker
  wrap: (worker) =>
    (worker instanceof Thread
      ? new ThreadWorker(worker)
      : worker) as unknown as Worker
};

/**
 * ThreadedCompute for Node.js: the backend from `@hybrid-compute/worker`,
 * running tasks in a `worker_threads` thread instead of a Web Worker. The
 * worker script is the same: {@link exposeTasks} finds `parentPort` itself.
 *
 * The thread keeps the process alive only while a task is waiting for its
 * reply, so a script can end without calling {@link ThreadedCompute.close}.
 *
 * @example
 * ```ts
 * import { createThreadedCompute } from '@hybrid-compute/worker/node';
 *
 * const threaded = createThreadedCompute({
 *   url: new URL('./add.worker.js', import.meta.url),
 *   canRunTasks: ['add']
 * });
 *
 * await threaded.runTask('add', [2, 3]); // 5
 * ```
 *
 * @see https://nodejs.org/api/worker_threads.html
 */
export class ThreadedCompute extends WebThreadedCompute {
  /**
   * Creates the backend. It checks the options, and starts no thread until
   * the first task.
   *
   * @param options - The worker script (`url` or `createWorker`), the tasks
   * it can run and, optionally, a timeout.
   *
   * @throws {TypeError} For a missing or wrongly typed option.
   * @throws {RangeError} For a negative timeout.
   */
  constructor(options: NodeThreadedComputeOptionsInterface) {
    super(
      (isPlainObject(options)
        ? { ...options, [RUNTIME]: NODE_RUNTIME }
        : options) as ThreadedComputeOptionsInterface
    );
  }
}

/**
 * Creates a ThreadedCompute backend for Node.js, running tasks in a
 * `worker_threads` thread.
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
 * import { Worker } from 'node:worker_threads';
 *
 * const backend = createThreadedCompute({
 *   createWorker: () =>
 *     new Worker(new URL('./resize.worker.js', import.meta.url), {
 *       resourceLimits: { maxOldGenerationSizeMb: 256 }
 *     }),
 *   canRunTasks: ['resizeImage']
 * });
 * ```
 */
export function createThreadedCompute(
  options: NodeThreadedComputeOptionsInterface
) {
  return new ThreadedCompute(options);
}
