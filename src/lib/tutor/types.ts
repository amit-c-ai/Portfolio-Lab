import { AnalysisResults } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metricContext?: {
    name: string;
    value?: string | number;
  };
}

export interface TutorRequestPayload {
  question: string;
  currentStepLabel: string;
  selectedMetric?: {
    name: string;
    value?: string | number;
  };
  resultsSummary: {
    stocks: { name: string; weight: number; meanReturn: number; standardDeviation: number }[];
    portfolioReturn: number;
    portfolioRisk: number;
    portfolioVariance: number;
    diversificationRating: string;
    riskReductionPercent: number;
    highestCorrPair?: string;
    lowestCorrPair?: string;
    observationCount: number;
  };
  chatHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface TutorResponsePayload {
  answer: string;
  suggestedFollowUps?: string[];
  error?: string;
}
