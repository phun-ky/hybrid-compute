# Getting Started

## Installation

### Prerequisites for package install

- [Node.js](https://nodejs.org/) 22 or later, or a browser from 2022 or later
  (Chrome 93, Firefox 92, Safari 15.4)
- npm 10.8.2 or later

::: info

**Hybrid Compute** is a collection of ES modules, compiled to ES2022, with
TypeScript types included. There is no CommonJS build: from CommonJS, use
`await import('@hybrid-compute/core')`, or `require()` on Node.js 22.12 or
later.

:::

To use it, install it with:

::: code-group

```shell [npm]
npm install @hybrid-compute/core
```

```shell [yarn]
yarn add @hybrid-compute/core
```

:::

## Quick usage, with `@hybrid-compute/local`

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/local
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/local
```

:::

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createLocalCompute } from '@hybrid-compute/local';

// Define a simple echo task
const echoTask = {
  name: 'echo',
  async run(input: string): Promise<string> {
    return `Echo: ${input}`;
  }
};
// Set up the local backend and register the task
const local = createLocalCompute();

local.registerTask(echoTask);

// Set up the HybridCompute instance with only the local backend
const compute = createHybridCompute({
  local
});

// Run the task
async function main() {
  try {
    const result = await compute.runTask('echo', 'Hello from HybridCompute!');

    console.log(result); // Output: Echo: Hello from HybridCompute!
  } catch (error) {
    console.error('Task failed:', error);
  }
}

main();
```

### Example

This example sets up a `double` task, which doubles a number, on all three
backends. With `auto`, core uses the first backend that can run it, in the order
worker, local, remote.

```ts
import { HybridCompute } from '@hybrid-compute/core';
import { createLocalCompute } from '@hybrid-compute/local';
import { createRemoteCompute } from '@hybrid-compute/remote';
import { createThreadedCompute } from '@hybrid-compute/worker';

const local = createLocalCompute();

local.registerTask({ name: 'double', run: (n: number) => n * 2 });

const compute = new HybridCompute({
  local,
  // worker.js calls exposeTasks({ double: (n: number) => n * 2 })
  worker: createThreadedCompute({
    url: new URL('./worker.js', import.meta.url),
    canRunTasks: ['double']
  }),
  remote: createRemoteCompute({
    transport: 'fetch',
    endpoint: '/api/compute',
    canRunTasks: ['double']
  })
});
const result = await compute.runTask<number, number>('double', 21, 'auto');

console.log(result); // 42
```
