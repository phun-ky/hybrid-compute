# @hybrid-compute

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/public/logo/banner-dark.png">
  <img alt="Hybrid Compute: three lanes of work, with the tagline: run each task where it fits, locally, in a worker, or remotely" src="./docs/public/logo/banner-light.png">
</picture>

> **Run compute tasks wherever they run best - local, threaded, or remote - with
> a pluggable backend architecture.**

**1.0 is out:**
[release notes](https://phun-ky.net/hybrid-compute/guide/releases/1.0) and
[upgrading from 0.x](https://phun-ky.net/hybrid-compute/guide/upgrading).

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-green.svg)](http://makeapullrequest.com)
[![SemVer 2.0](https://img.shields.io/badge/SemVer-2.0-green.svg)](http://semver.org/spec/v2.0.0.html)
![issues](https://img.shields.io/github/issues/phun-ky/hybrid-compute)
![GitHub Repo stars](https://img.shields.io/github/stars/phun-ky/hybrid-compute)
[![codecov](https://codecov.io/gh/phun-ky/hybrid-compute/graph/badge.svg?token=VA91DL7ZLZ)](https://codecov.io/gh/phun-ky/hybrid-compute)
[![build](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml/badge.svg)](https://github.com/phun-ky/hybrid-compute/actions/workflows/check.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/phun-ky/hybrid-compute/badge)](https://scorecard.dev/viewer/?uri=github.com/phun-ky/hybrid-compute)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/15720/badge)](https://www.bestpractices.dev/projects/15720)

## About

`@hybrid-compute` is a flexible, modular compute orchestration framework that
dispatches computational tasks to the most appropriate backend, whether that's:

- The local JS thread (for fast, simple tasks)
- A dedicated Web Worker (for multi-threaded offloading)
- Or a remote compute service over HTTP or WebSocket

All you do is define tasks and call `runTask()`. HybridCompute takes care of the
rest.

How the packages fit together and how a task reaches a backend, with diagrams,
is in the
[architecture guide](https://phun-ky.net/hybrid-compute/guide/architecture).

## Table of Contents<!-- omit from toc -->

- [@hybrid-compute](#hybrid-compute)
  - [About](#about)
  - [API](#api)
  - [Usage](#usage)
    - [Usage with local](#usage-with-local)
    - [Usage with remote](#usage-with-remote)
      - [Fetch](#fetch)
      - [WebSocket](#websocket)
    - [Usage with worker](#usage-with-worker)
    - [Usage with WebAssembly](#usage-with-webassembly)
  - [Example](#example)
  - [Development](#development)
  - [Contributing](#contributing)
  - [License](#license)
  - [Changelog](#changelog)
  - [Sponsor me](#sponsor-me)

## API

Check out the full documentation
[here](https://github.com/phun-ky/hybrid-compute/blob/main/docs/api/README.md).

Includes:

- All public classes and methods
- Task registration and execution patterns
- Transport and backend setup guides

## Usage

```sh
npm install @hybrid-compute/core
```

### Usage with local

```bash
npm install @hybrid-compute/core
npm install @hybrid-compute/local
```

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

### Usage with remote

```bash
npm install @hybrid-compute/core
npm install @hybrid-compute/remote
```

#### Fetch

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'fetch',
  endpoint: 'https://your-remote-service.com/compute',
  canRunTasks: ['echo']
});
const compute = createHybridCompute({
  remote
});

async function main() {
  try {
    const result = await compute.runTask('echo', 'Remote via fetch!');

    console.log(result); // Output from remote server
  } catch (error) {
    console.error('Task failed:', error);
  }
}

main();
```

##### Example server for the remote fetch example

```js
import express from 'express';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Dummy task implementations
const tasks = {
  echo: async (input) => {
    return `Echo from remote server: ${input}`;
  },

  // Example additional task
  reverse: async (input) => {
    if (typeof input !== 'string') throw new Error('Input must be a string');

    return input.split('').reverse().join('');
  }
};

// Route to handle compute requests
app.post('/compute', async (req, res) => {
  const { task, input } = req.body;

  try {
    if (!task || !tasks[task]) {
      throw new Error(`Unknown task '${task}'`);
    }

    const result = await tasks[task](input);

    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(
    `🧠 RemoteCompute server listening at http://localhost:${port}/compute`
  );
});
```

This can be tested locally:

```sh
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"task": "echo", "input": "hello"}'
```

#### WebSocket

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createRemoteCompute } from '@hybrid-compute/remote';

const remote = createRemoteCompute({
  transport: 'websocket',
  endpoint: 'wss://your-remote-service.com/socket',
  canRunTasks: ['echo']
});
const compute = createHybridCompute({
  remote
});

async function main() {
  try {
    const result = await compute.runTask('echo', 'Remote via WebSocket!');

    console.log(result); // Output from remote service
  } catch (error) {
    console.error('Task failed:', error);
  }
}

main();
```

##### Example server for the remote WebSocket example

```js
import { WebSocketServer } from 'ws';

import http from 'http';

// Simple task definitions
const tasks = {
  echo: async (input) => {
    return `Echo from WebSocket server: ${input}`;
  },

  reverse: async (input) => {
    if (typeof input !== 'string') throw new Error('Input must be a string');

    return input.split('').reverse().join('');
  }
};
// Create an HTTP server to attach WebSocket
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    let request;

    try {
      request = JSON.parse(message.toString());
    } catch (err) {
      ws.send(JSON.stringify({ id: null, error: 'Invalid JSON' }));

      return;
    }

    const { id, task, input } = request;

    if (!id || typeof task !== 'string') {
      ws.send(JSON.stringify({ id, error: 'Missing or invalid task name' }));

      return;
    }

    try {
      if (!tasks[task]) throw new Error(`Unknown task '${task}'`);

      const result = await tasks[task](input);

      ws.send(JSON.stringify({ id, result }));
    } catch (error) {
      ws.send(JSON.stringify({ id, error: error.message }));
    }
  });
});

server.listen(3001, () => {
  console.log(
    '🔌 WebSocket RemoteCompute server listening at ws://localhost:3001'
  );
});
```

### Usage with worker

```bash
npm install @hybrid-compute/core
npm install @hybrid-compute/worker
```

Create a file named `worker.ts`:

```ts
import { exposeTasks } from '@hybrid-compute/worker';

exposeTasks({
  echo: (input: string) => `Echo from Worker: ${input}`
});
```

And your `main.ts`:

```ts
import { createHybridCompute } from '@hybrid-compute/core';
import { createThreadedCompute } from '@hybrid-compute/worker';

const worker = createThreadedCompute({
  // Started on the first task. Bundlers build worker.ts because they see
  // new Worker(new URL(...)) written out in full
  createWorker: () =>
    new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
  canRunTasks: ['echo']
});
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

### Usage with WebAssembly

WebAssembly needs no backend of its own: a module's exports are functions, so
you register them as tasks. Here `slugify` comes from a Rust library built with
[wasm-pack](https://github.com/rustwasm/wasm-pack):

```ts
import init, { slugify } from 'primes';

import { createLocalCompute } from '@hybrid-compute/local';

await init();

const local = createLocalCompute();

local.registerTask({ name: 'slugify', run: (text: string) => slugify(text) });

await local.runTask('slugify', 'Hello, WebAssembly World!'); // 'hello-webassembly-world'
```

Heavy functions belong in a worker, with `exposeTasks`. The
[WebAssembly guide](https://phun-ky.net/hybrid-compute/guide/usage/wasm) builds
the Rust library and runs it both ways, and in Node.js.

## Example

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
    createWorker: () =>
      new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
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

## Development

```sh
# Build
npm run build
# Test
npm test
```

## Contributing

Want to contribute? Please read the
[CONTRIBUTING.md](https://github.com/phun-ky/hybrid-compute/blob/main/CONTRIBUTING.md)
and
[CODE_OF_CONDUCT.md](https://github.com/phun-ky/hybrid-compute/blob/main/CODE_OF_CONDUCT.md)

## License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/phun-ky/hybrid-compute/blob/main/LICENSE) file for
details.

## Changelog

See the respective package changelogs.

## Sponsor me

I'm an Open Source evangelist, creating stuff that does not exist yet to help
get rid of secondary activities and to enhance systems already in place, be it
documentation, tools or web sites.

The sponsorship is an unique opportunity to alleviate more hours for me to
maintain my projects, create new ones and contribute to the large community
we're all part of :)

[Support me on GitHub Sponsors](https://github.com/sponsors/phun-ky).
