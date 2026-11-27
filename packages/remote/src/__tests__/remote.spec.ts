import assert from 'node:assert/strict';
import test, { after, before, describe } from 'node:test';

import {
  createRemoteCompute,
  RemoteCompute,
  RemoteComputeOptionsInterface,
  RemoteTaskError
} from '..';

import { startTestServer, type TestServerType } from './server';

let server: TestServerType;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

const fetchTo = (
  path: string,
  extra: Partial<RemoteComputeOptionsInterface> = {}
) =>
  createRemoteCompute({
    transport: 'fetch',
    endpoint: `${server.http}/${path}`,
    canRunTasks: '*',
    ...extra
  });
const socketTo = (extra: Partial<RemoteComputeOptionsInterface> = {}) =>
  createRemoteCompute({
    transport: 'websocket',
    endpoint: server.ws,
    canRunTasks: '*',
    ...extra
  });
const isRemoteError =
  (message: RegExp, check: (error: RemoteTaskError) => boolean = () => true) =>
  (error: unknown) =>
    error instanceof RemoteTaskError &&
    message.test(error.message) &&
    check(error);
const options = (value: unknown) =>
  value as unknown as RemoteComputeOptionsInterface;

describe('options', () => {
  test('throws a TypeError for something that is not an options object', () => {
    for (const value of [undefined, null, 'fetch', []]) {
      assert.throws(() => createRemoteCompute(options(value)), TypeError);
    }
  });

  test('throws a RangeError for an unknown transport', () => {
    assert.throws(
      () =>
        createRemoteCompute(
          options({
            transport: 'http',
            endpoint: server.http,
            canRunTasks: '*'
          })
        ),
      {
        name: 'RangeError',
        message: "Unknown transport \"http\"; use 'fetch' or 'websocket'"
      }
    );
  });

  test('throws for a missing, invalid or wrongly schemed endpoint', () => {
    assert.throws(
      () =>
        createRemoteCompute(options({ transport: 'fetch', canRunTasks: '*' })),
      TypeError
    );
    assert.throws(
      () =>
        createRemoteCompute({
          transport: 'fetch',
          endpoint: '',
          canRunTasks: '*'
        }),
      { name: 'TypeError', message: /got an empty string/ }
    );
    assert.throws(
      () =>
        createRemoteCompute({
          transport: 'fetch',
          endpoint: '/compute',
          canRunTasks: '*'
        }),
      TypeError,
      'a relative URL has no base outside a browser page'
    );
    assert.throws(
      () =>
        createRemoteCompute({
          transport: 'websocket',
          endpoint: server.http,
          canRunTasks: '*'
        }),
      RangeError
    );
    assert.throws(
      () =>
        createRemoteCompute({
          transport: 'fetch',
          endpoint: server.ws,
          canRunTasks: '*'
        }),
      RangeError
    );
  });

  test('requires canRunTasks: a list of task names, or * for every task', () => {
    for (const canRunTasks of [undefined, 'echo', ['echo', ''], [42]]) {
      assert.throws(
        () =>
          createRemoteCompute(
            options({ transport: 'fetch', endpoint: server.http, canRunTasks })
          ),
        TypeError
      );
    }

    const listed = fetchTo('ok', { canRunTasks: ['echo'] });

    assert.equal(listed.canRun('echo'), true);
    assert.equal(listed.canRun('e'), false);
    assert.equal(fetchTo('ok').canRun('anything'), true);
  });

  test('resolves a relative fetch endpoint against the page URL in a browser', async () => {
    const global = globalThis as { location?: { href: string } };

    global.location = { href: `${server.http}/app/page.html` };

    try {
      const remote = createRemoteCompute({
        transport: 'fetch',
        endpoint: '/ok',
        canRunTasks: '*'
      });

      assert.deepEqual(await remote.runTask('echo', 1), {
        task: 'echo',
        input: 1
      });
    } finally {
      delete global.location;
    }
  });

  test('explains that a WebSocket endpoint must be absolute', () => {
    assert.throws(
      () =>
        createRemoteCompute({
          transport: 'websocket',
          endpoint: '/ws',
          canRunTasks: '*'
        }),
      /must be absolute ws: or wss: URLs/
    );
  });

  test('checks timeout and headers', () => {
    assert.throws(() => fetchTo('ok', { timeout: -1 }), RangeError);
    assert.throws(() => fetchTo('ok', { timeout: Number.NaN }), TypeError);
    assert.throws(
      () =>
        fetchTo('ok', {
          headers: { 'x-count': 1 } as unknown as Record<string, string>
        }),
      TypeError
    );
    assert.throws(
      () =>
        fetchTo('ok', {
          headers: 'Bearer x' as unknown as Record<string, string>
        }),
      TypeError
    );
    assert.throws(
      () => socketTo({ headers: { authorization: 'Bearer x' } }),
      /headers only work with the fetch transport/
    );
  });

  test('does no network I/O when it is created', async () => {
    const before = server.connections();

    socketTo();
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(server.connections(), before);
  });
});

