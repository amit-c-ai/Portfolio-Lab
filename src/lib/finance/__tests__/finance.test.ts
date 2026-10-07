import { describe, expect, test } from 'vitest';
import { Stock, PriceObservation } from '../../types';
import { calculateReturns } from '../returns';
import { calculateStockMetrics } from '../statistics';
import { calculateSampleCovariance, calculateCovarianceMatrix } from '../covariance';
import { calculatePearsonCorrelation, calculateCorrelationMatrix } from '../correlation';
import { calculatePortfolioReturn, calculatePortfolioVarianceAndRisk } from '../portfolio';

describe('Financial Engine Math Verification', () => {
  const mockStocks: Stock[] = [
    { id: 'stockA', name: 'Stock A', weight: 60 },
    { id: 'stockB', name: 'Stock B', weight: 40 },
  ];

  const mockPrices: PriceObservation[] = [
    { date: 'P1', prices: { stockA: 100, stockB: 200 } },
    { date: 'P2', prices: { stockA: 110, stockB: 210 } }, // stockA +10%, stockB +5%
    { date: 'P3', prices: { stockA: 104.5, stockB: 199.5 } }, // stockA -5%, stockB -5%
  ];

  test('1. Periodic Return Calculation', () => {
    const returns = calculateReturns(mockPrices, ['stockA', 'stockB']);
    expect(returns).toHaveLength(2);

    // P2: Stock A (110 - 100)/100 = 0.10
    expect(returns[0].returns.stockA).toBeCloseTo(0.10, 4);
    // P2: Stock B (210 - 200)/200 = 0.05
    expect(returns[0].returns.stockB).toBeCloseTo(0.05, 4);

    // P3: Stock A (104.5 - 110)/110 = -0.05
    expect(returns[1].returns.stockA).toBeCloseTo(-0.05, 4);
    // P3: Stock B (199.5 - 210)/210 = -0.05
    expect(returns[1].returns.stockB).toBeCloseTo(-0.05, 4);
  });

  test('2. Mean, Sample Variance, and Standard Deviation', () => {
    const returns = calculateReturns(mockPrices, ['stockA', 'stockB']);
    const metricsA = calculateStockMetrics('stockA', returns);

    // Stock A returns: [0.10, -0.05]
    // Mean = (0.10 + -0.05) / 2 = 0.025 (2.5%)
    expect(metricsA.meanReturn).toBeCloseTo(0.025, 4);

    // Deviations from mean:
    // (0.10 - 0.025)^2 = 0.075^2 = 0.005625
    // (-0.05 - 0.025)^2 = (-0.075)^2 = 0.005625
    // Sum sq dev = 0.01125
    // Sample Variance (n-1 = 1) = 0.01125 / 1 = 0.01125
    expect(metricsA.variance).toBeCloseTo(0.01125, 6);

    // Standard Deviation = sqrt(0.01125) ≈ 0.106066
    expect(metricsA.standardDeviation).toBeCloseTo(Math.sqrt(0.01125), 6);
  });

  test('3. Sample Covariance and Pearson Correlation', () => {
    const returns = calculateReturns(mockPrices, ['stockA', 'stockB']);
    const metricsA = calculateStockMetrics('stockA', returns);
    const metricsB = calculateStockMetrics('stockB', returns);
    const metricsMap = { stockA: metricsA, stockB: metricsB };

    // Stock B returns: [0.05, -0.05] -> Mean = 0
    // Stock A returns: [0.10, -0.05] -> Mean = 0.025
    // Dev A: [0.075, -0.075]
    // Dev B: [0.05, -0.05]
    // Product dev: [0.075*0.05, (-0.075)*(-0.05)] = [0.00375, 0.00375]
    // Sum = 0.0075
    // Sample Covariance (n-1 = 1) = 0.0075 / 1 = 0.0075
    const covAB = calculateSampleCovariance('stockA', 'stockB', returns, metricsMap);
    expect(covAB).toBeCloseTo(0.0075, 6);

    const covMatrix = calculateCovarianceMatrix(['stockA', 'stockB'], returns, metricsMap);
    expect(covMatrix.matrix.stockA.stockB).toBeCloseTo(0.0075, 6);

    // Pearson Correlation = Cov(A,B) / (SD_A * SD_B)
    const corrAB = calculatePearsonCorrelation('stockA', 'stockB', covMatrix, metricsMap);
    const expectedCorr = 0.0075 / (metricsA.standardDeviation * metricsB.standardDeviation);
    expect(corrAB).toBeCloseTo(expectedCorr, 6);
  });

  test('4. Portfolio Expected Return and Portfolio Risk', () => {
    const returns = calculateReturns(mockPrices, ['stockA', 'stockB']);
    const metricsA = calculateStockMetrics('stockA', returns);
    const metricsB = calculateStockMetrics('stockB', returns);
    const metricsMap = { stockA: metricsA, stockB: metricsB };
    const covMatrix = calculateCovarianceMatrix(['stockA', 'stockB'], returns, metricsMap);

    const { portfolioReturn } = calculatePortfolioReturn(mockStocks, metricsMap);
    // wA = 0.60, wB = 0.40
    // E(Rp) = 0.60 * 0.025 + 0.40 * 0 = 0.015 (1.5%)
    expect(portfolioReturn).toBeCloseTo(0.015, 4);

    const { portfolioVariance, portfolioRisk } = calculatePortfolioVarianceAndRisk(
      mockStocks,
      covMatrix
    );
    // σ²p = wA^2 * VarA + wB^2 * VarB + 2 * wA * wB * CovAB
    // wA^2 * VarA = 0.36 * 0.01125 = 0.00405
    // VarB (returns [0.05, -0.05], mean 0): ((0.05)^2 + (-0.05)^2)/1 = 0.005
    // wB^2 * VarB = 0.16 * 0.005 = 0.0008
    // 2 * 0.6 * 0.4 * 0.0075 = 0.0036
    // Total Variance = 0.00405 + 0.0008 + 0.0036 = 0.00845
    expect(portfolioVariance).toBeCloseTo(0.00845, 6);
    expect(portfolioRisk).toBeCloseTo(Math.sqrt(0.00845), 6);
  });
});
