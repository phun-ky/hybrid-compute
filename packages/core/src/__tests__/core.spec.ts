import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  ComputeBackendInterface,
  createHybridCompute,
  ExecutionStrategyType,
  HybridCompute,
  NoBackendError
} from '..';

// Mocks
const mockTaskName = 'double';
const mockInput = 21;
const mockOutput = 42;

function createMockBackend(): ComputeBackendInterface {
  return {
    canRun: (taskName) => taskName === 'double',
    runTask: async <Input, Output>(
      taskName: string,
      input: Input
    ): Promise<Output> => {
      // mock response, force-cast for test purposes
      return 42 as unknown as Output;
    }
  };
}

function createNonRunnableMockBackend(): ComputeBackendInterface {
  return {
    canRun: () => false,
    runTask: async <Input, Output>() => {
      throw new Error('Should not be called');
    }
  };
}

describe('HybridCompute', () => {
  test('runs task using local strategy', async () => {
    const compute = new HybridCompute({ local: createMockBackend() });

    const result = await compute.runTask(mockTaskName, mockInput, 'local');
    assert.strictEqual(result, mockOutput);
  });

  test('runs task using worker strategy', async () => {
    const compute = new HybridCompute({ worker: createMockBackend() });

    const result = await compute.runTask(mockTaskName, mockInput, 'worker');
    assert.strictEqual(result, mockOutput);
  });

  test('runs task using remote strategy', async () => {
    const compute = new HybridCompute({ remote: createMockBackend() });

    const result = await compute.runTask(mockTaskName, mockInput, 'remote');
    assert.strictEqual(result, mockOutput);
  });
  test('uses auto strategy with priority: worker > local > remote', async () => {
    const callOrder: string[] = [];

    const worker: ComputeBackendInterface = {
      canRun: () => (callOrder.push('worker'), true),
      runTask: async <Input, Output>(
        taskName: string,
        input: Input
      ): Promise<Output> => {
        callOrder.push('runWorker');
        return mockOutput as unknown as Output;
      }
    };

    const local: ComputeBackendInterface = {
      canRun: () => (callOrder.push('local'), true),
      runTask: async <Input, Output>(
        taskName: string,
        input: Input
      ): Promise<Output> => {
        callOrder.push('runLocal');
        return mockOutput as unknown as Output;
      }
    };

    const remote: ComputeBackendInterface = {
      canRun: () => (callOrder.push('remote'), true),
      runTask: async <Input, Output>(
        taskName: string,
        input: Input
      ): Promise<Output> => {
        callOrder.push('runRemote');
        return mockOutput as unknown as Output;
      }
    };

    const compute = new HybridCompute({ worker, local, remote });
    const result = await compute.runTask(mockTaskName, mockInput, 'auto');

    assert.strictEqual(result, mockOutput);
    assert.deepStrictEqual(callOrder, ['worker', 'runWorker']);
  });

  test('falls back in auto strategy if earlier backends cannot run', async () => {
    const compute = new HybridCompute({
      worker: createNonRunnableMockBackend(),
      local: createNonRunnableMockBackend(),
      remote: createMockBackend()
    });

    const result = await compute.runTask(mockTaskName, mockInput, 'auto');
    assert.strictEqual(result, mockOutput);
  });

  test('rejects when the explicit backend is not configured', async () => {
    const compute = new HybridCompute({ worker: createMockBackend() });

    await assert.rejects(
      () => compute.runTask(mockTaskName, mockInput, 'local'),
      (error: unknown) =>
        error instanceof NoBackendError &&
        error.strategy === 'local' &&
        /No local backend is configured for task 'double'/.test(error.message)
    );
  });

  test('rejects when the explicit backend cannot run the task, without running it', async () => {
    const compute = new HybridCompute({
      worker: createNonRunnableMockBackend()
    });

    await assert.rejects(
      () => compute.runTask(mockTaskName, mockInput, 'worker'),
      (error: unknown) =>
        error instanceof NoBackendError &&
        /The worker backend can't run task 'double'/.test(error.message)
    );
  });

  test('asks canRun with the task name for an explicit strategy', async () => {
    const asked: string[] = [];
    const compute = new HybridCompute({
      remote: {
        canRun: (taskName) => (asked.push(taskName), true),
        runTask: async <Input, Output>() => mockOutput as unknown as Output
      }
    });

    await compute.runTask(mockTaskName, mockInput, 'remote');
    assert.deepStrictEqual(asked, [mockTaskName]);
  });

  test('throws if no backend can run in auto strategy', async () => {
    const compute = new HybridCompute({
      worker: createNonRunnableMockBackend(),
      local: createNonRunnableMockBackend(),
      remote: createNonRunnableMockBackend()
    });

    await assert.rejects(
      () => compute.runTask(mockTaskName, mockInput, 'auto'),
      /No backend available/
    );
  });
});

