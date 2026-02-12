# worker

This package provides:

- A compute backend that runs tasks in a dedicated Web Worker
- Asynchronous task messaging via `postMessage`
- Useful for offloading CPU-intensive work from the main thread

## Install

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/worker
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/worker
```

:::

## Example

Create a file named `worker.ts`:

```ts
self.onmessage = async (event) => {
  const { task, input, id } = event.data;

  try {
    let result;

    switch (task) {
      case 'echo':
        result = `Echo from Worker: ${input}`;
        break;

      // Add more cases for additional tasks
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: (error as Error).message });
  }
};
```

And your `main.ts`:

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createThreadedCompute } from '@hybrid-compute/worker';

// Worker must be served as a module
const worker = createThreadedCompute(
  new URL('./worker.ts', import.meta.url).href,
  ['echo']
);

const compute = createHybridCompute({
  worker
});

const main = async () => {
  try {
    const result = await compute.runTask('echo', 'Hello from Worker!');
    console.log(result); // Echo from Worker: Hello from Worker!
  } catch (error) {
    console.error('Task failed:', error);
  }
};

main();
```
