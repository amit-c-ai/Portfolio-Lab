import { CovarianceMatrix, ReturnObservation, StockMetrics } from '../types';

/**
 * Calculates sample covariance between two stocks.
 * Formula: Cov(A,B) = Σ[(R_A,i - mean_A) * (R_B,i - mean_B)] / (n - 1)
 */
export function calculateSampleCovariance(
  stockId1: string,
  stockId2: string,
  returnObs: ReturnObservation[],
  stockMetrics: Record<string, StockMetrics>
): number {
  const mean1 = stockMetrics[stockId1]?.meanReturn ?? 0;
  const mean2 = stockMetrics[stockId2]?.meanReturn ?? 0;

  const validPairs = returnObs
    .map((obs) => ({
      r1: obs.returns[stockId1],
      r2: obs.returns[stockId2],
    }))
    .filter(
      (pair) =>
        pair.r1 !== undefined &&
        pair.r2 !== undefined &&
        !isNaN(pair.r1) &&
        !isNaN(pair.r2)
    );

  const n = validPairs.length;
  if (n <= 1) return 0;

  let sumProductDeviations = 0;
  for (const pair of validPairs) {
    sumProductDeviations += (pair.r1 - mean1) * (pair.r2 - mean2);
  }

  return sumProductDeviations / (n - 1);
}

/**
 * Calculates the complete sample covariance matrix for all stocks.
 */
export function calculateCovarianceMatrix(
  stockIds: string[],
  returnObs: ReturnObservation[],
  stockMetrics: Record<string, StockMetrics>
): CovarianceMatrix {
  const matrix: Record<string, Record<string, number>> = {};

  for (const id1 of stockIds) {
    matrix[id1] = {};
    for (const id2 of stockIds) {
      if (matrix[id2] && matrix[id2][id1] !== undefined) {
        // Symmetry property: Cov(A,B) = Cov(B,A)
        matrix[id1][id2] = matrix[id2][id1];
      } else {
        matrix[id1][id2] = calculateSampleCovariance(
          id1,
          id2,
          returnObs,
          stockMetrics
        );
      }
    }
  }

  return {
    stockIds,
    matrix,
  };
}
