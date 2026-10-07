'use client';

import React, { useState } from 'react';
import { AnalysisResults } from '../../lib/types';
import { ExplanationModal } from '../ui/ExplanationModal';
import { AskAIHover } from '../ui/AskAIHover';
import { BookOpen, ArrowRight, ArrowLeft, GitCompare, HelpCircle, ShieldAlert } from 'lucide-react';

interface Step6CovarianceCorrProps {
  results: AnalysisResults;
  onNext: () => void;
  onBack: () => void;
  onOpenAITutor?: () => void;
}

export const Step6CovarianceCorr: React.FC<Step6CovarianceCorrProps> = ({
  results,
  onNext,
  onBack,
  onOpenAITutor,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { stocks, covarianceMatrix, correlationMatrix } = results;

  const getCorrelationColor = (val: number, isDiagonal: boolean) => {
    if (isDiagonal) {
      return 'bg-indigo-900/40 text-indigo-300 border-indigo-500/40 font-bold';
    }
    if (val >= 0.7) {
      return 'bg-rose-950/60 text-rose-300 border-rose-500/40 font-bold';
    }
    if (val >= 0.3) {
      return 'bg-amber-950/50 text-amber-300 border-amber-500/40 font-semibold';
    }
    if (val >= 0) {
      return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 font-semibold';
    }
    return 'bg-purple-950/60 text-purple-300 border-purple-500/40 font-bold';
  };

  const getCorrelationLabel = (val: number) => {
    if (val === 1) return 'Perfect Positive (Self)';
    if (val >= 0.7) return 'Strong Positive';
    if (val >= 0.3) return 'Moderate Positive';
    if (val >= 0) return 'Weak Positive';
    return 'Negative Co-movement';
  };

  return (
    <div className="space-y-8 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 5 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Covariance & Pearson Correlation</h2>
          <p className="text-sm text-slate-400 mt-1">
            Analyzing how pair-wise stock returns move together (co-movement & relationship strength).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs flex items-center space-x-2 shrink-0 transition-all"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Explain Correlation Matrix</span>
        </button>
      </div>

      {/* Pearson Correlation Heatmap */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span>Pearson Correlation Matrix Heatmap (-1.00 to +1.00)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Diagonal = 1.00</span>
        </div>

        <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          💡 <strong>Key Principle:</strong> Lower correlation between assets provides greater diversification benefit because prices do not move in lockstep.
        </p>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-center border-collapse font-mono min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-sans">
                <th className="py-3 px-4 text-left font-bold">Company Name</th>
                {stocks.map((s) => (
                  <th key={s.id} className="py-3 px-4 font-bold text-slate-200">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {stocks.map((rowStock) => (
                <tr key={rowStock.id}>
                  <td className="py-3.5 px-4 text-left font-sans font-bold text-slate-300">
                    {rowStock.name}
                  </td>
                  {stocks.map((colStock) => {
                    const corr = correlationMatrix.matrix[rowStock.id]?.[colStock.id] ?? 0;
                    const isDiag = rowStock.id === colStock.id;
                    const styleClass = getCorrelationColor(corr, isDiag);

                    return (
                      <td key={colStock.id} className="py-2.5 px-3">
                        <AskAIHover
                          metricName={`Correlation: ${rowStock.name} & ${colStock.name}`}
                          metricValue={corr.toFixed(2)}
                          onAskAI={onOpenAITutor}
                        >
                          <div
                            className={`p-3 rounded-xl border heatmap-cell ${styleClass} flex flex-col items-center justify-center space-y-0.5`}
                          >
                            <span className="text-sm font-bold">{corr.toFixed(2)}</span>
                            <span className="text-[9px] font-sans font-normal opacity-80">
                              {getCorrelationLabel(corr)}
                            </span>
                          </div>
                        </AskAIHover>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-[11px] font-medium">
          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-center">
            +1.00 Self Correlation
          </div>
          <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-center">
            0.70 to 1.00 Strong Positive
          </div>
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-center">
            0.30 to 0.70 Moderate
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-center">
            0.00 to 0.30 Weak
          </div>
          <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 text-center">
            &lt; 0 Negative Relationship
          </div>
        </div>
      </div>

      {/* Covariance Matrix Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Sample Covariance Matrix (Unscaled Co-movement)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Cov(A,B) = Cov(B,A)</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Covariance measures whether two stock return series move in the same direction.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-mono text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-2.5 px-4 text-left">Company Name</th>
                {stocks.map((s) => (
                  <th key={s.id} className="py-2.5 px-4 font-bold text-slate-300">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stocks.map((rowStock) => (
                <tr key={rowStock.id} className="hover:bg-slate-900/30">
                  <td className="py-3 px-4 text-left font-sans font-semibold text-slate-300">
                    {rowStock.name}
                  </td>
                  {stocks.map((colStock) => {
                    const cov = covarianceMatrix.matrix[rowStock.id]?.[colStock.id] ?? 0;
                    return (
                      <td key={colStock.id} className="py-3 px-4 text-slate-200">
                        <AskAIHover
                          metricName={`Covariance: ${rowStock.name} & ${colStock.name}`}
                          metricValue={cov.toFixed(6)}
                          onAskAI={onOpenAITutor}
                        >
                          <span className="p-2 rounded-lg bg-slate-900 border border-slate-800 inline-block w-full">
                            {cov.toFixed(6)}
                          </span>
                        </AskAIHover>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlation Disclaimer Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          <strong>Important Reminder:</strong> Correlation measures historical linear co-movement only.
          High correlation does NOT imply causation between two stocks.
        </span>
      </div>

      {/* Educational Explanation Modal */}
      <ExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Covariance vs. Pearson Correlation"
        whatIsIt="Covariance measures whether two assets tend to gain or lose at the same time. Correlation standardizes covariance to a fixed scale between -1.00 and +1.00."
        formula="Correlation(A,B) = Cov(A,B) / (SD_A × SD_B)"
        howCalculated="1. Compute pairwise sample covariance Cov(A,B). 2. Multiply sample standard deviation of asset A by sample standard deviation of asset B. 3. Divide Cov(A,B) by that product."
        example="If Cov(Kaynes, Larsen) = 0.0012, SD_Kaynes = 0.068, SD_Larsen = 0.052: Correlation = 0.0012 / (0.068 × 0.052) = +0.31 (Moderate Positive)."
        whyItMatters="Correlation is the core driver of portfolio diversification! Combining assets with low or negative correlations significantly reduces overall portfolio risk without sacrificing expected return."
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risk Analysis</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Analyze Portfolio Expected Return & Risk</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