describe('validating the backends', () => {
  test('throws a TypeError for something that is not an object', () => {
    for (const value of [undefined, null, 'local', 42, []]) {
      assert.throws(
        () =>
          new HybridCompute(
            value as unknown as ConstructorParameters<typeof HybridCompute>[0]
          ),
        TypeError
      );
    }
  });

  test('throws a RangeError for an unknown key, such as a typo', () => {
    assert.throws(
      () =>
        createHybridCompute({ wokrer: createMockBackend() } as unknown as {
          worker: ComputeBackendInterface;
        }),
      {
        name: 'RangeError',
        message: "Unknown backend 'wokrer'; use local, worker, remote"
      }
    );
  });

  test('throws a TypeError for a backend without canRun and runTask', () => {
    assert.throws(
      () =>
        createHybridCompute({
          worker: {} as unknown as ComputeBackendInterface
        }),
      {
        name: 'TypeError',
        message:
          'The worker backend must be an object with canRun and runTask functions'
      }
    );
  });

  test('throws a TypeError when no backend is given', () => {
    assert.throws(() => createHybridCompute({}), {
      name: 'TypeError',
      message: 'HybridCompute needs at least one backend: local, worker, remote'
    });
    assert.throws(() => createHybridCompute({ worker: undefined }), TypeError);
  });

  test('skips a backend given as undefined', async () => {
    const compute = createHybridCompute({
      worker: undefined,
      local: createMockBackend()
    });

    assert.strictEqual(
      await compute.runTask(mockTaskName, mockInput, 'auto'),
      mockOutput
    );
  });

  test('accepts class instances, whose methods live on the prototype', async () => {
    class Backend implements ComputeBackendInterface {
      canRun() {
        return true;
      }

      async runTask<Input, Output>() {
        return mockOutput as unknown as Output;
      }
    }

    const compute = createHybridCompute({ local: new Backend() });

    assert.strictEqual(
      await compute.runTask(mockTaskName, mockInput, 'local'),
      mockOutput
    );
  });

  test('keeps its own copy, so changing the options later has no effect', async () => {
    const options: { local?: ComputeBackendInterface } = {
      local: createMockBackend()
    };
    const compute = createHybridCompute(options);

    delete options.local;

    assert.strictEqual(
      await compute.runTask(mockTaskName, mockInput, 'local'),
      mockOutput
    );
  });
});

describe('validating runTask', () => {
  const compute = createHybridCompute({ local: createMockBackend() });

  test('rejects with a TypeError for a task name that is not a non-empty string', async () => {
    for (const taskName of [42, '', undefined, null]) {
      await assert.rejects(
        () => compute.runTask(taskName as unknown as string, mockInput),
        TypeError
      );
    }

    await assert.rejects(() => compute.runTask('', mockInput), {
      message: 'taskName must be a non-empty string, got an empty string'
    });
  });

  test('rejects with a TypeError for a strategy that is not a string', async () => {
    await assert.rejects(
      () =>
        compute.runTask(
          mockTaskName,
          mockInput,
          2 as unknown as ExecutionStrategyType
        ),
      { name: 'TypeError', message: 'strategy must be a string, got number' }
    );
  });

  test('rejects with a RangeError for an unknown strategy', async () => {
    for (const strategy of ['gpu', '', 'Auto', 'toString', '__proto__']) {
      await assert.rejects(
        () =>
          compute.runTask(
            mockTaskName,
            mockInput,
            strategy as ExecutionStrategyType
          ),
        RangeError,
        strategy
      );
    }

    await assert.rejects(
      () =>
        compute.runTask(
          mockTaskName,
          mockInput,
          'gpu' as ExecutionStrategyType
        ),
      { message: "Unknown strategy 'gpu'; use auto, local, worker, remote" }
    );
  });

  test('defaults to the auto strategy when none is given', async () => {
    assert.strictEqual(
      await compute.runTask(mockTaskName, mockInput),
      mockOutput
    );
  });
});

describe('NoBackendError', () => {
  test('rejects with NoBackendError, naming the task and the strategy', async () => {
    const compute = new HybridCompute({
      worker: createNonRunnableMockBackend(),
      local: createNonRunnableMockBackend()
    });

    await assert.rejects(
      () => compute.runTask(mockTaskName, mockInput, 'auto'),
      (error: unknown) => {
        assert.ok(error instanceof NoBackendError);
        assert.ok(error instanceof Error);
        assert.strictEqual(error.name, 'NoBackendError');
        assert.strictEqual(error.taskName, mockTaskName);
        assert.strictEqual(error.strategy, 'auto');
        assert.match(error.message, /double/);

        return true;
      }
    );
  });

  test('has a default message naming the task and strategy', () => {
    const error = new NoBackendError('resize', 'remote');

    assert.strictEqual(
      error.message,
      "No backend available for task 'resize' using strategy 'remote'"
    );
  });
});

describe('createHybridCompute', () => {
  test('returns HybridCompute instance', () => {
    const instance = createHybridCompute({ local: createMockBackend() });
    assert.ok(instance instanceof HybridCompute);
  });
});
