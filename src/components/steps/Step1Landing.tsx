'use client';

import React, { useRef } from 'react';
import {
  ArrowRight,
  FolderOpen,
  Calculator,
  LineChart,
  BookOpen,
  Sparkles,
  Bot,
  ShieldCheck,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { parseExcelFileBuffer } from '../../lib/finance/excelParser';
import { Stock, PriceObservation } from '../../lib/types';

interface Step1LandingProps {
  onStartAnalysis: () => void;
  onLoadSampleData: () => void;
  onImportExcelData: (stocks: Stock[], obs: PriceObservation[]) => void;
  onOpenAITutor: () => void;
}

export const Step1Landing: React.FC<Step1LandingProps> = ({
  onStartAnalysis,
  onLoadSampleData,
  onImportExcelData,
  onOpenAITutor,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const result = parseExcelFileBuffer(buffer);

        if (result.observations.length > 0) {
          onImportExcelData(result.stocks, result.observations);
          onStartAnalysis(); // Navigate to analysis steps
        } else {
          alert('Could not parse valid price observations from file.');
        }
      } catch (err: any) {
        alert(`Error reading Excel file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Portfolio Analysis Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Understand your portfolio, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              beyond just raw returns.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Step-by-step portfolio analytics for students, investors, and finance professionals.
            Upload your Excel price data or use sample portfolios to analyze risk, correlation, and diversification.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Excel File (.xlsx)</span>
            </button>

            <button
              onClick={onStartAnalysis}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <span>Start Analysis</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onLoadSampleData}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base flex items-center justify-center space-x-2 transition-all"
            >
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <span>Load Sample Portfolio</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Visual Journey Preview Card */}
        <div className="mt-10 p-4 sm:p-6 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Analysis Roadmap & Step-by-Step Methodology
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {[
              { title: '1. Data', desc: 'Price Input' },
              { title: '2. Returns', desc: 'Periodic %' },
              { title: '3. Risk', desc: 'Std Deviation' },
              { title: '4. Correlation', desc: 'Co-movement' },
              { title: '5. Portfolio', desc: 'Return & Risk' },
              { title: '6. Insights', desc: 'Diversification' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-colors"
              >
                <div className="text-xs font-bold text-indigo-400">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Calculator className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Calculate</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Deterministic formulas for periodic returns, sample variance, standard deviation, sample covariance, Pearson correlation, and portfolio risk.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Visualize</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Interactive return trend charts, risk vs. return scatter plots, Pearson correlation heatmaps, and weight allocation breakdown charts.
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Learn</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Understand the real financial meaning behind every metric. Modal guides explain formulas, practical examples, and risk implications.
          </p>
        </div>
      </div>

      {/* AI Tutor Teaser Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Portfolio Tutor — Coming Soon</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Ask questions about your portfolio analysis</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              In V2, our financial AI agent will provide tailored explanations on why your portfolio behaves the way it does.
            </p>
          </div>

          <button
            onClick={onOpenAITutor}
            className="px-5 py-3 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:bg-purple-800/60 font-semibold text-sm flex items-center space-x-2 shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Preview AI Tutor UI</span>
          </button>
        </div>
      </div>

      {/* Financial Disclaimer Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          Educational tool only. Historical performance does not guarantee future results. This analysis is not investment advice.
        </span>
      </div>
    </div>
  );
};
