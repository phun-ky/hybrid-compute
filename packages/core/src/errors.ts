import type { ExecutionStrategyType } from './types.js';

/**
 * Thrown (as a rejection of `runTask`) when no configured backend can run a
 * task with the given strategy.
 *
 * Validation errors, such as an unknown strategy or an empty task name, are
 * plain `TypeError` and `RangeError` instead, so a `NoBackendError` always
 * means the input was valid but nothing could run it.
 *
 * @example
 * ```ts
 * try {
 *   await compute.runTask('resizeImage', blob, 'worker');
 * } catch (error) {
 *   if (error instanceof NoBackendError) {
 *     console.warn(`Can't run ${error.taskName} with ${error.strategy}`);
 *   }
 * }
 * ```
 */
export class NoBackendError extends Error {
  /** The name of the task that couldn't be run. */
  readonly taskName: string;

  /** The strategy that was asked for. */
  readonly strategy: ExecutionStrategyType;

  /**
   * @param taskName - The name of the task that couldn't be run.
   * @param strategy - The strategy that was asked for.
   * @param message - What went wrong; defaults to a message naming both.
   */
  constructor(
    taskName: string,
    strategy: ExecutionStrategyType,
    message = `No backend available for task '${taskName}' using strategy '${strategy}'`
  ) {
    super(message);
    this.name = 'NoBackendError';
    this.taskName = taskName;
    this.strategy = strategy;
  }
}
