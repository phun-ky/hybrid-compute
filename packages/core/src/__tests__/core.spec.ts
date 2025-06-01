import test, { describe } from 'node:test';
import assert from 'node:assert';
import {
  ComputeBackendInterface,
  createHybridCompute,
  HybridCompute
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
      // mock response — force-cast for test purposes
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
      worker: createMockBackend(),
      local: createMockBackend(),
      remote: createMockBackend()
    });

    const result = await compute.runTask(mockTaskName, mockInput, 'auto');
    assert.strictEqual(result, mockOutput);
  });

  test('throws if no backend matches the strategy', async () => {
    const compute = new HybridCompute({});

    await assert.rejects(
      () => compute.runTask(mockTaskName, mockInput, 'local'),
      /No backend available/
    );
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

describe('createHybridCompute', () => {
  test('returns HybridCompute instance', () => {
    const instance = createHybridCompute({ local: createMockBackend() });
    assert.ok(instance instanceof HybridCompute);
  });
});
