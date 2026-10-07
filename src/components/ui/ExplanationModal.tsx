'use client';

import React from 'react';
import { X, BookOpen, Lightbulb, Calculator, HelpCircle } from 'lucide-react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  whatIsIt: string;
  formula?: string;
  howCalculated: string;
  whyItMatters: string;
  example?: string;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  title,
  whatIsIt,
  formula,
  howCalculated,
  whyItMatters,
  example,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl glass-card border border-indigo-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Financial Concept Guide
              </span>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {/* What is it? */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-sm">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>What is it?</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">{whatIsIt}</p>
          </div>

          {/* Formula (if available) */}
          {formula && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-sm">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Mathematical Formula</span>
              </div>
              <div className="pl-6">
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-emerald-400 text-sm text-center">
                  {formula}
                </div>
              </div>
            </div>
          )}

          {/* How is it calculated? */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sky-300 font-semibold text-sm">
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>How is it calculated?</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">{howCalculated}</p>
          </div>

          {/* Example (if available) */}
          {example && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Practical Example</span>
              </div>
              <div className="pl-6 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/90 text-sm">
                {example}
              </div>
            </div>
          )}

          {/* Why does it matter? */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 text-purple-300 font-semibold text-sm">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <span>Why does it matter financially?</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed pl-6">{whyItMatters}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
