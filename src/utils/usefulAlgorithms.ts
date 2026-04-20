export type Batch = {
  amount: number;
};

export function calculateAmountOfFullBatches(batch: Batch, batchSize: number) {
  return Math.floor(batch.amount / batchSize);
}

export function calculateSizeOfIncompleteBatch(batch: Batch, batchSize: number) {
  return batch.amount % batchSize;
}

export function splitBatchIntoAmounts(batch: Batch, batchSize: number): number[] {
  const fullBatchesCount = calculateAmountOfFullBatches(batch, batchSize);
  const incompleteBatchSize = calculateSizeOfIncompleteBatch(batch, batchSize);
  const fullBatches = Array.from({ length: fullBatchesCount }, () => batchSize);

  if (incompleteBatchSize === 0) {
    return fullBatches;
  }

  return [...fullBatches, incompleteBatchSize];
}
