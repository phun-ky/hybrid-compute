# Local

This package provides:

- A local (synchronous) compute backend
- In-memory task registration and execution
- Ideal for lightweight or fast tasks

## Install

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/local
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/local
```

## Example

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
