import { CorrelationMatrix, CovarianceMatrix, StockMetrics } from '../types';

/**
 * Calculates Pearson correlation between two assets:
 * Correlation(A,B) = Cov(A,B) / (SD_A * SD_B)
 */
export function calculatePearsonCorrelation(
  stockId1: string,
  stockId2: string,
  covarianceMatrix: CovarianceMatrix,
  stockMetrics: Record<string, StockMetrics>
): number {
  if (stockId1 === stockId2) {
    return 1.0;
  }

  const cov = covarianceMatrix.matrix[stockId1]?.[stockId2] ?? 0;
  const sd1 = stockMetrics[stockId1]?.standardDeviation ?? 0;
  const sd2 = stockMetrics[stockId2]?.standardDeviation ?? 0;

  if (sd1 === 0 || sd2 === 0) {
    return 0;
  }

  const corr = cov / (sd1 * sd2);

  // Clamp values strictly between -1.0 and 1.0 to guard against floating-point inaccuracies
  return Math.max(-1.0, Math.min(1.0, corr));
}

/**
 * Calculates the Pearson Correlation Matrix for all stock pairs.
 */
export function calculateCorrelationMatrix(
  stockIds: string[],
  covarianceMatrix: CovarianceMatrix,
  stockMetrics: Record<string, StockMetrics>
): CorrelationMatrix {
  const matrix: Record<string, Record<string, number>> = {};

  for (const id1 of stockIds) {
    matrix[id1] = {};
    for (const id2 of stockIds) {
      if (id1 === id2) {
        matrix[id1][id2] = 1.0;
      } else if (matrix[id2] && matrix[id2][id1] !== undefined) {
        matrix[id1][id2] = matrix[id2][id1];
      } else {
        matrix[id1][id2] = calculatePearsonCorrelation(
          id1,
          id2,
          covarianceMatrix,
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