describe('fetch transport', () => {
  test('resolves the result', async () => {
    assert.deepEqual(await fetchTo('ok').runTask('echo', { a: 1 }), {
      task: 'echo',
      input: { a: 1 }
    });
  });

  test('rejects an error reply with RemoteTaskError, keeping the detail', async () => {
    await assert.rejects(
      fetchTo('error-string').runTask('t', 1),
      isRemoteError(/Remote task 't' failed: task failed/, (error) => {
        return error.detail === 'task failed' && error.status === 200;
      })
    );
    await assert.rejects(
      fetchTo('error-object').runTask('t', 1),
      isRemoteError(/failed: bad input/, (error) => {
        return (error.detail as { code: string }).code === 'E_TASK';
      })
    );
    await assert.rejects(
      fetchTo('error-number').runTask('t', 1),
      isRemoteError(/failed: 42$/, (error) => error.detail === 42)
    );
  });

  test('rejects unusable responses', async () => {
    await assert.rejects(
      fetchTo('no-result').runTask('t', 1),
      isRemoteError(/neither a result nor an error/)
    );
    await assert.rejects(
      fetchTo('not-object').runTask('t', 1),
      isRemoteError(/got a reply that isn't a JSON object/)
    );
    await assert.rejects(
      fetchTo('not-json').runTask('t', 1),
      isRemoteError(/isn't JSON/)
    );
    await assert.rejects(
      fetchTo('http-500').runTask('t', 1),
      isRemoteError(/failed with HTTP 500/, (error) => error.status === 500)
    );
    await assert.rejects(
      fetchTo('http-404').runTask('t', 1),
      isRemoteError(
        /failed with HTTP 404$/,
        (error) => error.status === 404 && error.detail === undefined
      )
    );
    await assert.rejects(
      fetchTo('http-400-error').runTask('t', 1),
      isRemoteError(
        /failed with HTTP 400: input must be a string/,
        (error) =>
          error.status === 400 && error.detail === 'input must be a string'
      )
    );
  });

  test('rejects with RemoteTaskError when the timeout passes', async () => {
    await assert.rejects(
      fetchTo('hang', { timeout: 100 }).runTask('slow', 1),
      isRemoteError(/Remote task 'slow' timed out after 100 ms/)
    );
  });

  test('rejects with RemoteTaskError when the server cannot be reached', async () => {
    const unreachable = createRemoteCompute({
      transport: 'fetch',
      endpoint: 'http://127.0.0.1:1/compute',
      canRunTasks: '*'
    });

    await assert.rejects(
      unreachable.runTask('t', 1),
      isRemoteError(/couldn't reach/, (error) => error.cause !== undefined)
    );
  });

  test('rejects with the reason when the signal aborts', async () => {
    const controller = new AbortController();
    const pending = fetchTo('hang').runTask('t', 1, {
      signal: controller.signal
    });

    controller.abort(new Error('cancelled'));
    await assert.rejects(pending, /cancelled/);
  });

  test('sends headers from an object or a function', async () => {
    await fetchTo('ok', { headers: { authorization: 'Bearer one' } }).runTask(
      't',
      1
    );
    assert.equal(server.lastHeaders()?.authorization, 'Bearer one');

    await fetchTo('ok', {
      headers: async () => ({ authorization: 'Bearer two' })
    }).runTask('t', 1);
    assert.equal(server.lastHeaders()?.authorization, 'Bearer two');
    assert.equal(server.lastHeaders()?.['content-type'], 'application/json');
  });
});

describe('fetch transport with batch', () => {
  const batchTo = (
    path: string,
    batch: RemoteComputeOptionsInterface['batch'] = {},
    extra: Partial<RemoteComputeOptionsInterface> = {}
  ) => fetchTo(path, { batch, ...extra });
  /** The batch sizes sent since the last call. */
  const sentBatches = (() => {
    let seen = 0;

    return () => {
      const all = server.batches();
      const since = all.slice(seen);

      seen = all.length;

      return since;
    };
  })();

  test('checks batch: an object, for fetch only, with a whole size and a wait of 0 or more', () => {
    const create = (batch: unknown, transport = 'fetch') =>
      createRemoteCompute({
        transport,
        endpoint: transport === 'fetch' ? server.http : server.ws,
        canRunTasks: '*',
        batch
      } as RemoteComputeOptionsInterface);

    assert.throws(() => create(true), {
      name: 'TypeError',
      message: /batch must be an object/
    });
    assert.throws(() => create({}, 'websocket'), {
      name: 'TypeError',
      message: /only works with the fetch transport/
    });
    assert.throws(() => create({ size: 0 }), RangeError);
    assert.throws(() => create({ size: 1.5 }), TypeError);
    assert.throws(() => create({ wait: -1 }), RangeError);
    assert.throws(() => create({ wait: '10' }), TypeError);
    assert.ok(create({ size: 1, wait: 0 }) instanceof RemoteCompute);
  });

  test('sends the tasks started together as one request, matching replies by id', async () => {
    sentBatches();

    const remote = batchTo('batch');

    assert.deepEqual(
      await Promise.all(['a', 'b', 'c'].map((n) => remote.runTask('echo', n))),
      ['a', 'b', 'c']
    );
    assert.deepEqual(sentBatches(), [3]);
  });

  test('sends a batch as soon as it holds size tasks', async () => {
    sentBatches();

    const remote = batchTo('batch', { size: 2 });

    assert.deepEqual(
      await Promise.all([1, 2, 3, 4, 5].map((n) => remote.runTask('echo', n))),
      [1, 2, 3, 4, 5]
    );
    // Sent at once, so they may reach the server in any order
    assert.deepEqual(sentBatches().sort(), [1, 2, 2]);
  });

  test('waits wait milliseconds after the first task for more', async () => {
    sentBatches();

    const remote = batchTo('batch', { wait: 50 });
    const first = remote.runTask('echo', 1);

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.deepEqual(
      await Promise.all([first, remote.runTask('echo', 2)]),
      [1, 2]
    );
    assert.deepEqual(sentBatches(), [2]);
  });

  test('settles each task with its own reply: a result, an error, or none', async () => {
    const remote = batchTo('batch');
    const [ok, failed, skipped] = await Promise.allSettled([
      remote.runTask('echo', 'fine'),
      remote.runTask('fail', 1),
      remote.runTask('skip', 1)
    ]);

    assert.deepEqual(ok, { status: 'fulfilled', value: 'fine' });
    assert.ok(
      failed.status === 'rejected' &&
        isRemoteError(/'fail' failed: task failed/)(failed.reason)
    );
    assert.ok(
      skipped.status === 'rejected' &&
        isRemoteError(
          /'skip' got no reply in the batch/,
          (error) => error.status === 200
        )(skipped.reason)
    );
  });

  test('rejects every task in a request that fails', async () => {
    const both = (remote: RemoteCompute) =>
      Promise.allSettled([
        remote.runTask('first', 1),
        remote.runTask('second', 2)
      ]);
    const reasons = async (remote: RemoteCompute) =>
      (await both(remote)).map((result) =>
        result.status === 'rejected' ? result.reason : result.value
      );

    for (const [path, message] of [
      ['http-500', /failed with HTTP 500/],
      ['ok', /got a batch reply that isn't a JSON array/],
      ['not-json', /got a reply that isn't JSON/]
    ] as const) {
      const [first, second] = await reasons(batchTo(path));

      assert.ok(isRemoteError(message, (e) => e.taskName === 'first')(first));
      assert.ok(isRemoteError(message, (e) => e.taskName === 'second')(second));
    }

    const unreachable = await reasons(
      createRemoteCompute({
        transport: 'fetch',
        endpoint: 'http://127.0.0.1:1/compute',
        canRunTasks: '*',
        batch: {}
      })
    );

    for (const reason of unreachable) {
      assert.ok(isRemoteError(/couldn't reach/)(reason));
    }

    const throwing = batchTo(
      'batch',
      {},
      {
        headers: () => {
          throw new Error('no token');
        }
      }
    );

    for (const reason of await reasons(throwing)) {
      assert.match((reason as Error).message, /no token/);
    }
  });

  test('rejects input that is not JSON on its own, and sends the rest', async () => {
    sentBatches();

    const remote = batchTo('batch');
    const [bad, good] = await Promise.allSettled([
      remote.runTask('echo', 10n),
      remote.runTask('echo', 'fine')
    ]);

    assert.ok(bad.status === 'rejected' && bad.reason instanceof TypeError);
    assert.deepEqual(good, { status: 'fulfilled', value: 'fine' });
    assert.deepEqual(sentBatches(), [1]);
  });

  test('leaves out a task cancelled before sending, and aborts the request once every task has settled', async () => {
    const original = globalThis.fetch;
    const requests: RequestInit[] = [];

    globalThis.fetch = (input, init) => {
      requests.push(init!);

      return original(input, init);
    };

    try {
      const remote = batchTo('hang', { wait: 20 }, { timeout: 0 });
      const early = new AbortController();
      const late = new AbortController();
      const first = remote.runTask('a', 1, { signal: early.signal });
      const second = remote.runTask('b', 2, { signal: late.signal });

      early.abort(new Error('early'));
      await assert.rejects(first, /early/);
      await new Promise((resolve) => setTimeout(resolve, 40));
      assert.equal(requests.length, 1);
      assert.deepEqual(
        JSON.parse(String(requests[0].body)).map(
          ({ task }: { task: string }) => task
        ),
        ['b']
      );
      assert.equal(requests[0].signal?.aborted, false);
      late.abort(new Error('late'));
      await assert.rejects(second, /late/);
      assert.equal(requests[0].signal?.aborted, true);

      // Every task cancelled before sending: no request at all
      const only = new AbortController();
      const alone = remote.runTask('c', 3, { signal: only.signal });

      only.abort(new Error('alone'));
      await assert.rejects(alone, /alone/);
      await new Promise((resolve) => setTimeout(resolve, 40));
      assert.equal(requests.length, 1);
    } finally {
      globalThis.fetch = original;
    }
  });

  test('rejects with RemoteTaskError when the timeout passes', async () => {
    await assert.rejects(
      batchTo('hang', {}, { timeout: 30 }).runTask('slow', 1),
      isRemoteError(/'slow' timed out after 30 ms/)
    );
  });
});

describe('websocket transport', () => {
  test('waits for the connection, so a task right after creating it works', async () => {
    const remote = socketTo();

    assert.equal(await remote.runTask('echo', 'hi'), 'hi');
    remote.close();
  });

  test('matches concurrent replies by id over one connection', async () => {
    const before = server.connections();
    const remote = socketTo();

    assert.deepEqual(
      await Promise.all([
        remote.runTask('echo', 'a'),
        remote.runTask('echo', 'b'),
        remote.runTask('echo', 'c')
      ]),
      ['a', 'b', 'c']
    );
    assert.equal(server.connections() - before, 1);
    remote.close();
  });

  test('rejects an error reply with RemoteTaskError', async () => {
    const remote = socketTo();

    await assert.rejects(
      remote.runTask('fail', 1),
      isRemoteError(
        /failed: task failed/,
        (error) => error.detail === 'task failed'
      )
    );
    remote.close();
  });

  test('ignores replies it cannot match, without throwing', async () => {
    const uncaught: unknown[] = [];
    const listener = (error: unknown) => uncaught.push(error);

    process.on('uncaughtException', listener);

    try {
      const remote = socketTo({ timeout: 150 });

      for (const task of ['malformed', 'null', 'stranger']) {
        await assert.rejects(
          remote.runTask(task, 1),
          isRemoteError(/timed out after 150 ms/)
        );
      }

      remote.close();
    } finally {
      process.off('uncaughtException', listener);
    }

    assert.deepEqual(uncaught, []);
  });

  test('rejects waiting tasks when the server closes, and reconnects for the next one', async () => {
    const remote = socketTo();
    const before = server.connections();

    await assert.rejects(
      remote.runTask('close', 1),
      isRemoteError(/got no reply: the connection closed/)
    );
    assert.equal(await remote.runTask('echo', 'again'), 'again');
    assert.equal(server.connections() - before, 2);
    remote.close();
  });

  test('close() rejects waiting tasks, closes the socket, and the next task reconnects', async () => {
    const remote = socketTo();

    assert.equal(await remote.runTask('echo', 1), 1);

    const closedBefore = server.closedByClient();
    const pending = remote.runTask('hang', 1);

    await new Promise((resolve) => setTimeout(resolve, 20));
    remote.close();
    await assert.rejects(pending, isRemoteError(/the connection was closed/));
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(server.closedByClient() - closedBefore, 1);
    assert.equal(await remote.runTask('echo', 2), 2);
    remote.close();
  });

  test('close() while connecting rejects the task and closes the new socket', async () => {
    const remote = socketTo();
    const closedBefore = server.closedByClient();
    const pending = remote.runTask('echo', 1);

    remote.close();
    await assert.rejects(pending, isRemoteError(/the connection was closed/));
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(server.closedByClient() - closedBefore, 1);
  });

  test('rejects with RemoteTaskError when it cannot connect', async () => {
    const remote = createRemoteCompute({
      transport: 'websocket',
      endpoint: 'ws://127.0.0.1:1/ws',
      canRunTasks: '*'
    });

    await assert.rejects(
      remote.runTask('echo', 1),
      isRemoteError(/couldn't connect/)
    );
  });

  test('rejects with the reason when the signal aborts, and ignores the late reply', async () => {
    const remote = socketTo();
    const controller = new AbortController();
    const pending = remote.runTask('hang', 1, { signal: controller.signal });

    controller.abort(new Error('cancelled'));
    await assert.rejects(pending, /cancelled/);
    assert.equal(await remote.runTask('echo', 'still works'), 'still works');
    remote.close();
  });

  test('passes progress messages to onProgress before the result', async () => {
    const remote = socketTo();
    const seen: unknown[] = [];

    assert.equal(
      await remote.runTask('progress', [25, 50], {
        onProgress: (value) => seen.push(value)
      }),
      'done'
    );
    assert.deepEqual(seen, [25, 50]);
    // Without onProgress, progress messages are still not the reply
    assert.equal(await remote.runTask('progress', [1]), 'done');
    remote.close();
  });

  test('rejects with the error onProgress throws, and ignores the rest', async () => {
    const remote = socketTo();
    const failure = new Error('bad progress');

    await assert.rejects(
      () =>
        remote.runTask('progress', [1, 2], {
          onProgress: () => {
            throw failure;
          }
        }),
      (error) => error === failure
    );
    assert.equal(await remote.runTask('echo', 'still works'), 'still works');
    remote.close();
  });
});

describe('createRemoteCompute', () => {
  test('returns an instance of RemoteCompute', () => {
    assert.ok(fetchTo('ok') instanceof RemoteCompute);
  });
});
