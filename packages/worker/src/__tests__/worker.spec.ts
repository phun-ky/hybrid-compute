import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createThreadedCompute,
  ThreadedCompute,
  WorkerResultMessageInterface,
  WorkerTaskMessageInterface
} from '..';

describe('ThreadedCompute', () => {
  test('canRun returns true for registered task', () => {
    const OriginalWorker = globalThis.Worker;

    class MockWorker {
      public onmessage: ((event: any) => void) | null = null;
      constructor(
        public path: string,
        public options: object
      ) {}
      postMessage() {}
    }

    // @ts-expect-error allow override
    globalThis.Worker = MockWorker;

    try {
      const threaded = new ThreadedCompute('mock-worker.js', ['foo', 'bar']);
      assert.equal(threaded.canRun('foo'), true);
      assert.equal(threaded.canRun('baz'), false);
    } finally {
      globalThis.Worker = OriginalWorker;
    }
  });

  test('runTask resolves with worker result', async () => {
    const OriginalWorker = globalThis.Worker;

    class MockWorker {
      public onmessage:
        | ((event: MessageEvent<WorkerResultMessageInterface>) => void)
        | null = null;
      public received: WorkerTaskMessageInterface | null = null;

      constructor(
        public path: string,
        public options: object
      ) {}

      postMessage(msg: WorkerTaskMessageInterface) {
        this.received = msg;

        setTimeout(() => {
          this.onmessage?.({
            data: {
              id: msg.id,
              result: `result-${msg.input}`
            }
          } as MessageEvent<WorkerResultMessageInterface>);
        }, 10);
      }
    }

    // @ts-expect-error override
    globalThis.Worker = MockWorker;

    try {
      const compute = new ThreadedCompute('mock-worker.js', ['echo']);
      const result = await compute.runTask<string, string>('echo', 'ping');
      assert.equal(result, 'result-ping');
    } finally {
      globalThis.Worker = OriginalWorker;
    }
  });

  test('runTask rejects with worker error', async () => {
    const OriginalWorker = globalThis.Worker;

    class MockWorker {
      public onmessage:
        | ((event: MessageEvent<WorkerResultMessageInterface>) => void)
        | null = null;

      constructor(
        public path: string,
        public options: object
      ) {}

      postMessage(msg: WorkerTaskMessageInterface) {
        setTimeout(() => {
          this.onmessage?.({
            data: {
              id: msg.id,
              error: 'Something went wrong'
            }
          } as MessageEvent<WorkerResultMessageInterface>);
        }, 10);
      }
    }

    // @ts-expect-error override
    globalThis.Worker = MockWorker;

    try {
      const compute = new ThreadedCompute('mock-worker.js', ['fail']);
      await assert.rejects(
        () => compute.runTask('fail', 42),
        /Something went wrong/
      );
    } finally {
      globalThis.Worker = OriginalWorker;
    }
  });
});
describe('createThreadedCompute', () => {
  test('returns instance of ThreadedCompute', () => {
    const OriginalWorker = globalThis.Worker;

    class MockWorker {
      public onmessage:
        | ((event: MessageEvent<WorkerResultMessageInterface>) => void)
        | null = null;
      constructor(
        public path: string,
        public options: object
      ) {}
      postMessage() {}
    }

    // @ts-expect-error override
    globalThis.Worker = MockWorker;

    try {
      const instance = createThreadedCompute('mock-worker.js', ['foo']);
      assert.ok(instance instanceof ThreadedCompute);
    } finally {
      globalThis.Worker = OriginalWorker;
    }
  });
});
