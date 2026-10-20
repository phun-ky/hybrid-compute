import test, { describe } from 'node:test';
import assert from 'node:assert';
import { createLocalCompute, LocalCompute } from '..';
import { ComputeTaskInterface, NoBackendError } from '@hybrid-compute/core';

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

  test('rejects with NoBackendError if the task is not registered', async () => {
    const compute = new LocalCompute();

    await assert.rejects(
      () => compute.runTask('missing', 123),
      (error: unknown) =>
        error instanceof NoBackendError &&
        error.taskName === 'missing' &&
        error.strategy === 'local' &&
        error.message === "No local task 'missing' is registered"
    );
  });

  test('runs a synchronous task', async () => {
    const compute = new LocalCompute();

    compute.registerTask<number, number>({ name: 'double', run: (n) => n * 2 });

    assert.strictEqual(await compute.runTask('double', 21), 42);
  });

  test('turns a synchronous throw into a rejection', async () => {
    const compute = new LocalCompute();

    compute.registerTask({
      name: 'boom',
      run: () => {
        throw new Error('boom');
      }
    });

    const pending = compute.runTask('boom', undefined);

    await assert.rejects(pending, /boom/);
  });

  test('keeps the task bound to its object, so run can use this', async () => {
    const compute = new LocalCompute();
    const task = {
      name: 'greet',
      greeting: 'Hello',
      run(name: string) {
        return `${this.greeting}, ${name}!`;
      }
    };

    compute.registerTask(task);

    assert.strictEqual(await compute.runTask('greet', 'Ada'), 'Hello, Ada!');
  });

  test('keeps its own copy, so changing the task later has no effect', async () => {
    const compute = new LocalCompute();
    const task = { name: 'version', run: () => 'original' };

    compute.registerTask(task);
    task.run = () => 'changed';
    task.name = 'renamed';

    assert.strictEqual(await compute.runTask('version', undefined), 'original');
    assert.strictEqual(compute.canRun('renamed'), false);
  });
});

describe('registerTask validation', () => {
  test('throws a TypeError for something that is not a task object', () => {
    const compute = new LocalCompute();

    for (const value of [undefined, null, 'task', 42, []]) {
      assert.throws(
        () =>
          compute.registerTask(
            value as unknown as ComputeTaskInterface<unknown, unknown>
          ),
        TypeError
      );
    }
  });

  test('throws a TypeError for a name that is not a non-empty string', () => {
    const compute = new LocalCompute();

    for (const name of ['', 42, undefined]) {
      assert.throws(
        () =>
          compute.registerTask({
            name,
            run: () => 1
          } as unknown as ComputeTaskInterface<unknown, unknown>),
        TypeError
      );
    }

    assert.throws(() => compute.registerTask({ name: '', run: () => 1 }), {
      message: "A task's name must be a non-empty string, got an empty string"
    });
  });

  test('throws a TypeError for a task without a run function', () => {
    const compute = new LocalCompute();

    assert.throws(
      () =>
        compute.registerTask({
          name: 'norun'
        } as unknown as ComputeTaskInterface<unknown, unknown>),
      { name: 'TypeError', message: "Task 'norun' must have a run function" }
    );
    assert.strictEqual(compute.canRun('norun'), false);
  });

  test('throws a RangeError for a name that is already registered', async () => {
    const compute = new LocalCompute();

    compute.registerTask({ name: 'dup', run: () => 'first' });

    assert.throws(
      () => compute.registerTask({ name: 'dup', run: () => 'second' }),
      {
        name: 'RangeError',
        message:
          "A task named 'dup' is already registered; call unregisterTask('dup') first to replace it"
      }
    );
    assert.strictEqual(await compute.runTask('dup', undefined), 'first');
  });
});

describe('unregisterTask', () => {
  test('removes a task, so a new one can take its name', async () => {
    const compute = new LocalCompute();

    compute.registerTask({ name: 'swap', run: () => 'first' });

    assert.strictEqual(compute.unregisterTask('swap'), true);
    assert.strictEqual(compute.canRun('swap'), false);

    compute.registerTask({ name: 'swap', run: () => 'second' });
    assert.strictEqual(await compute.runTask('swap', undefined), 'second');
  });

  test('returns false when no task has that name', () => {
    assert.strictEqual(new LocalCompute().unregisterTask('missing'), false);
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
