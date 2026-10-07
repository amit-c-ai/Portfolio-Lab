import {
  CorrelationMatrix,
  CovarianceMatrix,
  DiversificationAnalysis,
  PortfolioContribution,
  Stock,
  StockMetrics,
} from '../types';

/**
 * Calculates Portfolio Expected Return.
 * Formula: E(R_p) = Σ (w_i * E(R_i))
 */
export function calculatePortfolioReturn(
  stocks: Stock[],
  stockMetrics: Record<string, StockMetrics>
): { portfolioReturn: number; contributions: PortfolioContribution[] } {
  let portfolioReturn = 0;
  const contributions: PortfolioContribution[] = [];

  for (const stock of stocks) {
    const weightDecimal = stock.weight / 100;
    const meanReturn = stockMetrics[stock.id]?.meanReturn ?? 0;
    const contribution = weightDecimal * meanReturn;

    portfolioReturn += contribution;

    contributions.push({
      stockId: stock.id,
      stockName: stock.name,
      weight: weightDecimal,
      meanReturn,
      contribution,
    });
  }

  return { portfolioReturn, contributions };
}

/**
 * Calculates Portfolio Variance and Portfolio Risk (Standard Deviation).
 * General matrix formula: σ²_p = w' Σ w = Σ_i Σ_j w_i w_j Cov(i, j)
 */
export function calculatePortfolioVarianceAndRisk(
  stocks: Stock[],
  covarianceMatrix: CovarianceMatrix
): { portfolioVariance: number; portfolioRisk: number } {
  let portfolioVariance = 0;

  for (let i = 0; i < stocks.length; i++) {
    const s1 = stocks[i];
    const w1 = s1.weight / 100;

    for (let j = 0; j < stocks.length; j++) {
      const s2 = stocks[j];
      const w2 = s2.weight / 100;

      const cov = covarianceMatrix.matrix[s1.id]?.[s2.id] ?? 0;
      portfolioVariance += w1 * w2 * cov;
    }
  }

  // Ensure non-negative due to potential floating point errors
  portfolioVariance = Math.max(0, portfolioVariance);
  const portfolioRisk = Math.sqrt(portfolioVariance);

  return { portfolioVariance, portfolioRisk };
}

/**
 * Evaluates diversification metrics, highest/lowest correlation pairs,
 * weighted average individual risk vs actual portfolio risk.
 */
export function analyzeDiversification(
  stocks: Stock[],
  correlationMatrix: CorrelationMatrix,
  stockMetrics: Record<string, StockMetrics>,
  portfolioRisk: number
): DiversificationAnalysis {
  let highestPair: { stock1: string; stock2: string; correlation: number } | null = null;
  let lowestPair: { stock1: string; stock2: string; correlation: number } | null = null;
  let totalPairs = 0;
  let sumCorrelation = 0;

  for (let i = 0; i < stocks.length; i++) {
    for (let j = i + 1; j < stocks.length; j++) {
      const s1 = stocks[i];
      const s2 = stocks[j];
      const corr = correlationMatrix.matrix[s1.id]?.[s2.id] ?? 0;

      sumCorrelation += corr;
      totalPairs++;

      if (!highestPair || corr > highestPair.correlation) {
        highestPair = { stock1: s1.name, stock2: s2.name, correlation: corr };
      }
      if (!lowestPair || corr < lowestPair.correlation) {
        lowestPair = { stock1: s1.name, stock2: s2.name, correlation: corr };
      }
    }
  }

  const avgCorrelation = totalPairs > 0 ? sumCorrelation / totalPairs : 1.0;

  // Weighted average of individual asset standard deviations
  let weightedAverageRisk = 0;
  for (const stock of stocks) {
    const w = stock.weight / 100;
    const sd = stockMetrics[stock.id]?.standardDeviation ?? 0;
    weightedAverageRisk += w * sd;
  }

  // Risk reduction percent: how much risk is reduced by diversification compared to weighted average
  let riskReductionPercent = 0;
  if (weightedAverageRisk > 0) {
    riskReductionPercent = Math.max(0, (1 - portfolioRisk / weightedAverageRisk) * 100);
  }

  // Qualitative rating based on correlation and risk reduction
  let rating: 'Strong' | 'Moderate' | 'Limited' = 'Moderate';
  if (avgCorrelation < 0.35 || riskReductionPercent > 15) {
    rating = 'Strong';
  } else if (avgCorrelation > 0.70 && riskReductionPercent < 5) {
    rating = 'Limited';
  } else {
    rating = 'Moderate';
  }

  let explanation = '';
  if (rating === 'Strong') {
    explanation = `Your holdings have low or modest co-movement (average correlation ${avgCorrelation.toFixed(2)}). Diversification effectively reduced your portfolio risk by ${riskReductionPercent.toFixed(1)}% relative to individual asset volatility.`;
  } else if (rating === 'Moderate') {
    explanation = `Your portfolio exhibits moderate diversification benefits (average correlation ${avgCorrelation.toFixed(2)}). Portfolio risk is reduced by ${riskReductionPercent.toFixed(1)}% compared to holding assets in isolation.`;
  } else {
    explanation = `High positive correlations across holdings (average correlation ${avgCorrelation.toFixed(2)}) limit diversification benefits. Assets tend to move together during market shifts.`;
  }

  return {
    rating,
    highestPair,
    lowestPair,
    weightedAverageRisk,
    riskReductionPercent,
    explanation,
  };
}

/**
 * Generates a deterministic written interpretation narrative from calculated numbers.
 */
export function generateSummaryNarrative(
  stocks: Stock[],
  stockMetrics: Record<string, StockMetrics>,
  portfolioReturn: number,
  portfolioRisk: number,
  diversification: DiversificationAnalysis
): string {
  if (stocks.length === 0) return '';

  let highestReturnStock = stocks[0];
  let highestRiskStock = stocks[0];

  for (const s of stocks) {
    const mCurrent = stockMetrics[s.id];
    const mHighRet = stockMetrics[highestReturnStock.id];
    const mHighRisk = stockMetrics[highestRiskStock.id];

    if (mCurrent && mHighRet && mCurrent.meanReturn > mHighRet.meanReturn) {
      highestReturnStock = s;
    }
    if (mCurrent && mHighRisk && mCurrent.standardDeviation > mHighRisk.standardDeviation) {
      highestRiskStock = s;
    }
  }

  const retPct = (portfolioReturn * 100).toFixed(2);
  const riskPct = (portfolioRisk * 100).toFixed(2);
  const highRetName = highestReturnStock.name;
  const highRetPct = ((stockMetrics[highestReturnStock.id]?.meanReturn ?? 0) * 100).toFixed(2);
  const highRiskName = highestRiskStock.name;
  const highRiskPct = ((stockMetrics[highestRiskStock.id]?.standardDeviation ?? 0) * 100).toFixed(2);

  let narrative = `Based on your historical price observations, your portfolio achieves an expected periodic return of ${retPct}% with a portfolio volatility (standard deviation) of ${riskPct}%. `;
  narrative += `${highRetName} delivered the highest historical mean return (${highRetPct}% per period), while ${highRiskName} displayed the highest individual risk (${highRiskPct}% standard deviation). `;

  if (diversification.lowestPair) {
    const pairName = `${diversification.lowestPair.stock1} & ${diversification.lowestPair.stock2}`;
    const corrVal = diversification.lowestPair.correlation.toFixed(2);
    narrative += `The asset pair with the lowest co-movement is ${pairName} (correlation ${corrVal}), providing key diversification support. `;
  }

  narrative += diversification.explanation;

  return narrative;
}
