'use client';

import React from 'react';
import { AnalysisResults } from '../../lib/types';
import { AskAIHover } from '../ui/AskAIHover';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Bot,
  PieChart,
  Printer,
  CheckCircle2,
} from 'lucide-react';

interface Step9FinalInsightsProps {
  results: AnalysisResults;
  onReset: () => void;
  onOpenAITutor: (metricName?: string) => void;
}

export const Step9FinalInsights: React.FC<Step9FinalInsightsProps> = ({
  results,
  onReset,
  onOpenAITutor,
}) => {
  const {
    stocks,
    stockMetrics,
    portfolioReturn,
    portfolioRisk,
    diversification,
    summaryNarrative,
  } = results;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 py-4 print:py-0 print:space-y-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:hidden">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 8 of 8 — Completion
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Final Portfolio Insights & Summary</h2>
          <p className="text-sm text-slate-400 mt-1">
            Complete executive summary and deterministic financial interpretation of your entered holdings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 print:hidden">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Analysis Complete:</strong> All calculations computed deterministically in your browser.
          </span>
        </div>
        <span className="font-mono text-emerald-400 font-bold">100% Calculated</span>
      </div>

      {/* Core Executive Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AskAIHover
          metricName="Portfolio Expected Return"
          metricValue={`+${(portfolioReturn * 100).toFixed(2)}%`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 h-full">
            <span className="text-[11px] text-slate-400 font-semibold block">Expected Return</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              +{(portfolioReturn * 100).toFixed(2)}%
            </div>
          </div>
        </AskAIHover>

        <AskAIHover
          metricName="Portfolio Risk"
          metricValue={`${(portfolioRisk * 100).toFixed(2)}%`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 h-full">
            <span className="text-[11px] text-slate-400 font-semibold block">Portfolio Risk</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {(portfolioRisk * 100).toFixed(2)}%
            </div>
          </div>
        </AskAIHover>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold block">Holdings Count</span>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {stocks.length} Companies
          </div>
        </div>

        <AskAIHover
          metricName="Highest Return Stock"
          metricValue={`${highestReturnStock.name} (${(stockMetrics[highestReturnStock.id]?.meanReturn ?? 0) >= 0 ? '+' : ''}${((stockMetrics[highestReturnStock.id]?.meanReturn ?? 0) * 100).toFixed(2)}%)`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 h-full">
            <span className="text-[11px] text-slate-400 font-semibold block">Highest Return</span>
            <div className="text-sm font-bold text-white truncate">{highestReturnStock.name}</div>
            <span className="text-xs font-mono text-emerald-400">
              {(stockMetrics[highestReturnStock.id]?.meanReturn ?? 0) >= 0 ? '+' : ''}
              {((stockMetrics[highestReturnStock.id]?.meanReturn ?? 0) * 100).toFixed(2)}%
            </span>
          </div>
        </AskAIHover>

        <AskAIHover
          metricName="Highest Risk Stock"
          metricValue={`${highestRiskStock.name} (${((stockMetrics[highestRiskStock.id]?.standardDeviation ?? 0) * 100).toFixed(2)}%)`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 h-full">
            <span className="text-[11px] text-slate-400 font-semibold block">Highest Risk</span>
            <div className="text-sm font-bold text-white truncate">{highestRiskStock.name}</div>
            <span className="text-xs font-mono text-amber-400">
              {((stockMetrics[highestRiskStock.id]?.standardDeviation ?? 0) * 100).toFixed(2)}% SD
            </span>
          </div>
        </AskAIHover>

        <AskAIHover
          metricName="Best Anchor Pair"
          metricValue={diversification.lowestPair ? `${diversification.lowestPair.stock1} & ${diversification.lowestPair.stock2}` : 'N/A'}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1 h-full">
            <span className="text-[11px] text-slate-400 font-semibold block">Best Anchor Pair</span>
            <div className="text-xs font-bold text-emerald-300 truncate">
              {diversification.lowestPair
                ? `${diversification.lowestPair.stock1} & ${diversification.lowestPair.stock2}`
                : 'N/A'}
            </div>
            <span className="text-xs font-mono text-slate-400">
              Corr: {diversification.lowestPair ? diversification.lowestPair.correlation.toFixed(2) : ''}
            </span>
          </div>
        </AskAIHover>
      </div>

      {/* Written Executive Interpretation Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Financial Analysis Interpretation</h3>
            <span className="text-xs text-indigo-300 font-mono">
              Generated by deterministic rule-engine
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-900/80 p-5 rounded-2xl border border-slate-800 font-sans">
          {summaryNarrative}
        </p>
      </div>

      {/* Holdings Breakdown Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Portfolio Holdings Summary</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-2.5 px-4">Company Name</th>
                <th className="py-2.5 px-4 text-right">Target Weight</th>
                <th className="py-2.5 px-4 text-right">Mean Return</th>
                <th className="py-2.5 px-4 text-right">Std Deviation</th>
                <th className="py-2.5 px-4 text-right">Return Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {results.portfolioContributions.map((c) => {
                const m = stockMetrics[c.stockId];

                return (
                  <tr key={c.stockId} className="hover:bg-slate-900/30">
                    <td className="py-3 px-4 font-sans font-bold text-white">{c.stockName}</td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-300">
                      {(c.weight * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      +{(c.meanReturn * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">
                      {m ? (m.standardDeviation * 100).toFixed(2) : '0.00'}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      +{(c.contribution * 100).toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Tutor Callout Banner */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Have questions about these insights?</h4>
            <p className="text-xs text-slate-300">
              The upcoming AI Agent will provide conversational deep dives into your results.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAITutor('Executive Summary Insights')}
          className="px-5 py-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:bg-purple-800/60 font-semibold text-xs flex items-center space-x-2 shrink-0 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span>Open AI Agent Preview</span>
        </button>
      </div>

      {/* Financial Language & Responsibility Disclaimer */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Responsible Financial Disclaimer:</strong> Educational tool only. Historical performance does not guarantee future results. This analysis is not investment advice.
        </span>
      </div>
    </div>
  );
};
