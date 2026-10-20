import { NoBackendError } from '@hybrid-compute/core';
import type {
  ComputeBackendInterface,
  ComputeTaskInterface,
  RunTaskOptionsInterface,
  TaskContextInterface
} from '@hybrid-compute/core';

/** A registered task: its name and its run function, frozen at registration. */
type RegisteredTaskType = Readonly<{
  name: string;
  run: (input: unknown, context: TaskContextInterface) => unknown;
}>;

/** What a value is, for error messages: null, an array, or its typeof. */
const describeValue = (value: unknown) => {
  if (value === null) return 'null';

  if (Array.isArray(value)) return 'an array';

  if (value === '') return 'an empty string';

  return typeof value;
};

/**
 * LocalCompute is a compute backend that runs tasks on the calling thread:
 * the main thread in a page, or whichever worker or Node.js thread creates it.
 *
 * It keeps the registered tasks in memory and runs them by name. A task's
 * synchronous work runs before `runTask` returns, so it suits small, cheap
 * tasks; heavy work belongs in the worker backend.
 *
 * @example
 * ```ts
 * const local = new LocalCompute();
 *
 * local.registerTask({
 *   name: 'square',
 *   run: (n: number) => n * n
 * });
 *
 * const result = await local.runTask<number, number>('square', 5);
 * console.log(result); // 25
 * ```
 */
export class LocalCompute implements ComputeBackendInterface {
  /** The registered tasks, keyed by name. */
  private readonly tasks = new Map<string, RegisteredTaskType>();

  /**
   * Registers a task with this backend. The task is copied, so changing the
   * object afterwards has no effect.
   *
   * @typeParam Input - The input type expected by the task.
   * @typeParam Output - The output type returned by the task.
   * @param task - A task with a unique, non-empty `name` and a `run` function,
   * which may return the output or a Promise of it.
   *
   * @throws {TypeError} If `task` isn't an object, its `name` isn't a
   * non-empty string, or it has no `run` function.
   * @throws {RangeError} If a task with the same name is already registered.
   * Call {@link LocalCompute.unregisterTask} first to replace it.
   */
  registerTask<Input, Output>(task: ComputeTaskInterface<Input, Output>): void {
    if (typeof task !== 'object' || task === null || Array.isArray(task)) {
      throw new TypeError(
        `registerTask expects a task object with a name and a run function, got ${describeValue(task)}`
      );
    }

    if (typeof task.name !== 'string' || task.name === '') {
      throw new TypeError(
        `A task's name must be a non-empty string, got ${describeValue(task.name)}`
      );
    }

    if (typeof task.run !== 'function') {
      throw new TypeError(`Task '${task.name}' must have a run function`);
    }

    if (this.tasks.has(task.name)) {
      throw new RangeError(
        `A task named '${task.name}' is already registered; call unregisterTask('${task.name}') first to replace it`
      );
    }

    // Bound to the task, so a run that uses `this` works as before
    this.tasks.set(
      task.name,
      Object.freeze({
        name: task.name,
        run: task.run.bind(task) as RegisteredTaskType['run']
      })
    );
  }

  /**
   * Removes a registered task.
   *
   * @param taskName - The name of the task to remove.
   * @returns `true` if a task was removed, `false` if none had that name.
   */
  unregisterTask(taskName: string): boolean {
    return this.tasks.delete(taskName);
  }

  /**
   * Determines whether the backend has a task by this name.
   *
   * @param taskName - The task identifier.
   * @returns `true` if the task is registered, otherwise `false`.
   */
  canRun(taskName: string): boolean {
    return this.tasks.has(taskName);
  }

  /**
   * Runs a registered task with the given input.
   *
   * @typeParam Input - The expected input type of the task.
   * @typeParam Output - The expected output type of the task.
   * @param taskName - The name of the task to run.
   * @param input - The input data to pass to the task.
   * @param options - Options for this call. With a `signal`, the task gets the
   * signal as `run(input, { signal })`, and `runTask` rejects with the
   * signal's reason as soon as it aborts. An async task keeps running unless
   * it stops itself; synchronous work can't be interrupted.
   * @returns A Promise resolving to the task's output. It rejects with a
   * `NoBackendError` (from `@hybrid-compute/core`) if no task has that name,
   * with the signal's reason if it's aborted, and with whatever the task
   * throws or rejects with.
   *
   * @example
   * ```ts
   * const result = await local.runTask('square', 4); // 16
   * ```
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input,
    options?: RunTaskOptionsInterface
  ): Promise<Output> {
    const task = this.tasks.get(taskName);

    if (!task) {
      throw new NoBackendError(
        taskName,
        'local',
        `No local task '${taskName}' is registered`
      );
    }

    const signal = options?.signal;

    // Already cancelled: don't start the task
    if (signal?.aborted) throw signal.reason;

    const result = task.run(input, { signal });

    if (!signal) return (await result) as Output;

    // Settle with the task, or with the signal's reason if it aborts first
    return new Promise<Output>((resolve, reject) => {
      const onAbort = () => reject(signal.reason);

      signal.addEventListener('abort', onAbort, { once: true });
      Promise.resolve(result)
        .then((value) => resolve(value as Output), reject)
        .finally(() => signal.removeEventListener('abort', onAbort));
    });
  }
}

/**
 * Creates a LocalCompute backend with no tasks registered.
 *
 * @returns A new `LocalCompute` instance.
 *
 * @example
 * ```ts
 * const local = createLocalCompute();
 *
 * local.registerTask({ name: 'echo', run: (input: string) => input });
 * ```
 */
export function createLocalCompute() {
  return new LocalCompute();
}
