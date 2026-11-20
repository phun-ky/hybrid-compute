// Runs one task with the Node.js entry and never calls close(): the process
// must still exit once the task is done
import { createThreadedCompute } from '../../node.js';

const threaded = createThreadedCompute({
  url: new URL('./plain.ts', import.meta.url),
  canRunTasks: ['double']
});

console.log(await threaded.runTask('double', 21));
