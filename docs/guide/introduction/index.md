# Getting Started

## Installation

### Prerequisites for package install

- [Node.js](https://nodejs.org/) version 22.9.0 or higher
- npm version 11.0.0 or higher

::: info

**Hybrid Compute** is an ESM package

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

This example expects a task setup for `double` on the backends that doubles the
input number. `auto` is used to use first available backend that has the task
set up.

```ts
import {
  HybridCompute,
  createLocalCompute,
  createThreadedCompute,
  createRemoteCompute
} from '@hybrid-compute/core';

const compute = new HybridCompute({
  local: createLocalCompute(),
  worker: createThreadedCompute(new URL('./worker.js', import.meta.url), [
    'double'
  ]),
  remote: createRemoteCompute({ transport: 'fetch', endpoint: '/api/compute' })
});

const result = await compute.runTask<number, number>('double', 21, 'auto');
console.log(result); // 42
```
