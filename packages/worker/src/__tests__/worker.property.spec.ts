// Properties of the message format, through a real thread: any value the
// structured clone algorithm can copy comes back as that algorithm copies
// it, concurrent tasks each get their own reply, and whatever a task throws
// comes back as a WorkerTaskError with its message.
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import fc from 'fast-check';

import { createThreadedCompute, exposeTasks, WorkerTaskError } from '..';

import { withWorker } from './thread-worker';

const exposed = () =>
  createThreadedCompute({
    url: new URL('./fixtures/exposed.ts', import.meta.url),
    canRunTasks: ['echo']
  });
/** Values the structured clone algorithm can copy. */
const cloneable = fc.anything({
  maxDepth: 3,
  withBigInt: true,
  withDate: true,
  withMap: true,
  withSet: true,
  withTypedArray: true,
  withSparseArray: true,
  withNullPrototype: false,
  withBoxedValues: false,
  withObjectString: false
});

describe('message properties', () => {
  test('any cloneable input comes back as structuredClone copies it', async () => {
    await withWorker(async () => {
      const threaded = exposed();

      try {
        await fc.assert(
          fc.asyncProperty(cloneable, async (input) => {
            assert.deepEqual(
              await threaded.runTask('echo', input),
              structuredClone(input)
            );
          }),
          { numRuns: 100 }
        );
      } finally {
        threaded.close();
      }
    });
  });

  test('concurrent tasks each get their own reply', async () => {
    await withWorker(async () => {
      const threaded = exposed();

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.array(fc.jsonValue({ maxDepth: 2 }), { maxLength: 10 }),
            async (inputs) => {
              assert.deepEqual(
                await Promise.all(
                  inputs.map((input) => threaded.runTask('echo', input))
                ),
                inputs.map((input) => structuredClone(input))
              );
            }
          ),
          { numRuns: 50 }
        );
      } finally {
        threaded.close();
      }
    });
  });

  test('exposeTasks replies with what a task throws', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string().map((message) => new Error(message)),
          fc.string({ minLength: 1 })
        ),
        async (thrown) => {
          const replies: unknown[] = [];
          let listener: (event: { data: unknown }) => void = () => {};

          exposeTasks(
            {
              fail: () => {
                throw thrown;
              }
            },
            {
              addEventListener: (_type, fn) => (listener = fn),
              postMessage: (message) => replies.push(message)
            }
          );
          listener({ data: { id: 1, task: 'fail', input: null } });
          await new Promise((resolve) => setTimeout(resolve, 0));

          const message = typeof thrown === 'string' ? thrown : thrown.message;

          assert.deepEqual(replies, [
            {
              id: 1,
              error:
                typeof thrown === 'string' ? thrown : { name: 'Error', message }
            }
          ]);
        }
      )
    );
  });

  test('a thrown message reaches the caller in the WorkerTaskError', async () => {
    await withWorker(async () => {
      const threaded = createThreadedCompute({
        url: new URL('./fixtures/exposed.ts', import.meta.url),
        canRunTasks: ['failWith']
      });

      try {
        await fc.assert(
          fc.asyncProperty(fc.string({ minLength: 1 }), async (message) => {
            await assert.rejects(
              threaded.runTask('failWith', message),
              (error) =>
                error instanceof WorkerTaskError &&
                error.message === `Worker task 'failWith' failed: ${message}`
            );
          }),
          { numRuns: 50 }
        );
      } finally {
        threaded.close();
      }
    });
  });
});
