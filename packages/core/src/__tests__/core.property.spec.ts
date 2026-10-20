// Properties of task dispatch, checked against a small model of the rules:
// an explicit strategy uses that backend if it's set and can run the task,
// auto takes the first of worker, local, remote that can, and anything else
// rejects with NoBackendError.
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import fc from 'fast-check';

import {
  ComputeBackendInterface,
  createHybridCompute,
  ExecutionStrategyType,
  NoBackendError
} from '..';

type BackendNameType = 'local' | 'worker' | 'remote';

const BACKENDS: BackendNameType[] = ['local', 'worker', 'remote'];
const STRATEGIES: ExecutionStrategyType[] = ['auto', ...BACKENDS];
const AUTO_ORDER: BackendNameType[] = ['worker', 'local', 'remote'];

/** A backend that can run the given tasks, and answers with its own name. */
const backend = (
  name: BackendNameType,
  tasks: ReadonlySet<string>
): ComputeBackendInterface => ({
  canRun: (taskName) => tasks.has(taskName),
  runTask: async <Input, Output>(taskName: string, input: Input) =>
    ({ by: name, taskName, input }) as Output
});

/** Which backend the rules pick, or undefined for NoBackendError. */
const expected = (
  configured: Partial<Record<BackendNameType, ReadonlySet<string>>>,
  taskName: string,
  strategy: ExecutionStrategyType
) => {
  const candidates = strategy === 'auto' ? AUTO_ORDER : [strategy];

  return candidates.find((name) => configured[name]?.has(taskName));
};

const taskNames = fc.constantFrom('a', 'b', 'c', 'toString', '__proto__');
const configurations = fc
  .record(
    {
      local: fc.uniqueArray(taskNames),
      worker: fc.uniqueArray(taskNames),
      remote: fc.uniqueArray(taskNames)
    },
    { requiredKeys: [] }
  )
  .filter((configured) => Object.keys(configured).length > 0);

describe('dispatch properties', () => {
  test('every call goes to the backend the rules pick, or rejects with NoBackendError', async () => {
    await fc.assert(
      fc.asyncProperty(
        configurations,
        taskNames,
        fc.constantFrom(...STRATEGIES),
        fc.jsonValue(),
        async (lists, taskName, strategy, input) => {
          const configured = Object.fromEntries(
            Object.entries(lists).map(([name, tasks]) => [name, new Set(tasks)])
          ) as Partial<Record<BackendNameType, ReadonlySet<string>>>;
          const compute = createHybridCompute(
            Object.fromEntries(
              Object.entries(configured).map(([name, tasks]) => [
                name,
                backend(name as BackendNameType, tasks)
              ])
            )
          );
          const pick = expected(configured, taskName, strategy);

          if (pick === undefined) {
            await assert.rejects(
              compute.runTask(taskName, input, strategy),
              (error) =>
                error instanceof NoBackendError &&
                error.taskName === taskName &&
                error.strategy === strategy
            );

            return;
          }

          // The input reaches the backend as it is, and the same call
          // always goes to the same backend
          for (let i = 0; i < 2; i++) {
            assert.deepEqual(await compute.runTask(taskName, input, strategy), {
              by: pick,
              taskName,
              input
            });
          }
        }
      )
    );
  });

  test('a task name that is not a non-empty string is a TypeError, before any backend is asked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.anything().filter((v) => typeof v !== 'string')
        ),
        async (taskName) => {
          let asked = false;
          const compute = createHybridCompute({
            local: {
              canRun: () => (asked = true),
              runTask: async () => undefined as never
            }
          });

          await assert.rejects(
            compute.runTask(taskName as string, 1),
            TypeError
          );
          assert.equal(asked, false);
        }
      )
    );
  });

  test('a strategy that is not one of auto, local, worker, remote is a RangeError', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => !(STRATEGIES as string[]).includes(s)),
        async (strategy) => {
          const compute = createHybridCompute({
            local: backend('local', new Set(['a']))
          });

          await assert.rejects(
            compute.runTask('a', 1, strategy as ExecutionStrategyType),
            RangeError
          );
        }
      )
    );
  });
});
