'use client';

import React, { useState } from 'react';
import { AnalysisResults, Stock, SavedPortfolioScenario } from '../../lib/types';
import { ExplanationModal } from '../ui/ExplanationModal';
import { AskAIHover } from '../ui/AskAIHover';
import { runCompleteAnalysis } from '../../lib/finance';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  PieChart,
  Sliders,
  Save,
  Trash2,
  Scale,
  Sparkles,
} from 'lucide-react';

interface Step7PortfolioProps {
  results: AnalysisResults;
  stocks: Stock[];
  onUpdateStocks: (stocks: Stock[]) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenAITutor?: (metricName?: string) => void;
}

const COLOR_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Step7Portfolio: React.FC<Step7PortfolioProps> = ({
  results,
  stocks,
  onUpdateStocks,
  onNext,
  onBack,
  onOpenAITutor,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scenarios, setScenarios] = useState<SavedPortfolioScenario[]>([
    {
      id: 'scen-1',
      name: 'Current Allocation',
      weights: stocks.reduce((acc, s) => ({ ...acc, [s.id]: s.weight }), {}),
      expectedReturn: results.portfolioReturn,
      risk: results.portfolioRisk,
    },
  ]);

  const {
    priceObservations,
    portfolioReturn,
    portfolioVariance,
    portfolioRisk,
    portfolioContributions,
  } = results;

  const totalWeight = stocks.reduce((acc, s) => acc + (isNaN(s.weight) ? 0 : s.weight), 0);
  const roundedSum = Math.round(totalWeight * 100) / 100;
  const isWeightsValid = Math.abs(roundedSum - 100) <= 0.1;

  const handleWeightChange = (stockId: string, newWeight: number) => {
    const updatedStocks = stocks.map((s) =>
      s.id === stockId ? { ...s, weight: isNaN(newWeight) ? 0 : newWeight } : s
    );
    onUpdateStocks(updatedStocks);
  };

  const handleNormalizeWeights = () => {
    if (totalWeight === 0) return;
    const factor = 100 / totalWeight;
    const normalized = stocks.map((s) => ({
      ...s,
      weight: Math.round(s.weight * factor * 10) / 10,
    }));
    onUpdateStocks(normalized);
  };

  const handleSaveScenario = () => {
    if (scenarios.length >= 4) return;
    const name = `Portfolio ${String.fromCharCode(65 + scenarios.length)}`;
    const weights = stocks.reduce((acc, s) => ({ ...acc, [s.id]: s.weight }), {});
    const currentAnalysis = runCompleteAnalysis(stocks, priceObservations);

    setScenarios([
      ...scenarios,
      {
        id: `scen-${Date.now()}`,
        name,
        weights,
        expectedReturn: currentAnalysis.portfolioReturn,
        risk: currentAnalysis.portfolioRisk,
      },
    ]);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios(scenarios.filter((sc) => sc.id !== id));
  };

  const contributionChartData = portfolioContributions.map((c, idx) => ({
    name: c.stockName,
    contribution: parseFloat((c.contribution * 100).toFixed(2)),
    weight: (c.weight * 100).toFixed(0) + '%',
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  }));

  return (
    <div className="space-y-8 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 6 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Portfolio Analysis & Weight Tuning</h2>
          <p className="text-sm text-slate-400 mt-1">
            Interactively adjust asset weights to observe real-time impact on expected return and risk.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs flex items-center space-x-2 shrink-0 transition-all"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Explain Portfolio Math</span>
        </button>
      </div>

      {/* Main Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AskAIHover
          metricName="Portfolio Expected Return"
          metricValue={`+${(portfolioReturn * 100).toFixed(2)}%`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900 space-y-2 h-full">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Portfolio Expected Return
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-300">
              +{(portfolioReturn * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-slate-400">Weighted sum of asset mean periodic returns</p>
          </div>
        </AskAIHover>

        <AskAIHover
          metricName="Portfolio Risk (Standard Deviation)"
          metricValue={`${(portfolioRisk * 100).toFixed(2)}%`}
          onAskAI={onOpenAITutor}
        >
          <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900 space-y-2 h-full">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Portfolio Risk (Std Dev σ_p)
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-300">
              {(portfolioRisk * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-slate-400">
              Sample variance: {(portfolioVariance * 10000).toFixed(2)} (pct²)
            </p>
          </div>
        </AskAIHover>

        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900 space-y-2">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
            Allocation Status
          </span>
          <div className="flex items-center space-x-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                isWeightsValid ? 'text-indigo-300' : 'text-rose-400'
              }`}
            >
              {roundedSum}%
            </span>
            {!isWeightsValid && (
              <button
                onClick={handleNormalizeWeights}
                className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-500/30"
              >
                Normalize
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isWeightsValid ? '100% allocation confirmed' : 'Weights must equal 100%'}
          </p>
        </div>
      </div>

      {/* Interactive Weight Sliders Section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Live Portfolio Weight Controls</h3>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleNormalizeWeights}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>Balance to 100%</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-4">
          {stocks.map((stock, idx) => (
            <div
              key={stock.id}
              className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                  />
                  <span className="font-bold text-white text-sm">{stock.name}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stock.weight}
                    onChange={(e) => handleWeightChange(stock.id, parseFloat(e.target.value))}
                    className="w-20 px-2.5 py-1 rounded-lg glass-input text-xs text-center font-bold text-indigo-300"
                  />
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={stock.weight}
                onChange={(e) => handleWeightChange(stock.id, parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stock Return Contribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Return Contribution Breakdown</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-sans">
                  <th className="py-2.5 px-3">Company Name</th>
                  <th className="py-2.5 px-3 text-right">Weight</th>
                  <th className="py-2.5 px-3 text-right">Mean Return</th>
                  <th className="py-2.5 px-3 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {portfolioContributions.map((c) => (
                  <tr key={c.stockId} className="hover:bg-slate-900/30">
                    <td className="py-3 px-3 font-sans font-bold text-slate-200">{c.stockName}</td>
                    <td className="py-3 px-3 text-right text-indigo-300 font-bold">
                      {(c.weight * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {(c.meanReturn * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {c.contribution >= 0 ? '+' : ''}{(c.contribution * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 font-bold font-sans text-sm text-white">
                  <td className="py-3 px-3">Portfolio Total</td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-300">100%</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {portfolioReturn >= 0 ? '+' : ''}{(portfolioReturn * 100).toFixed(2)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Company Return Contribution Chart</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="contribution" name="Contribution (%)">
                  {contributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* What-If Portfolio Comparison */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">What-If Portfolio Comparison</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Save current weight allocation to compare risk vs. return across hypothetical portfolios.
            </p>
          </div>

          {scenarios.length < 4 && (
            <button
              onClick={handleSaveScenario}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Save Current Allocation</span>
            </button>
          )}
        </div>

        {/* Scenarios Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-3 px-4">Portfolio Scenario</th>
                <th className="py-3 px-4">Weights Breakdown</th>
                <th className="py-3 px-4 text-right">Expected Return</th>
                <th className="py-3 px-4 text-right">Portfolio Risk (SD)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-sans font-bold text-purple-300">{sc.name}</td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">
                    {stocks
                      .map((s) => `${s.name}: ${sc.weights[s.id] ?? 0}%`)
                      .join(' | ')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                    +{(sc.expectedReturn * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                    {(sc.risk * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => handleDeleteScenario(sc.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Explanation Modal */}
      <ExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Portfolio Expected Return & Portfolio Variance Math"
        whatIsIt="Portfolio expected return is simply the weighted average of individual returns."
        formula="E(R_p) = Σ (w_i × E(R_i))   │   σ²_p = w' Σ w = Σ_i Σ_j (w_i w_j Cov_ij)"
        howCalculated="For 3 assets: σ²_p = wA²σA² + wB²σB² + wC²σC² + 2wAwBCovAB + 2wAwCCovAC + 2wBwCCovBC."
        example="Because covariance terms can be small or negative, total portfolio risk σ_p is typically LOWER than weighted average individual risk!"
        whyItMatters="This non-linear risk reduction is the mathematical foundation of Modern Portfolio Theory."
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Correlation Matrix</span>
        </button>

        <button
          onClick={onNext}
          disabled={!isWeightsValid}
          className={`px-6 py-3 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all ${
            isWeightsValid
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Examine Diversification Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
