'use client';

import React, { useState } from 'react';
import { AnalysisResults } from '../../lib/types';
import { ExplanationModal } from '../ui/ExplanationModal';
import { AskAIHover } from '../ui/AskAIHover';
import { BookOpen, ArrowRight, ArrowLeft, Zap } from 'lucide-react';

interface Step8DiversificationProps {
  results: AnalysisResults;
  onNext: () => void;
  onBack: () => void;
  onOpenAITutor?: (metricName?: string) => void;
}

export const Step8Diversification: React.FC<Step8DiversificationProps> = ({
  results,
  onNext,
  onBack,
  onOpenAITutor,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { diversification, portfolioRisk } = results;

  const weightedRiskPct = (diversification.weightedAverageRisk * 100).toFixed(2);
  const actualRiskPct = (portfolioRisk * 100).toFixed(2);
  const reductionPct = diversification.riskReductionPercent.toFixed(1);

  const getRatingBadgeClass = (rating: string) => {
    if (rating === 'Strong') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (rating === 'Moderate') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="space-y-8 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 7 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Diversification Analysis</h2>
          <p className="text-sm text-slate-400 mt-1">
            Evaluating how asset co-movement reduces overall portfolio risk relative to individual holdings.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 font-semibold text-xs flex items-center space-x-2 shrink-0 transition-all"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Why Diversification Works</span>
        </button>
      </div>

      {/* Main Assessment Card */}
      <AskAIHover
        metricName="Diversification Benefit Rating"
        metricValue={`${diversification.rating} (-${reductionPct}%)`}
        onAskAI={onOpenAITutor}
      >
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Diversification Assessment
              </span>
              <div className="flex items-center space-x-3">
                <h3 className="text-3xl font-extrabold text-white">
                  {diversification.rating} Diversification
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getRatingBadgeClass(
                    diversification.rating
                  )}`}
                >
                  {diversification.rating} Benefit
                </span>
              </div>
            </div>

            {/* Risk Reduction Stat */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-right">
              <span className="text-xs text-emerald-400 font-semibold block">Volatility Reduction</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-300 block">
                -{reductionPct}%
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            {diversification.explanation}
          </p>
        </div>
      </AskAIHover>

      {/* Numerical Proof of Risk Reduction */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">
            Mathematical Proof: Weighted Average Risk vs. Actual Portfolio Risk
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AskAIHover
            metricName="Weighted Individual Risk"
            metricValue={`${weightedRiskPct}%`}
            onAskAI={onOpenAITutor}
          >
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 h-full">
              <span className="text-xs text-slate-400 font-medium block">
                1. Weighted Individual Risk (Σ w_i σ_i)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-200">{weightedRiskPct}%</div>
              <p className="text-[11px] text-slate-400">
                Expected volatility if assets moved in 100% perfect lockstep (+1.0 correlation).
              </p>
            </div>
          </AskAIHover>

          <AskAIHover
            metricName="Actual Portfolio Risk"
            metricValue={`${actualRiskPct}%`}
            onAskAI={onOpenAITutor}
          >
            <div className="p-5 bg-slate-900/80 border border-emerald-500/30 rounded-2xl space-y-2 h-full">
              <span className="text-xs text-emerald-400 font-medium block">
                2. Actual Portfolio Risk (σ_p)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-300">{actualRiskPct}%</div>
              <p className="text-[11px] text-slate-400">
                Actual calculated portfolio volatility including covariance terms.
              </p>
            </div>
          </AskAIHover>

          <AskAIHover
            metricName="Diversification Volatility Discount"
            metricValue={`${(parseFloat(weightedRiskPct) - parseFloat(actualRiskPct)).toFixed(2)}%`}
            onAskAI={onOpenAITutor}
          >
            <div className="p-5 bg-slate-900/80 border border-indigo-500/30 rounded-2xl space-y-2 h-full">
              <span className="text-xs text-indigo-400 font-medium block">
                3. Diversification Discount
              </span>
              <div className="text-2xl font-bold font-mono text-indigo-300">
                {(parseFloat(weightedRiskPct) - parseFloat(actualRiskPct)).toFixed(2)}%
              </div>
              <p className="text-[11px] text-slate-400">
                Exact percentage points of volatility eliminated through imperfect correlations.
              </p>
            </div>
          </AskAIHover>
        </div>
      </div>

      {/* Key Pair Extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Correlation Pair */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Highest Correlation Pair
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
              Less Diversifying
            </span>
          </div>

          {diversification.highestPair && (
            <div>
              <h4 className="text-xl font-bold text-white">
                {diversification.highestPair.stock1} ↔ {diversification.highestPair.stock2}
              </h4>
              <div className="text-2xl font-extrabold font-mono text-rose-400 mt-1">
                +{diversification.highestPair.correlation.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                These holdings move together most strongly, providing limited risk reduction when paired.
              </p>
            </div>
          )}
        </div>

        {/* Lowest Correlation Pair */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Lowest Correlation Pair
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              Most Diversifying
            </span>
          </div>

          {diversification.lowestPair && (
            <div>
              <h4 className="text-xl font-bold text-white">
                {diversification.lowestPair.stock1} ↔ {diversification.lowestPair.stock2}
              </h4>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                +{diversification.lowestPair.correlation.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                These holdings exhibit lower co-movement, serving as your portfolio&apos;s strongest diversification anchor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Educational Explanation Modal */}
      <ExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Why Diversification Works ('The Only Free Lunch in Finance')"
        whatIsIt="Diversification is the reduction of total portfolio risk achieved by combining assets whose returns do not move in perfect unison."
        formula="Risk Reduction % = [1 - (Portfolio Risk / Weighted Average Asset Risk)] × 100%"
        howCalculated="When asset correlations are less than +1.00, covariance terms dampen overall portfolio variance."
        example="If Stock A drops 4% in a period while Stock B gains 3%, their combination flattens total portfolio fluctuation."
        whyItMatters="Diversification allows investors to lower portfolio volatility WITHOUT sacrificing expected return."
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio Math</span>
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>View Final Portfolio Insights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
