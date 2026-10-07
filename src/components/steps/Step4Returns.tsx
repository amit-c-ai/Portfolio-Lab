'use client';

import React, { useState } from 'react';
import { AnalysisResults } from '../../lib/types';
import { ExplanationModal } from '../ui/ExplanationModal';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BookOpen, ArrowRight, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Step4ReturnsProps {
  results: AnalysisResults;
  onNext: () => void;
  onBack: () => void;
}

const COLOR_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Step4Returns: React.FC<Step4ReturnsProps> = ({ results, onNext, onBack }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { stocks, returnObservations } = results;

  // Chart data format: { date: string, stock1: percentage, stock2: percentage... }
  const chartData = returnObservations.map((obs) => {
    const item: Record<string, string | number> = { date: obs.date };
    stocks.forEach((s) => {
      const val = obs.returns[s.id] ?? 0;
      item[s.name] = parseFloat((val * 100).toFixed(2));
    });
    return item;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 3 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Periodic Return Calculation</h2>
          <p className="text-sm text-slate-400 mt-1">
            Converted raw prices into percentage returns to normalize asset comparison.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs flex items-center space-x-2 shrink-0 transition-all"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Explain this calculation</span>
        </button>
      </div>

      {/* Time Series Return Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Periodic Returns Over Time (%)</span>
          </h3>
          <span className="text-xs text-slate-400">Total Periods: {returnObservations.length}</span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="%"
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${Number(value) >= 0 ? '+' : ''}${value}%`, 'Return']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              {stocks.map((stock, idx) => (
                <Line
                  key={stock.id}
                  type="monotone"
                  dataKey={stock.name}
                  stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calculated Periodic Returns Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Periodic Returns Table (%)
          </h3>
          <span className="text-xs text-slate-400">
            Formula: Return_t = (Price_t - Price_t-1) / Price_t-1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Period</th>
                {stocks.map((stock) => (
                  <th key={stock.id} className="py-3 px-4 text-right">
                    {stock.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {returnObservations.map((obs, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-sans text-slate-300 font-medium">{obs.date}</td>
                  {stocks.map((stock) => {
                    const retVal = obs.returns[stock.id] ?? 0;
                    const isPos = retVal >= 0;
                    return (
                      <td key={stock.id} className="py-3 px-4 text-right font-bold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                            isPos
                              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20'
                              : 'text-rose-400 bg-rose-950/40 border border-rose-500/20'
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {isPos ? '+' : ''}
                          {(retVal * 100).toFixed(2)}%
                        </span>
                      </td>
                    );
                  })}
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
        title="What are Periodic Returns?"
        whatIsIt="Periodic returns measure the percentage gain or loss generated by an investment over a specific timeframe (such as monthly or daily)."
        formula="Return_t = (Price_t - Price_t-1) / Price_t-1"
        howCalculated="We subtract the previous period's price from the current price, then divide by the previous period's price."
        example="If Reliance was ₹1,420 in Jan and ₹1,465 in Feb: (1465 - 1420) / 1420 = +3.17% return."
        whyItMatters="We use percentage returns instead of raw dollar/rupee prices because returns normalize assets, allowing you to compare a ₹4,000 stock directly against a ₹100 stock on equal footing."
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Data Input</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Analyze Individual Stock Risk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
