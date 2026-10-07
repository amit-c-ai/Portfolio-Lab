import { ReturnObservation, StockMetrics } from '../types';

/**
 * Calculates mean, sample variance, sample standard deviation, min, and max returns for a stock.
 */
export function calculateStockMetrics(
  stockId: string,
  returnObs: ReturnObservation[]
): StockMetrics {
  const returns = returnObs
    .map((obs) => obs.returns[stockId])
    .filter((r) => r !== undefined && !isNaN(r));

  const n = returns.length;

  if (n === 0) {
    return {
      stockId,
      meanReturn: 0,
      variance: 0,
      standardDeviation: 0,
      minReturn: 0,
      maxReturn: 0,
    };
  }

  // Mean periodic return
  const sum = returns.reduce((acc, val) => acc + val, 0);
  const meanReturn = sum / n;

  // Min and Max return
  const minReturn = Math.min(...returns);
  const maxReturn = Math.max(...returns);

  // Sample variance (n - 1 denominator)
  let variance = 0;
  if (n > 1) {
    const sumSquaredDeviations = returns.reduce(
      (acc, val) => acc + Math.pow(val - meanReturn, 2),
      0
    );
    variance = sumSquaredDeviations / (n - 1);
  } else {
    variance = 0;
  }

  // Sample standard deviation
  const standardDeviation = Math.sqrt(variance);

  return {
    stockId,
    meanReturn,
    variance,
    standardDeviation,
    minReturn,
    maxReturn,
  };
}

/**
 * Calculates metrics for all stocks given return observations.
 */
export function calculateAllStockMetrics(
  stockIds: string[],
  returnObs: ReturnObservation[]
): Record<string, StockMetrics> {
  const result: Record<string, StockMetrics> = {};
  for (const stockId of stockIds) {
    result[stockId] = calculateStockMetrics(stockId, returnObs);
  }
  return result;
}
