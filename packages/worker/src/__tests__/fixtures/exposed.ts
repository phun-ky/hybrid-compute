// A worker script written with exposeTasks, adapted to worker_threads
import { parentPort } from 'node:worker_threads';

import { exposeTasks, transfer } from '../../expose.js';

let aborted = 0;

exposeTasks(
  {
    echo: (input: unknown) => input,
    double: async (n: number) => n * 2,
    fail: () => {
      throw new Error('boom');
    },
    failWith: (message: string) => {
      throw new Error(message);
    },
    unclonable: () => () => 1,
    waitForAbort: (_input: unknown, { signal }) =>
      new Promise((resolve) =>
        signal.addEventListener('abort', () => {
          aborted++;
          resolve('aborted');
        })
      ),
    abortedCount: () => aborted,
    byteLength: (bytes: Uint8Array) => bytes.byteLength,
    invert: (bytes: Uint8Array) => {
      for (let i = 0; i < bytes.length; i++) bytes[i] = 255 - bytes[i];

      return transfer(bytes, [bytes.buffer]);
    },
    steps: async (count: number, { progress }) => {
      for (let step = 1; step <= count; step++) progress(step);

      return 'done';
    },
    progressAfterReturn: (_input: unknown, { progress }) => {
      setTimeout(() => progress('late'), 0);

      return 'done';
    },
    progressUntilAbort: (_input: unknown, { signal, progress }) =>
      new Promise((resolve) => {
        progress('first');
        signal.addEventListener('abort', () => {
          progress('late');
          aborted++;
          resolve('aborted');
        });
      })
  },
  {
    addEventListener: (_type, listener) =>
      parentPort?.on('message', (data) => listener({ data })),
    postMessage: (message, list) =>
      parentPort?.postMessage(
        message,
        list as Parameters<NonNullable<typeof parentPort>['postMessage']>[1]
      )
  }
);
