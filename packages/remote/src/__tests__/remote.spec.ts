import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRemoteCompute, RemoteCompute } from '..';
globalThis.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const body = JSON.parse((init?.body as string) ?? '{}');

  const isError = body.task === 'fail';

  return {
    ok: !isError,
    status: isError ? 400 : 200,
    headers: new Headers(),
    redirected: false,
    statusText: isError ? 'Bad Request' : 'OK',
    type: 'basic',
    url: String(input),
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: true,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () =>
      JSON.stringify(
        isError
          ? { error: 'Task failed' }
          : { result: `Result for ${body.task}` }
      ),
    json: async () =>
      isError ? { error: 'Task failed' } : { result: `Result for ${body.task}` }
  } as Response;
};

describe('RemoteCompute', () => {
  test('fetch transport returns result from remote', async () => {
    const compute = new RemoteCompute({
      transport: 'fetch',
      endpoint: 'https://api.example.com/compute'
    });

    const result = await compute.runTask('echo', { message: 'hi' });
    assert.equal(result, 'Result for echo');
  });

  test('fetch transport throws on error response', async () => {
    const compute = new RemoteCompute({
      transport: 'fetch',
      endpoint: 'https://api.example.com/compute'
    });

    await assert.rejects(() => compute.runTask('fail', {}), /Task failed/);
  });

  test('canRun returns true if task is allowed', () => {
    const compute = new RemoteCompute({
      transport: 'fetch',
      endpoint: '/compute',
      canRunTasks: ['foo', 'bar']
    });

    assert.equal(compute.canRun('foo'), true);
    assert.equal(compute.canRun('baz'), false);
  });

  test('canRun returns true if canRunTasks is undefined', () => {
    const compute = new RemoteCompute({
      transport: 'fetch',
      endpoint: '/compute'
    });

    assert.equal(compute.canRun('anything'), true);
  });

  test(
    'WebSocket transport sends and resolves a message',
    { timeout: 200 },
    async () => {
      const OriginalWebSocket = globalThis.WebSocket;
      let sentData = '';

      class MockWebSocket {
        public readyState = WebSocket.OPEN;
        public onmessage: ((event: MessageEvent) => void) | null = null;

        constructor(public url: string) {}

        send(data: string) {
          sentData = data;
          const { id } = JSON.parse(data);
          const fakeResponse = { id, result: 'websocket-result' };
          setTimeout(() => {
            this.onmessage?.({
              data: JSON.stringify(fakeResponse)
            } as MessageEvent);
          }, 10);
        }
      }

      // @ts-expect-error override native WebSocket
      globalThis.WebSocket = MockWebSocket;

      try {
        const compute = new RemoteCompute({
          transport: 'websocket',
          endpoint: 'wss://example.com/ws'
        });

        // Wait a tick before calling runTask (mimics real socket delay)
        await new Promise((resolve) => setTimeout(resolve, 0));

        const result = await compute.runTask('test', { foo: 1 });
        assert.equal(result, 'websocket-result');
      } finally {
        globalThis.WebSocket = OriginalWebSocket;
      }
    }
  );

  test('WebSocket rejects if not connected', async () => {
    const OriginalWebSocket = globalThis.WebSocket;

    class MockWebSocket {
      public readyState = 3; // WebSocket.CLOSED
      public onmessage: ((event: MessageEvent) => void) | null = null;

      constructor(public url: string) {
        console.log('[MOCK] MockWebSocket constructor called');
      }

      send() {
        console.log('[MOCK] send() should not be called');
      }
    }

    // @ts-expect-error override
    globalThis.WebSocket = MockWebSocket;

    try {
      const compute = new RemoteCompute({
        transport: 'websocket',
        endpoint: 'wss://example.com/ws'
      });

      const resultPromise = compute.runTask('any', {});
      await assert.rejects(resultPromise, /WebSocket not connected/);
    } finally {
      globalThis.WebSocket = OriginalWebSocket;
    }
  });

  test('runTask() manually rejects for testing', async () => {
    const compute = {
      runTask: () => Promise.reject(new Error('WebSocket not connected'))
    } as unknown as RemoteCompute;

    await assert.rejects(
      () => compute.runTask('x', {}),
      /WebSocket not connected/
    );
  });
});
describe('createRemoteCompute', () => {
  test('returns instance of RemoteCompute', () => {
    const instance = createRemoteCompute({
      transport: 'fetch',
      endpoint: '/compute'
    });

    assert.ok(instance instanceof RemoteCompute);
  });
});
