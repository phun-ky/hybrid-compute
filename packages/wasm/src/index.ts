import type {
  ComputeBackendInterface,
  ComputeTaskInterface
} from '@hybrid-compute/core';

import { instantiateWasm } from './loader.js';
import type { WasmComputeOptions } from './types.js';

export * from './types.js';

export * from './bridge.js';

/**
 * A WASM-backed compute backend. You provide a WASM module (URL/binary/module)
 * and register tasks that call into the module's exports.
 *
 * Keeps the contract identical to other backends.
 */
export class WasmCompute implements ComputeBackendInterface {
  private instance?: WebAssembly.Instance;
  private tasks = new Map<string, ComputeTaskInterface<unknown, unknown>>();
  private readonly source: WasmComputeOptions['source'];
  private readonly imports?: WebAssembly.Imports;

  constructor(options: WasmComputeOptions) {
    this.source = options.source;
    this.imports = options.imports;
  }

  /** Load and instantiate the WASM module. Call once during startup. */
  async init(): Promise<void> {
    this.instance = await instantiateWasm(this.source, this.imports ?? {});
  }

  /** Access the exports of the instantiated module (after init). */
  get exports(): WebAssembly.Exports {
    if (!this.instance)
      throw new Error('WasmCompute not initialized. Call init() first.');

    return this.instance.exports;
  }

  registerTask<Input, Output>(task: ComputeTaskInterface<Input, Output>): void {
    this.tasks.set(task.name, task);
  }

  canRun(taskName: string): boolean {
    return this.tasks.has(taskName);
  }

  async runTask<Input, Output>(
    taskName: string,
    input: Input
  ): Promise<Output> {
    const task = this.tasks.get(taskName) as
      | ComputeTaskInterface<Input, Output>
      | undefined;

    if (!task) throw new Error(`WASM task '${taskName}' not found`);

    return task.run(input);
  }
}

/**
 * Helper to register a WASM numeric function export as a task.
 * Assumes the export is a function whose args/return are numbers.
 */
export const registerNumericExportTask = (
  wasm: WasmCompute,
  taskName: string,
  exportName: string
) => {
  const exp = wasm.exports[exportName];

  if (typeof exp !== 'function')
    throw new Error(`Export '${exportName}' is not a function`);

  wasm.registerTask<number[] | number, number>({
    name: taskName,
    async run(input) {
      const args = Array.isArray(input) ? input : [input];

      return exp(...args);
    }
  });
};
