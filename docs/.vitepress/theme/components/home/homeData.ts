// Facts shown on the home page. Everything here follows the packages'
// actual behaviour; keep it in step with them.

export type Strategy = 'auto' | 'local' | 'worker' | 'remote';

export type Backend = 'local' | 'worker' | 'remote';

export const STRATEGIES: Strategy[] = ['auto', 'local', 'worker', 'remote'];

// With `auto`, core tries worker, then local, then remote, and takes the
// first backend whose canRun(task) is true. The example task is registered
// on the worker, so auto routes there.
export const ROUTE: Record<Strategy, Backend> = {
  auto: 'worker',
  local: 'local',
  worker: 'worker',
  remote: 'remote'
};

// Quote a value the way it appears in code: 'resizeImage'
const quoted = (value: string) => `'${value}'`;

export const ROUTE_NOTES: Record<Strategy, string[]> = {
  auto: [
    `worker.canRun(${quoted('resizeImage')}) is true`,
    'auto takes the first match of worker, local, remote'
  ],
  local: [
    `strategy ${quoted('local')}, and the local backend can run it`,
    'runs on the main thread'
  ],
  worker: [
    `strategy ${quoted('worker')}, and the worker backend can run it`,
    'runs off the main thread'
  ],
  remote: [
    `strategy ${quoted('remote')}, and the remote backend can run it`,
    'the input leaves the device as JSON'
  ]
};

export const READOUTS: Record<Backend, { thread: string; transport: string }> =
  {
    local: { thread: 'main', transport: 'direct call' },
    worker: { thread: 'Web Worker', transport: 'postMessage' },
    remote: { thread: 'remote service', transport: 'fetch or WebSocket' }
  };

export const PACKAGES = [
  {
    id: 'core',
    name: '@hybrid-compute/core',
    text: 'The orchestrator. Picks a backend for each task by strategy; with auto it falls back from worker to local to remote.',
    link: '/api/@hybrid-compute/core/'
  },
  {
    id: 'local',
    name: '@hybrid-compute/local',
    text: 'Runs registered tasks on the main thread. The right place for small, cheap work.',
    link: '/guide/usage/local'
  },
  {
    id: 'worker',
    name: '@hybrid-compute/worker',
    text: 'Runs tasks in a Web Worker, so heavy work never blocks rendering or input.',
    link: '/guide/usage/worker'
  },
  {
    id: 'remote',
    name: '@hybrid-compute/remote',
    text: 'Sends tasks to a service over fetch or WebSocket, as JSON messages.',
    link: '/guide/usage/remote'
  }
];

export const USE_CASES = [
  {
    title: 'A UI that never stutters',
    text: 'Parse, resize and transform in a worker; keep the main thread for input and rendering.'
  },
  {
    title: 'Data that stays on the device',
    text: 'Run sensitive steps locally and send only what a remote service really needs.'
  },
  {
    title: 'Works offline',
    text: 'Prefer local and worker backends, and reach for remote only when it is there.'
  }
];
