'use client';

import React from 'react';
import {
  Home,
  Sliders,
  Table,
  TrendingUp,
  ShieldAlert,
  GitCompare,
  PieChart,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface StepItem {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const STEPS: StepItem[] = [
  { id: 1, key: 'landing', label: 'Overview', shortLabel: 'Home', icon: Home },
  { id: 2, key: 'setup', label: 'Portfolio Setup', shortLabel: 'Setup', icon: Sliders },
  { id: 3, key: 'data', label: 'Price Input', shortLabel: 'Data', icon: Table },
  { id: 4, key: 'returns', label: 'Returns', shortLabel: 'Returns', icon: TrendingUp },
  { id: 5, key: 'risk', label: 'Risk Analysis', shortLabel: 'Risk', icon: ShieldAlert },
  { id: 6, key: 'relationship', label: 'Correlation', shortLabel: 'Correlation', icon: GitCompare },
  { id: 7, key: 'portfolio', label: 'Portfolio', shortLabel: 'Portfolio', icon: PieChart },
  { id: 8, key: 'diversification', label: 'Diversification', shortLabel: 'Diversify', icon: Layers },
  { id: 9, key: 'insights', label: 'Final Insights', shortLabel: 'Insights', icon: Sparkles },
];

interface StepNavigatorProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  maxCompletedStep: number;
}

export const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  onSelectStep,
  maxCompletedStep,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3 overflow-x-auto scrollbar-none pr-8 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mr-2 hidden md:inline-block border-r border-slate-800 pr-3 shrink-0">
            Portfolio Analysis
          </span>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = step.id < currentStep || step.id <= maxCompletedStep;
            const isSelectable = step.id <= maxCompletedStep || step.id <= currentStep + 1;

            return (
              <button
                key={step.id}
                onClick={() => isSelectable && onSelectStep(step.id)}
                disabled={!isSelectable}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : isCompleted
                    ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white'
                    : isSelectable
                    ? 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    : 'bg-slate-950/20 text-slate-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center">
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 mr-1 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  )}
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
