// How ThreadedCompute starts workers in a runtime. Internal: the package's
// entry points pick one, and it isn't part of the public API.

/** Starts workers, and says whether this runtime can. */
export interface WorkerRuntimeInterface {
  /** Whether workers can be started here. */
  available(): boolean;
  /** Start a worker for a script URL. */
  fromUrl(url: string | URL): Worker;
  /** Turn what createWorker returned into a Worker, if this runtime has to. */
  wrap(worker: unknown): Worker;
}

/** The key the runtime is passed under, in the options object. */
export const RUNTIME = Symbol('hybrid-compute worker runtime');

/** Web Workers: browsers, Deno and Bun. */
export const WEB_RUNTIME: WorkerRuntimeInterface = {
  available: () => typeof Worker === 'function',
  fromUrl: (url) => new Worker(url, { type: 'module' }),
  wrap: (worker) => worker as Worker
};
