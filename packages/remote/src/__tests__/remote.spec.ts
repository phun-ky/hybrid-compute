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
        message: `Unknown transport "http"; use 'fetch' or 'websocket'`
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
  });

  test('rejects unusable responses', async () => {
    await assert.rejects(
      fetchTo('no-result').runTask('t', 1),
      isRemoteError(/neither a result nor an error/)
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
});

describe('createRemoteCompute', () => {
  test('returns an instance of RemoteCompute', () => {
    assert.ok(fetchTo('ok') instanceof RemoteCompute);
  });
});
