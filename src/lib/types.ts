export interface Stock {
  id: string;
  name: string;
  ticker?: string;
  weight: number; // User weight percentage (0-100)
}

export interface PriceObservation {
  date: string;
  prices: Record<string, number>; // stockId -> price number
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReturnObservation {
  date: string; // The period date corresponding to Price_t
  returns: Record<string, number>; // stockId -> periodic decimal return (e.g. 0.0317 for 3.17%)
}

export interface StockMetrics {
  stockId: string;
  meanReturn: number;        // decimal periodic return
  variance: number;          // sample variance
  standardDeviation: number;  // sample std dev
  minReturn: number;
  maxReturn: number;
}

export interface PortfolioContribution {
  stockId: string;
  stockName: string;
  weight: number;      // decimal (e.g. 0.40)
  meanReturn: number;  // decimal
  contribution: number;// weight * meanReturn
}

export interface CovarianceMatrix {
  stockIds: string[];
  matrix: Record<string, Record<string, number>>;
}

export interface CorrelationMatrix {
  stockIds: string[];
  matrix: Record<string, Record<string, number>>;
}

export interface SavedPortfolioScenario {
  id: string;
  name: string;
  weights: Record<string, number>; // stockId -> weight percentage 0-100
  expectedReturn: number;
  risk: number;
}

export interface DiversificationAnalysis {
  rating: 'Strong' | 'Moderate' | 'Limited';
  highestPair: { stock1: string; stock2: string; correlation: number } | null;
  lowestPair: { stock1: string; stock2: string; correlation: number } | null;
  weightedAverageRisk: number;
  riskReductionPercent: number;
  explanation: string;
}

export interface AnalysisResults {
  stocks: Stock[];
  priceObservations: PriceObservation[];
  returnObservations: ReturnObservation[];
  stockMetrics: Record<string, StockMetrics>;
  covarianceMatrix: CovarianceMatrix;
  correlationMatrix: CorrelationMatrix;
  portfolioReturn: number;
  portfolioVariance: number;
  portfolioRisk: number;
  portfolioContributions: PortfolioContribution[];
  diversification: DiversificationAnalysis;
  summaryNarrative: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
