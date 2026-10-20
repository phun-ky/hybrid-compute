/**
 * The strategy used to determine which compute backend to use.
 *
 * - `auto`: the first backend whose `canRun` returns true, in the order
 *   worker, local, remote.
 * - `local`: the local backend, which runs tasks on the calling thread.
 * - `worker`: the worker backend, which runs tasks in a Web Worker.
 * - `remote`: the remote backend, which sends tasks to a server or service.
 *
 * An explicit strategy uses that backend only if its `canRun` returns true.
 *
 * @example
 * ```ts
 * const strategy: ExecutionStrategyType = 'worker';
 * ```
 */
export type ExecutionStrategyType = 'auto' | 'local' | 'worker' | 'remote';

/**
 * Describes a unit of work that can be executed by a compute backend.
 *
 * @template Input The input type expected by the task.
 * @template Output The output type returned by the task.
 *
 * @property name - A unique name used to identify the task.
 * @property run - A function that takes input and returns a Promise of the output.
 *
 * @example
 * ```ts
 * const task: ComputeTaskInterface<number, number> = {
 *   name: 'double',
 *   run: async (x) => x * 2
 * };
 * ```
 */
export interface ComputeTaskInterface<Input = unknown, Output = unknown> {
  name: string;
  run(input: Input): Promise<Output>;
}

/**
 * Represents a backend capable of executing registered compute tasks.
 *
 * Each backend must be able to:
 * - Determine if it can run a given task (`canRun`). Core asks this before
 *   every task, for every strategy.
 * - Execute a named task with input and return a Promise of output (`runTask`)
 *
 * @template Input The input type for task execution.
 * @template Output The output type for task execution.
 *
 * @example
 * ```ts
 * const backend: ComputeBackendInterface = {
 *   canRun: (taskName) => taskName === 'double',
 *   runTask: async (taskName, input) => {
 *     if (taskName === 'double') return (input as number) * 2;
 *     throw new Error('Unknown task');
 *   }
 * };
 * ```
 */
export interface ComputeBackendInterface {
  canRun(taskName: string): boolean;
  runTask<Input, Output>(taskName: string, input: Input): Promise<Output>;
}

/**
 * Configuration options for initializing the HybridCompute orchestrator.
 *
 * Each backend is optional, but at least one must be given, and no other
 * keys are allowed.
 *
 * @property local - A backend that runs tasks on the calling thread.
 * @property worker - A backend that runs tasks in a Web Worker.
 * @property remote - A backend that sends tasks to a server or service.
 *
 * @example
 * ```ts
 * const options: HybridComputeOptionsInterface = {
 *   local: createLocalCompute(),
 *   remote: createRemoteCompute({ ... })
 * };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 */
export interface HybridComputeOptionsInterface {
  local?: ComputeBackendInterface;
  worker?: ComputeBackendInterface;
  remote?: ComputeBackendInterface;
}
