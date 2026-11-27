// Runs tasks with the Node.js entry and never calls close(): the process must
// stay alive through progress messages, and still exit once the tasks are done
import { createThreadedCompute } from '../../node.js';

const threaded = createThreadedCompute({
  url: new URL('./plain.ts', import.meta.url),
  canRunTasks: ['double', 'steps']
});

console.log(await threaded.runTask('double', 21));
console.log(
  await threaded.runTask('steps', 2, {
    onProgress: (step) => console.log(`step ${step}`)
  })
);
