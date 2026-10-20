// A small Web Worker on top of node:worker_threads, so the tests run tasks in
// real threads instead of mocks. Node has no global Worker of its own.
import { Worker as Thread } from 'node:worker_threads';

export class ThreadWorker extends EventTarget {
  /** Workers started so far. */
  static started = 0;
  /** The last worker started, to send it events in tests. */
  static last?: ThreadWorker;
  /** Workers not terminated yet, so a failed test can't leave one running. */
  static readonly running = new Set<ThreadWorker>();
  private readonly thread: Thread;

  constructor(url: string | URL) {
    super();

    if (String(url).includes('constructor-throws')) {
      throw new TypeError(`Failed to construct 'Worker': bad URL ${url}`);
    }

    ThreadWorker.started++;
    ThreadWorker.last = this;
    ThreadWorker.running.add(this);
    this.thread = new Thread(new URL(url));
    this.thread.on('message', (data) =>
      this.dispatchEvent(new MessageEvent('message', { data }))
    );
    this.thread.on('error', (error: Error & { code?: string }) => {
      const event = new Event('error');

      // Browsers give no message when the script fails to load
      if (error.code !== 'ERR_MODULE_NOT_FOUND') {
        Object.assign(event, { message: error.message, error });
      }

      this.dispatchEvent(event);
    });
  }

  postMessage(message: unknown) {
    this.thread.postMessage(message);
  }

  terminate() {
    ThreadWorker.running.delete(this);
    void this.thread.terminate();
  }
}

/** Run fn with the global Worker set to worker. */
const withGlobalWorker = async <T>(
  worker: unknown,
  fn: () => T | Promise<T>
) => {
  const global = globalThis as { Worker?: unknown };
  const original = global.Worker;

  global.Worker = worker;

  try {
    return await fn();
  } finally {
    global.Worker = original;

    // A test that failed before close() would otherwise keep the process alive
    for (const worker of ThreadWorker.running) worker.terminate();
  }
};

/** Run fn with ThreadWorker as the global Worker. */
export const withWorker = <T>(fn: () => T | Promise<T>) =>
  withGlobalWorker(ThreadWorker, fn);

/** Run fn with no global Worker, as in Node. */
export const withoutWorker = <T>(fn: () => T | Promise<T>) =>
  withGlobalWorker(undefined, fn);
