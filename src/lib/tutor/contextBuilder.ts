import { AnalysisResults } from '../types';
import { TutorRequestPayload } from './types';

export function buildTutorContextPayload(
  question: string,
  currentStepLabel: string,
  results: AnalysisResults,
  selectedMetric?: { name: string; value?: string | number },
  chatHistory?: { role: 'user' | 'assistant'; content: string }[]
): TutorRequestPayload {
  const { stocks, stockMetrics, portfolioReturn, portfolioRisk, portfolioVariance, diversification } = results;

  const stockSummary = stocks.map((s) => {
    const m = stockMetrics[s.id];
    return {
      name: s.name,
      weight: s.weight,
      meanReturn: m ? parseFloat((m.meanReturn * 100).toFixed(2)) : 0,
      standardDeviation: m ? parseFloat((m.standardDeviation * 100).toFixed(2)) : 0,
    };
  });

  const highestCorrPair = diversification.highestPair
    ? `${diversification.highestPair.stock1} & ${diversification.highestPair.stock2} (corr: ${diversification.highestPair.correlation.toFixed(2)})`
    : undefined;

  const lowestCorrPair = diversification.lowestPair
    ? `${diversification.lowestPair.stock1} & ${diversification.lowestPair.stock2} (corr: ${diversification.lowestPair.correlation.toFixed(2)})`
    : undefined;

  return {
    question,
    currentStepLabel,
    selectedMetric,
    resultsSummary: {
      stocks: stockSummary,
      portfolioReturn: parseFloat((portfolioReturn * 100).toFixed(2)),
      portfolioRisk: parseFloat((portfolioRisk * 100).toFixed(2)),
      portfolioVariance: parseFloat((portfolioVariance * 10000).toFixed(2)),
      diversificationRating: diversification.rating,
      riskReductionPercent: parseFloat(diversification.riskReductionPercent.toFixed(1)),
      highestCorrPair,
      lowestCorrPair,
      observationCount: results.priceObservations.length,
    },
    chatHistory,
  };
}
