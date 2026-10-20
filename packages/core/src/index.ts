export * from './errors.js';

export * from './types.js';

import { isNotString } from '@phun-ky/typeof';

import { NoBackendError } from './errors.js';
import {
  ExecutionStrategyType,
  HybridComputeOptionsInterface
} from './types.js';

/** The order in which the auto strategy tries the backends. */
const AUTO_ORDER = Object.freeze(['worker', 'local', 'remote'] as const);

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
    if (isNotString(strategy)) {
      console.info("Wrong type passed for `strategy`, defaulting to 'auto'");
      strategy = 'auto';
    }

    if (strategy === 'auto') {
      for (const name of AUTO_ORDER) {
        const backend = this.backends[name];

        if (backend?.canRun(taskName)) return backend.runTask(taskName, input);
      }

      throw new NoBackendError(taskName, strategy);
    }

    // An explicit strategy uses that backend, if it's configured and can run
    // the task. The own-property check keeps names like 'toString' off the
    // prototype chain.
    const backend = Object.prototype.hasOwnProperty.call(
      this.backends,
      strategy
    )
      ? this.backends[strategy]
      : undefined;

    if (!backend) {
      throw new NoBackendError(
        taskName,
        strategy,
        `No ${strategy} backend is configured for task '${taskName}'`
      );
    }

    if (!backend.canRun(taskName)) {
      throw new NoBackendError(
        taskName,
        strategy,
        `The ${strategy} backend can't run task '${taskName}'`
      );
    }

    return backend.runTask(taskName, input);
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
