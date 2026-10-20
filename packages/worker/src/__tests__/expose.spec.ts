import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { exposeTasks, WorkerScopeInterface, WorkerTaskType } from '..';

/** A scope that records replies, and sends messages to the listener. */
const createScope = (postMessage?: (message: unknown) => void) => {
  const replies: unknown[] = [];
  let listener: (event: { data: unknown }) => void = () => {};
  const scope: WorkerScopeInterface = {
    addEventListener: (_type, fn) => {
      listener = fn;
    },
    postMessage: postMessage ?? ((message) => replies.push(message))
  };

  return {
    scope,
    replies,
    send: (data: unknown) => listener({ data }),
    settled: () => new Promise((resolve) => setTimeout(resolve, 10))
  };
};
const tasks = (value: unknown) =>
  value as unknown as Record<string, WorkerTaskType>;

describe('exposeTasks', () => {
  test('throws a TypeError for something that is not an object of functions', () => {
    for (const value of [undefined, null, [], { add: 1 }]) {
      assert.throws(
        () => exposeTasks(tasks(value), createScope().scope),
        TypeError
      );
    }
  });

  test('throws a TypeError outside a worker without a scope', () => {
    assert.throws(() => exposeTasks({}), {
      name: 'TypeError',
      message: /must be called in a worker script/
    });
  });

  test('listens on the global scope in a worker', async () => {
    const global = globalThis as Record<string, unknown>;
    const { scope, replies, send, settled } = createScope();

    Object.assign(global, {
      WorkerGlobalScope: class {},
      addEventListener: scope.addEventListener,
      postMessage: scope.postMessage
    });

    try {
      exposeTasks({ double: (n: number) => n * 2 });
      send({ id: 1, task: 'double', input: 4 });
      await settled();
    } finally {
      delete global.WorkerGlobalScope;
      delete global.addEventListener;
      delete global.postMessage;
    }

    assert.deepEqual(replies, [{ id: 1, result: 8 }]);
  });

  test('replies with the result, or with the error the task throws', async () => {
    const { scope, replies, send, settled } = createScope();

    exposeTasks(
      {
        sum: async (numbers: number[]) => numbers.reduce((a, b) => a + b, 0),
        error: () => {
          throw new RangeError('out of range');
        },
        string: () => Promise.reject('just a string'),
        other: () => {
          throw 42;
        }
      },
      scope
    );
    send({ id: 1, task: 'sum', input: [1, 2, 3] });
    send({ id: 2, task: 'error', input: null });
    send({ id: 3, task: 'string', input: null });
    send({ id: 4, task: 'other', input: null });
    send({ id: 5, task: 'toString', input: null });
    await settled();
    // Async tasks finish in their own time, so compare in id order
    replies.sort((a, b) => (a as { id: number }).id - (b as { id: number }).id);
    assert.deepEqual(replies, [
      { id: 1, result: 6 },
      { id: 2, error: { name: 'RangeError', message: 'out of range' } },
      { id: 3, error: 'just a string' },
      { id: 4, error: { message: '42' } },
      {
        id: 5,
        error: { name: 'Error', message: "No task 'toString' in this worker" }
      }
    ]);
  });

  test('ignores messages it cannot use', async () => {
    const { scope, replies, send, settled } = createScope();

    exposeTasks({ echo: (input: unknown) => input }, scope);

    for (const data of [
      null,
      'echo',
      [],
      { task: 'echo' },
      { id: 1 },
      { id: 2, cancel: true }
    ]) {
      send(data);
    }

    await settled();
    assert.deepEqual(replies, []);
  });

  test('aborts the signal on cancel, and sends no reply', async () => {
    const { scope, replies, send, settled } = createScope();
    const seen: string[] = [];

    exposeTasks(
      {
        wait: (_input: unknown, { signal }) =>
          new Promise((resolve, reject) =>
            signal.addEventListener('abort', () => {
              seen.push('aborted');
              reject(signal.reason);
            })
          ),
        resolveAnyway: (_input: unknown, { signal }) =>
          new Promise((resolve) =>
            signal.addEventListener('abort', () => resolve('done'))
          )
      },
      scope
    );
    send({ id: 1, task: 'wait', input: null });
    send({ id: 2, task: 'resolveAnyway', input: null });
    send({ id: 1, cancel: true });
    send({ id: 2, cancel: true });
    await settled();
    assert.deepEqual(seen, ['aborted']);
    assert.deepEqual(replies, []);
  });

  test('replies with an error when the result cannot be sent', async () => {
    const replies: unknown[] = [];
    const { scope, send, settled } = createScope((message) => {
      if (typeof (message as { result?: unknown }).result === 'function') {
        throw new Error('() => 1 could not be cloned');
      }

      replies.push(message);
    });

    exposeTasks({ fn: () => () => 1 }, scope);
    send({ id: 1, task: 'fn', input: null });
    await settled();
    assert.deepEqual(replies, [
      {
        id: 1,
        error: {
          name: 'DataCloneError',
          message: "the result couldn't be sent: () => 1 could not be cloned"
        }
      }
    ]);
  });
});
