import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { NoBackendError } from '@hybrid-compute/core';

import {
  createThreadedCompute,
  ThreadedCompute,
  ThreadedComputeOptionsInterface,
  WorkerTaskError
} from '..';

import { ThreadWorker, withoutWorker, withWorker } from './thread-worker';

const fixture = (name: string) =>
  new URL(`./fixtures/${name}.ts`, import.meta.url);
const exposed = (extra: Partial<ThreadedComputeOptionsInterface> = {}) =>
  createThreadedCompute({
    url: fixture('exposed'),
    canRunTasks: [
      'echo',
      'double',
      'fail',
      'unclonable',
      'waitForAbort',
      'abortedCount',
      'missing'
    ],
    ...extra
  });
const raw = (extra: Partial<ThreadedComputeOptionsInterface> = {}) =>
  createThreadedCompute({
    url: fixture('raw'),
    canRunTasks: [
      'echo',
      'errorString',
      'errorObject',
      'errorEmpty',
      'errorOther',
      'errorBigInt',
      'noResult',
      'null',
      'stranger',
      'throw',
      'hang'
    ],
    ...extra
  });
const isWorkerError =
  (message: RegExp, check: (error: WorkerTaskError) => boolean = () => true) =>
  (error: unknown) =>
    error instanceof WorkerTaskError &&
    message.test(error.message) &&
    check(error);
const options = (value: unknown) =>
  value as unknown as ThreadedComputeOptionsInterface;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('options', () => {
  test('throws a TypeError for something that is not an options object', () => {
    for (const value of [undefined, null, './worker.js', []]) {
      assert.throws(() => createThreadedCompute(options(value)), TypeError);
    }
  });

  test('requires a url: a URL or a non-empty string', () => {
    for (const url of [undefined, '', 42, {}]) {
      assert.throws(
        () => createThreadedCompute(options({ url, canRunTasks: ['echo'] })),
        {
          name: 'TypeError',
          message: /^url must be a URL or a non-empty string/
        }
      );
    }

    assert.ok(createThreadedCompute({ url: './worker.js', canRunTasks: [] }));
  });

  test('requires canRunTasks: a list of task names', () => {
    for (const canRunTasks of [undefined, 'echo', ['echo', ''], [42]]) {
      assert.throws(
        () =>
          createThreadedCompute(options({ url: './worker.js', canRunTasks })),
        TypeError
      );
    }
  });

  test('checks the timeout', () => {
    assert.throws(() => exposed({ timeout: -1 }), RangeError);
    assert.throws(() => exposed({ timeout: Number.NaN }), TypeError);
    assert.throws(() => exposed(options({ timeout: '100' })), TypeError);
  });

  test('starts no worker when it is created', async () => {
    await withWorker(() => {
      const before = ThreadWorker.started;

      exposed();
      assert.equal(ThreadWorker.started, before);
    });
  });
});

describe('canRun', () => {
  test('is true for the tasks in canRunTasks only', async () => {
    await withWorker(() => {
      const threaded = exposed();

      assert.equal(threaded.canRun('echo'), true);
      assert.equal(threaded.canRun('e'), false);
    });
  });

  test('is false where there are no Web Workers, so auto falls back', async () => {
    await withoutWorker(() => assert.equal(exposed().canRun('echo'), false));
  });
});

