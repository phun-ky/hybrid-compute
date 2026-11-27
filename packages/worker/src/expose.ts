import type { WorkerScopeInterface, WorkerTaskType } from './types.js';
import { describeValue, isPlainObject } from './utils.js';

/** An error as a value the structured clone algorithm can copy. */
const toErrorValue = (error: unknown) => {
  if (error instanceof Error)
    return { name: error.name, message: error.message };

  if (typeof error === 'string') return error;

  return { message: String(error) };
};
/**
 * In a Node.js worker thread, its parentPort. getBuiltinModule rather than an
 * import, so a bundler building for the browser doesn't see node:worker_threads.
 */
const nodeParentPort = () => {
  const { process } = globalThis as {
    process?: { getBuiltinModule?: (id: string) => unknown };
  };
  const threads = process?.getBuiltinModule?.('node:worker_threads') as
    { parentPort?: WorkerScopeInterface | null } | undefined;

  return threads?.parentPort ?? undefined;
};
/**
 * The worker's global scope, or a Node.js thread's parentPort, or a TypeError
 * outside a worker.
 */
const workerScope = (): WorkerScopeInterface => {
  const scope = globalThis as unknown as Partial<WorkerScopeInterface>;

  if (
    'WorkerGlobalScope' in globalThis &&
    typeof scope.addEventListener === 'function' &&
    typeof scope.postMessage === 'function'
  ) {
    return scope as WorkerScopeInterface;
  }

  const port = nodeParentPort();

  if (port) return port;

  throw new TypeError(
    'exposeTasks must be called in a worker script, or be given a scope to listen on'
  );
};
/** Results marked with transfer(), and what to transfer with each. */
const transfers = new WeakMap<object, Transferable[]>();

/**
 * Marks a task's result to be transferred back to the caller instead of
 * copied. Return what it returns. The objects in `list` are detached in the
 * worker once the reply is sent.
 *
 * Don't list a `SharedArrayBuffer`: it's shared without transferring, and
 * listing it fails the task with a `DataCloneError`.
 *
 * @param value - The result, holding the objects in `list`.
 * @param list - The objects to transfer, such as `ArrayBuffer`s.
 * @returns `value`, unchanged.
 *
 * @throws {TypeError} If `value` isn't an object or `list` isn't an array.
 *
 * @example
 * ```ts
 * exposeTasks({
 *   invert: (pixels: Uint8Array) => {
 *     for (let i = 0; i < pixels.length; i++) pixels[i] = 255 - pixels[i];
 *
 *     return transfer(pixels, [pixels.buffer]);
 *   }
 * });
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
 */
export function transfer<T extends object>(value: T, list: Transferable[]): T {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError(
      `transfer expects the result object, got ${describeValue(value)}`
    );
  }

  if (!Array.isArray(list)) {
    throw new TypeError(
      `transfer expects an array of objects to transfer, got ${describeValue(list)}`
    );
  }

  transfers.set(value, list);

  return value;
}

/**
 * Answers tasks from {@link ThreadedCompute} in a worker script: it listens
 * for task messages, runs the task with that name, and replies with its
 * result, or with an error if the task throws, rejects or doesn't exist.
 *
 * Each task gets the input and a context with a `signal`, which aborts when
 * the caller cancels the task or its timeout passes. A task that checks the
 * signal can stop early; its reply is then not sent. The context's `progress`
 * sends a value to the caller's `onProgress`; it throws a `DataCloneError` if
 * the value can't be copied, and does nothing once the task is cancelled.
 *
 * @param tasks - The tasks, by name. List the same names in `canRunTasks`.
 * @param scope - Where to listen and reply. Defaults to the worker's global
 * scope, or in a Node.js worker thread to its `parentPort` (on Node.js 22.3
 * and later; on earlier versions, pass `parentPort` yourself).
 *
 * @throws {TypeError} If `tasks` isn't an object of functions, or if it's
 * called outside a worker without a `scope`.
 *
 * @example
 * ```ts
 * // worker.js
 * import { exposeTasks } from '@hybrid-compute/worker';
 *
 * exposeTasks({
 *   double: (n: number) => n * 2,
 *   slowSum: async (numbers: number[], { signal }) => {
 *     let sum = 0;
 *
 *     for (const n of numbers) {
 *       signal.throwIfAborted();
 *       sum += n;
 *     }
 *
 *     return sum;
 *   }
 * });
 * ```
 */
export function exposeTasks(
  tasks: Readonly<Record<string, WorkerTaskType>>,
  scope?: WorkerScopeInterface
): void {
  if (
    !isPlainObject(tasks) ||
    !Object.values(tasks).every((task) => typeof task === 'function')
  ) {
    throw new TypeError(
      `exposeTasks expects an object of task functions, got ${describeValue(tasks)}`
    );
  }

  const target = scope ?? workerScope();
  const running = new Map<number, AbortController>();
  const reply = (message: Record<string, unknown>, list?: Transferable[]) => {
    try {
      target.postMessage(message, list);
    } catch (error) {
      // A result the structured clone algorithm can't copy
      target.postMessage({
        id: message.id,
        error: {
          name: 'DataCloneError',
          message: `the result couldn't be sent: ${error instanceof Error ? error.message : String(error)}`
        }
      });
    }
  };
  const run = async (id: number, name: string, input: unknown) => {
    const controller = new AbortController();

    running.set(id, controller);

    try {
      if (!Object.hasOwn(tasks, name)) {
        throw new Error(`No task '${name}' in this worker`);
      }

      const result = await tasks[name](input as never, {
        signal: controller.signal,
        progress: (value) => {
          if (running.get(id) === controller && !controller.signal.aborted) {
            target.postMessage({ id, progress: value });
          }
        }
      });

      if (!controller.signal.aborted) {
        reply({ id, result }, transfers.get(result as object));
      }
    } catch (error) {
      if (!controller.signal.aborted) reply({ id, error: toErrorValue(error) });
    } finally {
      running.delete(id);
    }
  };

  target.addEventListener('message', ({ data }) => {
    if (!isPlainObject(data) || typeof data.id !== 'number') return;

    if (data.cancel === true) {
      running.get(data.id)?.abort();

      return;
    }

    if (typeof data.task !== 'string') return;

    void run(data.id, data.task, data.input);
  });
}
