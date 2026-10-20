// Properties of the task registry, checked against a Set of names: any
// sequence of registerTask and unregisterTask calls leaves LocalCompute
// agreeing with the Set, for any name, prototype names included.
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { NoBackendError } from '@hybrid-compute/core';
import fc from 'fast-check';

import { createLocalCompute } from '..';

const names = fc.oneof(
  fc.constantFrom('a', 'b', '__proto__', 'constructor', 'toString'),
  fc.string({ minLength: 1 })
);
const operations = fc.array(
  fc.record({ op: fc.constantFrom('register', 'unregister'), name: names }),
  { maxLength: 30 }
);

describe('registry properties', () => {
  test('any sequence of register and unregister agrees with a Set of names', async () => {
    await fc.assert(
      fc.asyncProperty(operations, fc.jsonValue(), async (steps, input) => {
        const local = createLocalCompute();
        const model = new Set<string>();

        for (const { op, name } of steps) {
          if (op === 'register') {
            if (model.has(name)) {
              assert.throws(
                () => local.registerTask({ name, run: (value) => value }),
                RangeError
              );
            } else {
              local.registerTask({
                name,
                run: (value) => ({ name, value })
              });
              model.add(name);
            }
          } else {
            assert.equal(local.unregisterTask(name), model.delete(name));
          }

          assert.equal(local.canRun(name), model.has(name));
        }

        // Every registered task runs with its input; every other name rejects
        for (const { name } of steps) {
          if (model.has(name)) {
            assert.deepEqual(await local.runTask(name, input), {
              name,
              value: input
            });
          } else {
            await assert.rejects(local.runTask(name, input), NoBackendError);
          }
        }
      })
    );
  });
});