describe('runTask with exposeTasks', () => {
  test('resolves the result, for a URL or a string url', async () => {
    await withWorker(async () => {
      const threaded = exposed();

      assert.equal(await threaded.runTask('double', 21), 42);
      threaded.close();

      const fromString = exposed({ url: fixture('exposed').href });

      assert.deepEqual(await fromString.runTask('echo', { a: [1] }), {
        a: [1]
      });
      fromString.close();
    });
  });

  test('matches concurrent replies by id, in one worker', async () => {
    await withWorker(async () => {
      const before = ThreadWorker.started;
      const threaded = exposed();

      assert.deepEqual(
        await Promise.all([
          threaded.runTask('echo', 'a'),
          threaded.runTask('double', 2),
          threaded.runTask('echo', 'c')
        ]),
        ['a', 4, 'c']
      );
      assert.equal(ThreadWorker.started - before, 1);
      threaded.close();
    });
  });

  test('rejects a thrown error with WorkerTaskError, keeping the detail', async () => {
    await withWorker(async () => {
      const threaded = exposed();

      await assert.rejects(
        threaded.runTask('fail', 1),
        isWorkerError(/^Worker task 'fail' failed: boom$/, (error) => {
          const detail = error.detail as { name: string; message: string };

          return (
            error.taskName === 'fail' &&
            detail.name === 'Error' &&
            detail.message === 'boom'
          );
        })
      );
      await assert.rejects(
        threaded.runTask('missing', 1),
        isWorkerError(/failed: No task 'missing' in this worker/)
      );
      await assert.rejects(
        threaded.runTask('unclonable', 1),
        isWorkerError(/failed: the result couldn't be sent/)
      );
      threaded.close();
    });
  });

  test('rejects an unlisted task with NoBackendError, without starting a worker', async () => {
    await withWorker(async () => {
      const before = ThreadWorker.started;

      await assert.rejects(
        exposed().runTask('unlisted', 1),
        (error) =>
          error instanceof NoBackendError &&
          error.strategy === 'worker' &&
          /it isn't in canRunTasks/.test(error.message)
      );
      assert.equal(ThreadWorker.started, before);
    });
  });

  test('rejects with a TypeError where there are no Web Workers', async () => {
    await withoutWorker(() =>
      assert.rejects(exposed().runTask('echo', 1), {
        name: 'TypeError',
        message: /Web Workers are not available/
      })
    );
  });

  test('rejects input that cannot be cloned, and keeps working', async () => {
    await withWorker(async () => {
      const threaded = exposed();

      await assert.rejects(
        threaded.runTask('echo', () => 1),
        isWorkerError(
          /couldn't send its input/,
          (error) => error.cause !== undefined
        )
      );
      assert.equal(
        await threaded.runTask('echo', 'still works'),
        'still works'
      );
      threaded.close();
    });
  });
});

describe('runTask with a hand written worker script', () => {
  test('rejects error replies, including falsy ones', async () => {
    await withWorker(async () => {
      const threaded = raw();

      await assert.rejects(
        threaded.runTask('errorString', 1),
        isWorkerError(
          /failed: task failed$/,
          (error) => error.detail === 'task failed'
        )
      );
      await assert.rejects(
        threaded.runTask('errorObject', 1),
        isWorkerError(
          /failed: bad input$/,
          (error) => (error.detail as { code: string }).code === 'E_TASK'
        )
      );
      await assert.rejects(
        threaded.runTask('errorEmpty', 1),
        isWorkerError(/'errorEmpty' failed$/, (error) => error.detail === '')
      );
      await assert.rejects(
        threaded.runTask('errorOther', 1),
        isWorkerError(/failed: 42$/)
      );
      await assert.rejects(
        threaded.runTask('errorBigInt', 1),
        isWorkerError(/failed: 10$/)
      );
      await assert.rejects(
        threaded.runTask('noResult', 1),
        isWorkerError(/neither a result nor an error/)
      );
      threaded.close();
    });
  });

  test('ignores messages it cannot match, without throwing', async () => {
    await withWorker(async () => {
      const uncaught: unknown[] = [];
      const listener = (error: unknown) => uncaught.push(error);

      process.on('uncaughtException', listener);

      try {
        const threaded = raw({ timeout: 150 });

        for (const task of ['null', 'stranger']) {
          await assert.rejects(
            threaded.runTask(task, 1),
            isWorkerError(new RegExp(`'${task}' timed out after 150 ms`))
          );
        }

        threaded.close();
      } finally {
        process.off('uncaughtException', listener);
      }

      assert.deepEqual(uncaught, []);
    });
  });

  test('rejects every waiting task when the worker throws, and starts a new worker for the next one', async () => {
    await withWorker(async () => {
      const threaded = raw();
      const before = ThreadWorker.started;
      const waiting = threaded.runTask('hang', 1);

      await assert.rejects(
        threaded.runTask('throw', 1),
        isWorkerError(
          /'throw' got no reply: the worker threw: thrown inside the worker/,
          (error) => error.cause !== undefined
        )
      );
      await assert.rejects(
        waiting,
        isWorkerError(/'hang' got no reply: the worker threw/)
      );
      assert.equal(await threaded.runTask('echo', 'again'), 'again');
      assert.equal(ThreadWorker.started - before, 2);
      threaded.close();
    });
  });

  test('rejects when the worker script does not load', async () => {
    await withWorker(async () => {
      const threaded = createThreadedCompute({
        url: fixture('missing'),
        canRunTasks: ['echo']
      });

      await assert.rejects(
        threaded.runTask('echo', 1),
        isWorkerError(
          /got no reply: the worker failed: its script did not load/
        )
      );
    });
  });

  test('rejects with WorkerTaskError when the worker cannot be constructed', async () => {
    await withWorker(async () => {
      const threaded = createThreadedCompute({
        url: './constructor-throws.js',
        canRunTasks: ['echo']
      });

      await assert.rejects(
        threaded.runTask('echo', 1),
        isWorkerError(
          /couldn't start the worker \.\/constructor-throws\.js/,
          (error) => error.cause instanceof TypeError
        )
      );
    });
  });

  test('rejects every waiting task on a messageerror, and keeps the worker', async () => {
    await withWorker(async () => {
      const threaded = raw();
      const waiting = threaded.runTask('hang', 1);

      await wait(20);
      ThreadWorker.last?.dispatchEvent(new Event('messageerror'));
      await assert.rejects(
        waiting,
        isWorkerError(/got no reply: a reply from the worker could not be read/)
      );
      assert.equal(await threaded.runTask('echo', 'kept'), 'kept');
      threaded.close();
    });
  });
});

describe('timeout and cancelling', () => {
  test('rejects when the timeout passes, and tells the worker to cancel', async () => {
    await withWorker(async () => {
      const threaded = exposed({ timeout: 100 });

      await assert.rejects(
        threaded.runTask('waitForAbort', 1),
        isWorkerError(/^Worker task 'waitForAbort' timed out after 100 ms$/)
      );
      assert.equal(await threaded.runTask('abortedCount', null), 1);
      threaded.close();
    });
  });

  test('rejects with the reason when the signal aborts, and tells the worker to cancel', async () => {
    await withWorker(async () => {
      const threaded = exposed();
      const controller = new AbortController();
      const pending = threaded.runTask('waitForAbort', 1, {
        signal: controller.signal
      });

      await wait(20);
      controller.abort(new Error('cancelled'));
      await assert.rejects(pending, /cancelled/);
      assert.equal(await threaded.runTask('abortedCount', null), 1);
      threaded.close();
    });
  });

  test('rejects at once for a signal that has already aborted, without starting a worker', async () => {
    await withWorker(async () => {
      const before = ThreadWorker.started;

      await assert.rejects(
        exposed().runTask('echo', 1, {
          signal: AbortSignal.abort(new Error('too late'))
        }),
        /too late/
      );
      assert.equal(ThreadWorker.started, before);
    });
  });
});

describe('close', () => {
  test('rejects waiting tasks, and the next task starts a new worker', async () => {
    await withWorker(async () => {
      const threaded = raw();
      const before = ThreadWorker.started;
      const pending = threaded.runTask('hang', 1);

      await wait(20);

      const closed = ThreadWorker.last;

      threaded.close();
      await assert.rejects(
        pending,
        isWorkerError(/'hang' got no reply: the worker was closed/)
      );

      // Events from the closed worker no longer reach the backend
      const next = threaded.runTask('hang', 2);

      closed?.dispatchEvent(new Event('error'));
      closed?.dispatchEvent(new Event('messageerror'));
      assert.equal(await threaded.runTask('echo', 'new'), 'new');
      assert.equal(ThreadWorker.started - before, 2);
      threaded.close();
      await assert.rejects(next, isWorkerError(/the worker was closed/));
    });
  });

  test('does nothing before the first task', () => {
    assert.doesNotThrow(() => exposed().close());
  });
});

describe('createThreadedCompute', () => {
  test('returns an instance of ThreadedCompute', () => {
    assert.ok(exposed() instanceof ThreadedCompute);
  });
});
