'use client';

import React, { useRef } from 'react';
import { FlaskConical, RotateCcw, Sparkles, FolderOpen, Upload } from 'lucide-react';
import { parseExcelFileBuffer } from '../../lib/finance/excelParser';
import { Stock, PriceObservation } from '../../lib/types';

interface HeaderProps {
  onLoadSampleData: () => void;
  onImportExcelData?: (stocks: Stock[], obs: PriceObservation[]) => void;
  onReset: () => void;
  onOpenAITutor: (initialQuestion?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSampleData,
  onImportExcelData,
  onReset,
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

        if (result.observations.length > 0 && onImportExcelData) {
          onImportExcelData(result.stocks, result.observations);
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
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Portfolio Analysis</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                V1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Understand your portfolio, one calculation at a time.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            title="Upload Excel file (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Excel</span>
            <span className="sm:hidden">Upload</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={onLoadSampleData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
            title="Load illustrative sample dataset"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Sample Data</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* AI Agent Button */}
          <button
            onClick={() => onOpenAITutor()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 border border-purple-500/40 text-purple-200 hover:border-purple-400 hover:shadow-indigo-500/20 transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Ask AI Agent</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded uppercase tracking-wider">
              LIVE
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
