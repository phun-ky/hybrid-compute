export * from './errors.js';

export * from './types.js';

import { NoBackendError } from './errors.js';
import {
  ExecutionStrategyType,
  HybridComputeOptionsInterface
} from './types.js';

/** The backends core knows, by option key. */
const BACKEND_NAMES = Object.freeze(['local', 'worker', 'remote'] as const);
/** Every valid strategy. */
const STRATEGIES: readonly string[] = Object.freeze(['auto', ...BACKEND_NAMES]);
/** The order in which the auto strategy tries the backends. */
const AUTO_ORDER = Object.freeze(['worker', 'local', 'remote'] as const);
/** What a value is, for error messages: null, an array, or its typeof. */
const describeValue = (value: unknown) => {
  if (value === null) return 'null';

  if (Array.isArray(value)) return 'an array';

  if (value === '') return 'an empty string';

  return typeof value;
};
/**
 * Check the backends given to the constructor, and return a frozen copy of
 * the ones that are set, so changing the options object later has no effect.
 *
 * @throws {TypeError} If `backends` isn't an object, a backend lacks canRun or
 * runTask, or no backend is given.
 * @throws {RangeError} If `backends` has a key other than local, worker or
 * remote, which is most likely a typo.
 */
const toBackends = (
  backends: unknown
): Readonly<HybridComputeOptionsInterface> => {
  if (
    typeof backends !== 'object' ||
    backends === null ||
    Array.isArray(backends)
  ) {
    throw new TypeError(
      `HybridCompute expects an object with local, worker and/or remote backends, got ${describeValue(backends)}`
    );
  }

  const chosen: HybridComputeOptionsInterface = {};

  for (const [name, backend] of Object.entries(backends)) {
    if (!(BACKEND_NAMES as readonly string[]).includes(name)) {
      throw new RangeError(
        `Unknown backend '${name}'; use ${BACKEND_NAMES.join(', ')}`
      );
    }

    // Leaving a backend out with undefined, e.g. { worker: maybeWorker }, is fine
    if (backend === undefined) continue;

    if (
      typeof backend !== 'object' ||
      backend === null ||
      typeof backend.canRun !== 'function' ||
      typeof backend.runTask !== 'function'
    ) {
      throw new TypeError(
        `The ${name} backend must be an object with canRun and runTask functions`
      );
    }

    chosen[name as (typeof BACKEND_NAMES)[number]] = backend;
  }

  if (Object.keys(chosen).length === 0) {
    throw new TypeError(
      `HybridCompute needs at least one backend: ${BACKEND_NAMES.join(', ')}`
    );
  }

  return Object.freeze(chosen);
};

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
  private readonly backends: Readonly<HybridComputeOptionsInterface>;

  /**
   * Creates a new HybridCompute orchestrator.
   *
   * @param backends - An object containing optional local, worker, and remote backends.
   */
  constructor(backends: HybridComputeOptionsInterface) {
    this.backends = toBackends(backends);
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
    if (typeof taskName !== 'string' || taskName === '') {
      throw new TypeError(
        `taskName must be a non-empty string, got ${describeValue(taskName)}`
      );
    }

    if (typeof strategy !== 'string') {
      throw new TypeError(
        `strategy must be a string, got ${describeValue(strategy)}`
      );
    }

    if (!STRATEGIES.includes(strategy)) {
      throw new RangeError(
        `Unknown strategy '${strategy}'; use ${STRATEGIES.join(', ')}`
      );
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
