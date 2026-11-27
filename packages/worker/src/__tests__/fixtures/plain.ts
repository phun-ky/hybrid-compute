// A worker script as it would be written for the browser: exposeTasks with
// no scope, which finds parentPort in a Node.js worker thread
import { exposeTasks, transfer } from '../../expose.js';

exposeTasks({
  double: (n: number) => n * 2,
  slow: (ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve(ms), ms)),
  invert: (bytes: Uint8Array) => {
    for (let i = 0; i < bytes.length; i++) bytes[i] = 255 - bytes[i];

    return transfer(bytes, [bytes.buffer]);
  },
  // Adds to a shared counter: the caller sees it only if memory is shared
  increment: (counter: Int32Array) => Atomics.add(counter, 0, 1) + 1,
  // Progress, then a pause before the reply, so a thread let go of on the
  // progress message would let the process exit first
  steps: async (count: number, { progress }) => {
    for (let step = 1; step <= count; step++) {
      progress(step);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    return 'done';
  }
});
