/** What a value is, for error messages: null, an array, or its typeof. */
export const describeValue = (value: unknown) => {
  if (value === null) return 'null';

  if (Array.isArray(value)) return 'an array';

  if (value === '') return 'an empty string';

  return typeof value;
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The message for an `error` value: a string, or an object's message. */
export const messageOf = (error: unknown) => {
  if (typeof error === 'string') return error;

  if (isPlainObject(error) && typeof error.message === 'string') {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

// How ThreadedCompute starts workers in a runtime. The package's entry points
// pick one; none of this is part of the public API.

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
