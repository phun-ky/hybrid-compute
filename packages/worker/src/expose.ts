import type { WorkerScopeInterface, WorkerTaskType } from './types.js';
import { describeValue, isPlainObject } from './utils.js';

/** An error as a value the structured clone algorithm can copy. */
const toErrorValue = (error: unknown) => {
  if (error instanceof Error)
    return { name: error.name, message: error.message };

  if (typeof error === 'string') return error;

  return { message: String(error) };
};
/** The worker's global scope, or a TypeError outside a worker. */
const workerScope = (): WorkerScopeInterface => {
  const scope = globalThis as unknown as Partial<WorkerScopeInterface>;

  if (
    !('WorkerGlobalScope' in globalThis) ||
    typeof scope.addEventListener !== 'function' ||
    typeof scope.postMessage !== 'function'
  ) {
    throw new TypeError(
      'exposeTasks must be called in a worker script, or be given a scope to listen on'
    );
  }

  return scope as WorkerScopeInterface;
};

/**
 * Answers tasks from {@link ThreadedCompute} in a worker script: it listens
 * for task messages, runs the task with that name, and replies with its
 * result, or with an error if the task throws, rejects or doesn't exist.
 *
 * Each task gets the input and a context with a `signal`, which aborts when
 * the caller cancels the task or its timeout passes. A task that checks the
 * signal can stop early; its reply is then not sent.
 *
 * @param tasks - The tasks, by name. List the same names in `canRunTasks`.
 * @param scope - Where to listen and reply. Defaults to the worker's global
 * scope.
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
  const reply = (message: Record<string, unknown>) => {
    try {
      target.postMessage(message);
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
      if (!Object.prototype.hasOwnProperty.call(tasks, name)) {
        throw new Error(`No task '${name}' in this worker`);
      }

      const result = await tasks[name](input as never, {
        signal: controller.signal
      });

      if (!controller.signal.aborted) reply({ id, result });
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
