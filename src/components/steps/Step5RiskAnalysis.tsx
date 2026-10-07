'use client';

import React, { useState } from 'react';
import { AnalysisResults } from '../../lib/types';
import { ExplanationModal } from '../ui/ExplanationModal';
import { AskAIHover } from '../ui/AskAIHover';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BookOpen, ArrowRight, ArrowLeft, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

interface Step5RiskAnalysisProps {
  results: AnalysisResults;
  onNext: () => void;
  onBack: () => void;
  onOpenAITutor?: () => void;
}

const COLOR_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Step5RiskAnalysis: React.FC<Step5RiskAnalysisProps> = ({
  results,
  onNext,
  onBack,
  onOpenAITutor,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { stocks, stockMetrics } = results;

  const scatterData = stocks.map((s, idx) => {
    const m = stockMetrics[s.id];
    return {
      name: s.name,
      x: m ? parseFloat((m.standardDeviation * 100).toFixed(2)) : 0,
      y: m ? parseFloat((m.meanReturn * 100).toFixed(2)) : 0,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    };
  });

  return (
    <div className="space-y-8 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 4 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Individual Stock Risk & Return</h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyzing expected return against sample volatility (standard deviation) for each holding.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs flex items-center space-x-2 shrink-0 transition-all"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Explain Variance & SD</span>
        </button>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock, idx) => {
          const m = stockMetrics[stock.id];
          if (!m) return null;

          const meanPct = (m.meanReturn * 100).toFixed(2);
          const sdPct = (m.standardDeviation * 100).toFixed(2);
          const varPct = (m.variance * 10000).toFixed(2);
          const minPct = (m.minReturn * 100).toFixed(2);
          const maxPct = (m.maxReturn * 100).toFixed(2);

          return (
            <AskAIHover
              key={stock.id}
              metricName={`${stock.name} Risk & Return`}
              metricValue={`Return: ${meanPct}%, SD: ${sdPct}%`}
              onAskAI={onOpenAITutor}
            >
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden h-full">
                <div
                  className="absolute top-0 right-0 w-2 h-full"
                  style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{stock.name}</h3>
                    <span className="text-xs font-mono text-indigo-400">
                      Weight: {stock.weight}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                {/* Main Metrics Comparison */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block">Average Return</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                      {m.meanReturn >= 0 ? '+' : ''}
                      {meanPct}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block">Risk (Std Dev)</span>
                    <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                      {sdPct}%
                    </span>
                  </div>
                </div>

                {/* Extra Stats */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>Sample Variance (σ²):</span>
                    <span className="font-mono font-semibold text-slate-200">{varPct} (pct²)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Best Period Return:</span>
                    <span className="font-mono font-semibold text-emerald-400">+{maxPct}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Worst Period Return:</span>
                    <span className="font-mono font-semibold text-rose-400">{minPct}%</span>
                  </div>
                </div>
              </div>
            </AskAIHover>
          );
        })}
      </div>

      {/* Return vs Risk Scatter Plot */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-400" />
            <span>Risk vs. Return Scatter Plot</span>
          </h3>
          <span className="text-xs text-slate-400">
            X-Axis: Volatility (Std Dev) • Y-Axis: Mean Return
          </span>
        </div>

        <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          💡 <strong>Interpretation:</strong> Stocks further to the right have higher historical volatility.
          Stocks higher on the chart achieved higher historical average returns.
        </p>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="x"
                name="Risk (Standard Deviation)"
                unit="%"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Average Return"
                unit="%"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white text-sm">{data.name}</div>
                        <div className="text-amber-300">Risk (Std Dev): {data.x}%</div>
                        <div className="text-emerald-300">Mean Return: {data.y}%</div>
                        <div className="text-[10px] text-purple-300 pt-1">✨ Click AI Tutor to analyze</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Stocks" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} r={8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conceptual Calculation Flow Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Step-by-Step Risk Calculation Flow</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
          {[
            { step: '1', title: 'Mean Return', desc: 'Average period return (R_bar)' },
            { step: '2', title: 'Deviations', desc: 'R_i - R_bar for each period' },
            { step: '3', title: 'Squared Devs', desc: '(R_i - R_bar)²' },
            { step: '4', title: 'Sum & Divide', desc: 'Σ(Devs)² / (n - 1)' },
            { step: '5', title: 'Sample Variance', desc: 'Var(R)' },
            { step: '6', title: 'Square Root', desc: 'SD = √Var(R)' },
          ].map((item, idx) => (
            <AskAIHover
              key={idx}
              metricName={`Step ${item.step}: ${item.title}`}
              metricValue={item.desc}
              onAskAI={onOpenAITutor}
            >
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all h-full cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold mx-auto flex items-center justify-center text-[10px] mb-1">
                  {item.step}
                </div>
                <div className="font-bold text-slate-200">{item.title}</div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">{item.desc}</div>
              </div>
            </AskAIHover>
          ))}
        </div>
      </div>

      {/* Educational Explanation Modal */}
      <ExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Variance & Standard Deviation"
        whatIsIt="Standard deviation measures how much an asset's periodic returns fluctuate around its average return."
        formula="Sample Var = Σ(R_i - R_mean)² / (n - 1)   │   Sample SD = √Var"
        howCalculated="1. Find mean return. 2. Subtract mean from each periodic return. 3. Square each difference. 4. Sum squares and divide by (n - 1). 5. Take square root."
        example="If a stock's sample variance is 0.0046, its sample standard deviation is √0.0046 = 0.0678 or 6.78% per period."
        whyItMatters="Standard deviation is the foundational benchmark for investment risk in modern finance."
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Periodic Returns</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Examine Covariance & Correlation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
