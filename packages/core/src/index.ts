export * from './types.js';

import {
  ExecutionStrategyType,
  HybridComputeOptionsInterface
} from './types.js';

/**
 * The HybridCompute class acts as an orchestrator to delegate compute tasks
 * across different backends (local, worker, or remote) using a flexible strategy.
 *
 * It supports four strategies:
 * - `'local'`: Forces execution on the local (main thread) backend.
 * - `'worker'`: Forces execution on a threaded/WebWorker backend.
 * - `'remote'`: Forces execution on a remote/server backend.
 * - `'auto'`: Automatically selects the first available backend that supports the task.
 *
 * @example
 * ```ts
 * const compute = new HybridCompute({
 *   local: createLocalCompute(),
 *   worker: createThreadedCompute(workerPath, ['double']),
 *   remote: createRemoteCompute({ transport: 'fetch', endpoint: '/api/compute' })
 * });
 *
 * const result = await compute.runTask<number, number>('double', 21, 'auto');
 * console.log(result); // 42
 * ```
 */
export class HybridCompute {
  private backends: HybridComputeOptionsInterface;

  /**
   * Creates a new HybridCompute orchestrator.
   *
   * @param backends - An object containing optional local, worker, and remote backends.
   */
  constructor(backends: HybridComputeOptionsInterface) {
    this.backends = backends;
  }

  /**
   * Runs a task using the specified execution strategy.
   *
   * If `strategy` is `'auto'`, it will try the worker, then local, then remote backend in order of priority.
   *
   * @typeParam Input - The type of the input expected by the task.
   * @typeParam Output - The expected output type returned by the task.
   *
   * @param taskName - The name of the task to execute.
   * @param input - The input payload for the task.
   * @param strategy - The execution strategy to use. Defaults to `'auto'`.
   *
   * @returns A Promise resolving to the task's output.
   *
   * @throws If no backend is available or able to run the task.
   *
   * @example
   * ```ts
   * const output = await compute.runTask('greetUser', { name: 'Alice' }, 'worker');
   * ```
   */
  async runTask<Input, Output>(
    taskName: string,
    input: Input,
    strategy: ExecutionStrategyType = 'auto'
  ): Promise<Output> {
    if (strategy === 'local' && this.backends.local) {
      return this.backends.local.runTask(taskName, input);
    } else if (strategy === 'worker' && this.backends.worker) {
      return this.backends.worker.runTask(taskName, input);
    } else if (strategy === 'remote' && this.backends.remote) {
      return this.backends.remote.runTask(taskName, input);
    } else if (strategy === 'auto') {
      if (this.backends.worker?.canRun(taskName)) {
        return this.backends.worker.runTask(taskName, input);
      } else if (this.backends.local?.canRun(taskName)) {
        return this.backends.local.runTask(taskName, input);
      } else if (this.backends.remote?.canRun(taskName)) {
        return this.backends.remote.runTask(taskName, input);
      }
    }

    throw new Error(
      `No backend available for task '${taskName}' using strategy '${strategy}'`
    );
  }
}

/**
 * Factory function for creating a HybridCompute instance.
 *
 * @param backends - Configuration options specifying available backends.
 * @returns A new HybridCompute orchestrator.
 *
 * @example
 * ```ts
 * const hybrid = createHybridCompute({ local: createLocalCompute() });
 * ```
 */
export function createHybridCompute(backends: HybridComputeOptionsInterface) {
  return new HybridCompute(backends);
}
