// Properties of the message format, checked against the real test server:
// any JSON input reaches the server and comes back as JSON would carry it,
// over fetch and over WebSocket, and concurrent WebSocket tasks always get
// their own reply.
import assert from 'node:assert/strict';
import test, { after, before, describe } from 'node:test';

import fc from 'fast-check';

import { createRemoteCompute } from '..';

import { startTestServer, type TestServerType } from './server';

let server: TestServerType;

before(async () => {
  server = await startTestServer();
});

after(() => server.close());

/** What JSON carries: -0 becomes 0, and so on. */
const viaJson = (value: unknown) => JSON.parse(JSON.stringify(value));

describe('message properties', () => {
  test('fetch: any JSON input reaches the server and comes back unchanged', async () => {
    const remote = createRemoteCompute({
      transport: 'fetch',
      endpoint: `${server.http}/ok`,
      canRunTasks: '*'
    });

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.jsonValue(),
        async (task, input) => {
          assert.deepEqual(
            await remote.runTask(task, input),
            viaJson({ task, input })
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  test('websocket: concurrent tasks each get their own reply', async () => {
    const remote = createRemoteCompute({
      transport: 'websocket',
      endpoint: server.ws,
      canRunTasks: '*'
    });

    try {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.jsonValue({ maxDepth: 3 }), {
            minLength: 1,
            maxLength: 8
          }),
          async (inputs) => {
            assert.deepEqual(
              await Promise.all(
                inputs.map((input) => remote.runTask('echo', input))
              ),
              inputs.map(viaJson)
            );
          }
        ),
        { numRuns: 50 }
      );
    } finally {
      remote.close();
    }
  });

  test('canRun is true exactly for the listed tasks', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1 })),
        fc.string(),
        (canRunTasks, taskName) => {
          const remote = createRemoteCompute({
            transport: 'fetch',
            endpoint: server.http,
            canRunTasks
          });

          assert.equal(remote.canRun(taskName), canRunTasks.includes(taskName));
        }
      )
    );
  });
});
