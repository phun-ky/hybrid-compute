/**
 * Why a worker task failed: the worker script replied with an `error`, the
 * reply was unusable, the worker crashed or couldn't start, the input couldn't
 * be sent, the timeout passed, or the backend was closed.
 *
 * A task cancelled with an `AbortSignal` rejects with the signal's reason
 * instead, so a `WorkerTaskError` always means something went wrong.
 *
 * @example
 * ```ts
 * try {
 *   await threaded.runTask('resizeImage', blob);
 * } catch (error) {
 *   if (error instanceof WorkerTaskError) {
 *     console.warn(`${error.taskName} failed`, error.detail);
 *   }
 * }
 * ```
 */
export class WorkerTaskError extends Error {
  /** The name of the task that failed. */
  readonly taskName: string;

  /** The worker script's `error` value as it was sent, if it sent one. */
  declare readonly detail?: unknown;

  /**
   * @param taskName - The name of the task that failed.
   * @param message - What went wrong.
   * @param details - The worker script's error value and the underlying
   * error, where there is one.
   */
  constructor(
    taskName: string,
    message: string,
    details: { detail?: unknown; cause?: unknown } = {}
  ) {
    // Error's own cause option (ES2022), only when there is a cause
    super(
      message,
      details.cause === undefined ? undefined : { cause: details.cause }
    );
    this.name = 'WorkerTaskError';
    this.taskName = taskName;

    if ('detail' in details) this.detail = details.detail;
  }
}
