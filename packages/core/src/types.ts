/**
 * The strategy used to determine which compute backend to use.
 *
 * - `auto`: Automatically select the best backend available.
 * - `local`: Run tasks directly on the main thread.
 * - `worker`: Offload tasks to WebWorker or thread-based compute.
 * - `remote`: Offload tasks to a remote server or service.
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
 * - Determine if it can run a given task (`canRun`)
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
 * Backends are optional, and can be combined or omitted based on the environment or needs.
 *
 * @property local - A local synchronous compute backend (main thread).
 * @property worker - A background-thread compute backend (e.g. WebWorker).
 * @property remote - A server-side or cloud compute backend.
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
