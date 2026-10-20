// A worker script written with exposeTasks, adapted to worker_threads
import { parentPort } from 'node:worker_threads';

import { exposeTasks } from '../../expose.js';

let aborted = 0;

exposeTasks(
  {
    echo: (input: unknown) => input,
    double: async (n: number) => n * 2,
    fail: () => {
      throw new Error('boom');
    },
    unclonable: () => () => 1,
    waitForAbort: (_input: unknown, { signal }) =>
      new Promise((resolve) =>
        signal.addEventListener('abort', () => {
          aborted++;
          resolve('aborted');
        })
      ),
    abortedCount: () => aborted
  },
  {
    addEventListener: (_type, listener) =>
      parentPort?.on('message', (data) => listener({ data })),
    postMessage: (message) => parentPort?.postMessage(message)
  }
);
