# Local

This package provides:

- A compute backend that runs tasks on the calling thread
- In-memory task registration and execution
- Ideal for small, cheap tasks

## Install

::: code-group

```shell [npm]
npm install @hybrid-compute/core @hybrid-compute/local
```

```shell [yarn]
yarn add @hybrid-compute/core @hybrid-compute/local
```

:::

## Example

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

## Registering tasks

A task is an object with a `name` and a `run` function. `run` gets the input and
returns the output, either directly or as a Promise:

```ts
local.registerTask({ name: 'double', run: (n: number) => n * 2 });
local.registerTask({
  name: 'fetchUser',
  run: async (id: string) => (await fetch(`/users/${id}`)).json()
});
```

- **Names are unique.** Registering a name that's already taken throws a
  `RangeError`. To replace a task, remove it first with
  `local.unregisterTask(name)`, which returns whether a task was removed.
- **Invalid tasks are refused.** A task without a non-empty string `name` or a
  `run` function throws a `TypeError` when it's registered, not when it runs.
- **The task is copied** when it's registered, so changing the object afterwards
  has no effect.
- **Running a missing task** rejects with a `NoBackendError` from
  `@hybrid-compute/core`. Through `createHybridCompute` this can't happen,
  because core asks `canRun` first.
- **Tasks run on the calling thread.** A task's synchronous work runs before
  `runTask` returns, so a heavy task blocks the page; move it to the
  [worker backend](/guide/usage/worker).
