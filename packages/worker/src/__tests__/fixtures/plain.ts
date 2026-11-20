// A worker script as it would be written for the browser: exposeTasks with
// no scope, which finds parentPort in a Node.js worker thread
import { exposeTasks } from '../../expose.js';

exposeTasks({
  double: (n: number) => n * 2,
  slow: (ms: number) =>
    new Promise((resolve) => setTimeout(() => resolve(ms), ms))
});
