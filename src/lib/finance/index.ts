import { AnalysisResults, PriceObservation, Stock } from '../types';
import { calculateReturns } from './returns';
import { calculateAllStockMetrics } from './statistics';
import { calculateCovarianceMatrix } from './covariance';
import { calculateCorrelationMatrix } from './correlation';
import {
  analyzeDiversification,
  calculatePortfolioReturn,
  calculatePortfolioVarianceAndRisk,
  generateSummaryNarrative,
} from './portfolio';

export * from './returns';
export * from './statistics';
export * from './covariance';
export * from './correlation';
export * from './portfolio';
export * from './validation';
export * from './sampleData';

/**
 * Runs the complete deterministic financial analysis pipeline.
 */
export function runCompleteAnalysis(
  stocks: Stock[],
  priceObservations: PriceObservation[]
): AnalysisResults {
  const stockIds = stocks.map((s) => s.id);

  // 1. Return calculations
  const returnObservations = calculateReturns(priceObservations, stockIds);

  // 2. Individual stock metrics (mean return, variance, std dev, min, max)
  const stockMetrics = calculateAllStockMetrics(stockIds, returnObservations);

  // 3. Covariance matrix
  const covarianceMatrix = calculateCovarianceMatrix(stockIds, returnObservations, stockMetrics);

  // 4. Correlation matrix
  const correlationMatrix = calculateCorrelationMatrix(stockIds, covarianceMatrix, stockMetrics);

  // 5. Portfolio expected return and contributions
  const { portfolioReturn, contributions } = calculatePortfolioReturn(stocks, stockMetrics);

  // 6. Portfolio variance and risk (standard deviation)
  const { portfolioVariance, portfolioRisk } = calculatePortfolioVarianceAndRisk(
    stocks,
    covarianceMatrix
  );

  // 7. Diversification assessment
  const diversification = analyzeDiversification(
    stocks,
    correlationMatrix,
    stockMetrics,
    portfolioRisk
  );

  // 8. Summary narrative
  const summaryNarrative = generateSummaryNarrative(
    stocks,
    stockMetrics,
    portfolioReturn,
    portfolioRisk,
    diversification
  );

  return {
    stocks,
    priceObservations,
    returnObservations,
    stockMetrics,
    covarianceMatrix,
    correlationMatrix,
    portfolioReturn,
    portfolioVariance,
    portfolioRisk,
    portfolioContributions: contributions,
    diversification,
    summaryNarrative,
  };
}
