import {
  ComputeBackendInterface,
  ComputeTaskInterface
} from '@hybrid-compute/core';

/**
 * LocalCompute is a compute backend that executes tasks directly
 * on the main thread (synchronously in the JavaScript event loop).
 *
 * It stores registered tasks in memory and dispatches them by name.
 *
 * This backend is ideal for lightweight tasks or environments
 * where worker threads or remote execution are unavailable.
 *
 * @example
 * ```ts
 * const local = new LocalCompute();
 * local.registerTask({
 *   name: 'square',
 *   run: async (n: number) => n * n
 * });
 *
 * const result = await local.runTask<number, number>('square', 5);
 * console.log(result); // 25
 * ```
 */
export class LocalCompute implements ComputeBackendInterface {
  /**
   * In-memory task registry, keyed by task name.
   */
  private tasks: Map<string, ComputeTaskInterface<unknown, unknown>> =
    new Map();

  /**
   * Registers a new task to be executed by this backend.
   *
   * @typeParam Input - The input type expected by the task.
   * @typeParam Output - The output type returned by the task.
   * @param task - A named compute task with an async `run` function.
   */
  registerTask<Input, Output>(task: ComputeTaskInterface<Input, Output>) {
    this.tasks.set(task.name, task);
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
   * Executes a registered task with the given input.
   *
   * @typeParam Input - The expected input type of the task.
   * @typeParam Output - The expected output type of the task.
   * @param taskName - The name of the task to run.
   * @param input - The input data to pass to the task.
   * @returns A Promise resolving to the task’s output.
   * @throws If the task is not found in the local registry.
   *
   * @example
   * ```ts
   * const result = await local.runTask('square', 4); // 16
   * ```
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input
  ): Promise<Output> {
    const task = this.tasks.get(taskName) as ComputeTaskInterface<
      Input,
      Output
    >;

    if (!task) throw new Error(`Local task '${taskName}' not found.`);

    return task.run(input);
  }
}

/**
 * Factory function to create a new LocalCompute backend instance.
 *
 * @returns A new `LocalCompute` instance with empty task registry.
 *
 * @example
 * ```ts
 * const compute = createLocalCompute();
 * ```
 */
export function createLocalCompute() {
  return new LocalCompute();
}
