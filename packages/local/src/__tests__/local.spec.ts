import test, { describe } from 'node:test';
import assert from 'node:assert';
import { createLocalCompute, LocalCompute } from '..';
import { ComputeTaskInterface } from '@hybrid-compute/core';

describe('LocalCompute', () => {
  test('can register and run a simple task', async () => {
    const compute = new LocalCompute();

    const task: ComputeTaskInterface<number, number> = {
      name: 'square',
      run: async (n) => n * n
    };

    compute.registerTask(task);

    const result = await compute.runTask('square', 5);
    assert.strictEqual(result, 25);
  });

  test('canRun returns true for registered task', () => {
    const compute = new LocalCompute();

    compute.registerTask({
      name: 'ping',
      run: async () => 'pong'
    });

    assert.strictEqual(compute.canRun('ping'), true);
  });

  test('canRun returns false for unregistered task', () => {
    const compute = new LocalCompute();
    assert.strictEqual(compute.canRun('nonexistent'), false);
  });

  test('throws if task not found', async () => {
    const compute = new LocalCompute();

    await assert.rejects(
      () => compute.runTask('missing', 123),
      /Local task 'missing' not found/
    );
  });

  test('runTask returns expected result for typed task', async () => {
    const compute = new LocalCompute();

    compute.registerTask({
      name: 'greet',
      run: async (name: string) => `Hello, ${name}!`
    });

    const result = await compute.runTask<string, string>('greet', 'Alice');
    assert.strictEqual(result, 'Hello, Alice!');
  });
});

describe('createLocalCompute', () => {
  test('returns an instance of LocalCompute', () => {
    const instance = createLocalCompute();
    assert.ok(instance instanceof LocalCompute);
  });
});
