import { createHybridCompute } from '@hybrid-compute/core';
import { createLocalCompute } from '@hybrid-compute/local';

// A generator that yields batched chunks
function* chunk<T>(arr: T[], size: number): Generator<T[]> {
  for (let i = 0; i < arr.length; i += size) yield arr.slice(i, i + size);
}

// Task factory that creates a family of tasks parameterized by batch size
function createBatchTasks(batchSize: number) {
  return {
    name: `sumBatch/${batchSize}`,
    async run(nums: number[]): Promise<number> {
      let total = 0;

      for (const part of chunk(nums, batchSize))
        total += part.reduce((a, b) => a + b, 0);

      return total;
    }
  };
}

const local = createLocalCompute();

local.registerTask(createBatchTasks(1000)); // registers name "sumBatch/1000"

const hc = createHybridCompute({ local });
const total = await hc.runTask<number[], number>(
  'sumBatch/1000',
  Array.from({ length: 10_000 }, (_, i) => i)
);

console.log(total);
