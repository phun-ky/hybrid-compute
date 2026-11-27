// The Node.js entry point against real worker_threads: no global Worker, no
// shim.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test, { describe } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Worker as Thread } from 'node:worker_threads';

import { WorkerTaskError } from '..';
import {
  createThreadedCompute,
  NodeThreadedComputeOptionsInterface,
  ThreadedCompute
} from '../node';

const fixture = (name: string) =>
  new URL(`./fixtures/${name}.ts`, import.meta.url);
const isWorkerError = (message: RegExp) => (error: unknown) =>
  error instanceof WorkerTaskError && message.test(error.message);
/** Run fn with a backend, and close it afterwards even if fn fails. */
const using = async (
  options: NodeThreadedComputeOptionsInterface,
  fn: (threaded: ThreadedCompute) => Promise<void>
) => {
  const threaded = createThreadedCompute(options);

  try {
    await fn(threaded);
  } finally {
    threaded.close();
  }
};

describe('@hybrid-compute/worker/node', () => {
  test('has no global Worker to lean on', () => {
    assert.equal(
      typeof (globalThis as { Worker?: unknown }).Worker,
      'undefined'
    );
  });

  test('can run its tasks, and checks its options like the browser entry', () => {
    const threaded = createThreadedCompute({
      url: fixture('plain'),
      canRunTasks: ['double']
    });

    assert.ok(threaded instanceof ThreadedCompute);
    assert.equal(threaded.canRun('double'), true);
    assert.equal(threaded.canRun('other'), false);
    assert.throws(
      () =>
        new ThreadedCompute(
          null as unknown as NodeThreadedComputeOptionsInterface
        ),
      TypeError
    );
    assert.throws(
      () =>
        createThreadedCompute({
          url: fixture('plain'),
          canRunTasks: [],
          timeout: -1
        }),
      RangeError
    );
  });

  test('runs a worker script written for the browser, from a URL or a path', async () => {
    for (const url of [fixture('plain'), fileURLToPath(fixture('plain'))]) {
      await using({ url, canRunTasks: ['double'] }, async (threaded) => {
        assert.equal(await threaded.runTask('double', 21), 42);
      });
    }
  });

  test('matches concurrent replies by id', async () => {
    await using(
      { url: fixture('plain'), canRunTasks: ['double', 'slow'] },
      async (threaded) => {
        assert.deepEqual(
          await Promise.all([
            threaded.runTask('slow', 30),
            threaded.runTask('double', 1),
            threaded.runTask('slow', 10)
          ]),
          [30, 2, 10]
        );
      }
    );
  });

  test('starts a thread with createWorker, on the first task and again after close()', async () => {
    let started = 0;

    await using(
      {
        createWorker: () => {
          started++;

          return new Thread(fixture('plain'), {
            resourceLimits: { maxOldGenerationSizeMb: 64 }
          });
        },
        canRunTasks: ['double']
      },
      async (threaded) => {
        assert.equal(started, 0);
        assert.equal(await threaded.runTask('double', 2), 4);
        assert.equal(await threaded.runTask('double', 3), 6);
        assert.equal(started, 1);
        threaded.close();
        assert.equal(await threaded.runTask('double', 4), 8);
        assert.equal(started, 2);
      }
    );
  });

  test('rejects with WorkerTaskError when createWorker returns something else', async () => {
    await using(
      {
        createWorker: () => ({}) as Thread,
        canRunTasks: ['double']
      },
      async (threaded) => {
        await assert.rejects(
          threaded.runTask('double', 1),
          isWorkerError(/createWorker returned object, not a Worker/)
        );
      }
    );
  });

  test('rejects a failing task with WorkerTaskError, keeping the detail', async () => {
    await using(
      { url: fixture('exposed'), canRunTasks: ['fail'] },
      async (threaded) => {
        await assert.rejects(
          threaded.runTask('fail', 1),
          (error: unknown) =>
            isWorkerError(/Worker task 'fail' failed: boom/)(error) &&
            (error as WorkerTaskError).detail !== undefined
        );
      }
    );
  });

  test('rejects when the worker throws or exits, and starts a new thread for the next task', async () => {
    await using(
      { url: fixture('raw'), canRunTasks: ['echo', 'throw', 'exit', 'null'] },
      async (threaded) => {
        await assert.rejects(
          threaded.runTask('throw', 1),
          isWorkerError(/the worker threw: thrown inside the worker/)
        );
        assert.equal(await threaded.runTask('echo', 'again'), 'again');
        await assert.rejects(
          threaded.runTask('exit', 1),
          isWorkerError(/it exited with code 3/)
        );
        assert.equal(await threaded.runTask('echo', 'and again'), 'and again');
      }
    );
  });

  test('rejects when the worker script does not exist', async () => {
    await using(
      { url: fixture('missing'), canRunTasks: ['double'] },
      async (threaded) => {
        await assert.rejects(
          threaded.runTask('double', 1),
          isWorkerError(/got no reply: the worker threw/)
        );
      }
    );
  });

  test('tells the worker to cancel when the timeout passes', async () => {
    await using(
      {
        url: fixture('exposed'),
        canRunTasks: ['waitForAbort', 'abortedCount'],
        timeout: 50
      },
      async (threaded) => {
        await assert.rejects(
          threaded.runTask('waitForAbort', 1),
          isWorkerError(/timed out after 50 ms/)
        );
        assert.equal(
          await threaded.runTask('abortedCount', undefined, {
            signal: AbortSignal.timeout(5000)
          }),
          1
        );
      }
    );
  });

  test('rejects every waiting task on a messageerror, and keeps the thread', async () => {
    let thread: Thread | undefined;

    await using(
      {
        createWorker: () => (thread = new Thread(fixture('raw'))),
        canRunTasks: ['echo', 'hang']
      },
      async (threaded) => {
        const waiting = threaded.runTask('hang', 1);

        // Node raises messageerror when a message can't be deserialised;
        // raise it directly, as there's no portable way to cause one
        thread?.emit('messageerror', new Error('could not deserialise'));
        await assert.rejects(
          waiting,
          isWorkerError(/a reply from the worker could not be read/)
        );
        assert.equal(
          await threaded.runTask('echo', 'still here'),
          'still here'
        );
      }
    );
  });

  test('transfers buffers both ways, and shares a SharedArrayBuffer', async () => {
    await using(
      { url: fixture('plain'), canRunTasks: ['invert', 'increment'] },
      async (threaded) => {
        const bytes = new Uint8Array([0, 10, 255]);
        const inverted = await threaded.runTask<Uint8Array, Uint8Array>(
          'invert',
          bytes,
          { transfer: [bytes.buffer] }
        );

        assert.equal(bytes.byteLength, 0);
        assert.deepEqual([...inverted], [255, 245, 0]);

        const counter = new Int32Array(new SharedArrayBuffer(4));

        assert.equal(await threaded.runTask('increment', counter), 1);
        assert.equal(counter[0], 1);
      }
    );
  });

  test('passes progress to onProgress before the result', async () => {
    await using(
      { url: fixture('plain'), canRunTasks: ['steps'] },
      async (threaded) => {
        const seen: unknown[] = [];

        assert.equal(
          await threaded.runTask('steps', 3, {
            onProgress: (step) => seen.push(step)
          }),
          'done'
        );
        assert.deepEqual(seen, [1, 2, 3]);
      }
    );
  });

  test('lets the process exit when no task is waiting, without close()', () => {
    // Inherit tsx's loader, so the child can run the TypeScript fixture
    const output = execFileSync(
      process.execPath,
      [...process.execArgv, fileURLToPath(fixture('idle'))],
      { encoding: 'utf8', timeout: 10_000 }
    );

    assert.equal(output.trim(), '42\nstep 1\nstep 2\ndone');
  });
});
