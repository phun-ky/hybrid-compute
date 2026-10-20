/**
 * Why a remote task failed: the server replied with an `error`, the response
 * was unusable, the request timed out, or the server couldn't be reached.
 *
 * A task cancelled with an `AbortSignal` rejects with the signal's reason
 * instead, so a `RemoteTaskError` always means something went wrong.
 *
 * @example
 * ```ts
 * try {
 *   await remote.runTask('translate', { text: 'hello' });
 * } catch (error) {
 *   if (error instanceof RemoteTaskError && error.status === 401) {
 *     await signIn();
 *   }
 * }
 * ```
 */
export class RemoteTaskError extends Error {
  /** The name of the task that failed. */
  readonly taskName: string;

  /** The server's `error` value as it was sent, if the server sent one. */
  declare readonly detail?: unknown;

  /** The HTTP status, for the fetch transport. */
  declare readonly status?: number;

  /**
   * @param taskName - The name of the task that failed.
   * @param message - What went wrong.
   * @param details - The server's error value, the HTTP status and the
   * underlying error, where there is one.
   */
  constructor(
    taskName: string,
    message: string,
    details: { detail?: unknown; status?: number; cause?: unknown } = {}
  ) {
    // Error's own cause option (ES2022), only when there is a cause
    super(
      message,
      details.cause === undefined ? undefined : { cause: details.cause }
    );
    this.name = 'RemoteTaskError';
    this.taskName = taskName;

    if ('detail' in details) this.detail = details.detail;

    if (details.status !== undefined) this.status = details.status;
  }
}
