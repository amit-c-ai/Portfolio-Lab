'use client';

import React, { useState, useRef } from 'react';
import { PriceObservation, Stock, Frequency } from '../../lib/types';
import { validatePriceObservations } from '../../lib/finance/validation';
import {
  parseExcelFileBuffer,
  parsePastedExcelText,
} from '../../lib/finance/excelParser';
import {
  Plus,
  Trash2,
  FolderOpen,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Clipboard,
  Eraser,
  ArrowRight,
  ArrowLeft,
  Info,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Edit2,
} from 'lucide-react';

interface Step3DataInputProps {
  stocks: Stock[];
  observations: PriceObservation[];
  frequency: Frequency;
  onUpdateObservations: (obs: PriceObservation[]) => void;
  onUpdateStocks: (stocks: Stock[]) => void;
  onImportExcelData: (stocks: Stock[], obs: PriceObservation[]) => void;
  onUpdateFrequency: (freq: Frequency) => void;
  onLoadSampleData: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3DataInput: React.FC<Step3DataInputProps> = ({
  stocks,
  observations,
  frequency,
  onUpdateObservations,
  onUpdateStocks,
  onImportExcelData,
  onUpdateFrequency,
  onLoadSampleData,
  onNext,
  onBack,
}) => {
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validation = validatePriceObservations(observations, stocks);

  // Inline header editing for stock names
  const handleStockNameChange = (stockId: string, newName: string) => {
    onUpdateStocks(
      stocks.map((s) => (s.id === stockId ? { ...s, name: newName } : s))
    );
  };

  const handleDateChange = (index: number, date: string) => {
    const updated = [...observations];
    updated[index] = { ...updated[index], date };
    onUpdateObservations(updated);
  };

  const handlePriceChange = (index: number, stockId: string, valStr: string) => {
    const num = parseFloat(valStr);
    const updated = [...observations];
    const prices = { ...updated[index].prices, [stockId]: isNaN(num) ? 0 : num };
    updated[index] = { ...updated[index], prices };
    onUpdateObservations(updated);
  };

  const handleAddRow = () => {
    const lastIndex = observations.length;
    const dateLabel = `Period ${lastIndex + 1}`;
    const defaultPrices: Record<string, number> = {};
    stocks.forEach((s) => {
      defaultPrices[s.id] = 100;
    });

    onUpdateObservations([...observations, { date: dateLabel, prices: defaultPrices }]);
  };

  const handleDeleteRow = (index: number) => {
    if (observations.length <= 2) return;
    onUpdateObservations(observations.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all price observations?')) {
      onUpdateObservations([]);
    }
  };

  // Process text paste from Excel
  const handleProcessPaste = () => {
    if (!pastedText.trim()) return;

    const result = parsePastedExcelText(pastedText);

    if (result.observations.length > 0) {
      if (result.stocks.length > 0) {
        onImportExcelData(result.stocks, result.observations);
        setImportNotification(
          `Successfully imported ${result.stocks.length} stocks (${result.stocks.map((s) => s.name).join(', ')}) and ${result.observations.length} observations!`
        );
      } else {
        onUpdateObservations(result.observations);
        setImportNotification(`Successfully updated ${result.observations.length} price observations!`);
      }
      setPasteModalOpen(false);
      setPastedText('');
      setTimeout(() => setImportNotification(null), 6000);
    }
  };

  // Process Excel File Upload (.xlsx, .xls, .csv)
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
          setImportNotification(
            `Successfully imported file "${file.name}": ${result.stocks.length} stocks (${result.stocks.map((s) => s.name).join(', ')}) and ${result.observations.length} observations!`
          );
          setUploadModalOpen(false);
          setTimeout(() => setImportNotification(null), 7000);
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
    <div className="space-y-8 py-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 2 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Historical Price Data Input</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enter periodic prices, upload Excel file (.xlsx), or paste spreadsheet columns.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Frequency Selector */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {(['daily', 'weekly', 'monthly', 'yearly'] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => onUpdateFrequency(f)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  frequency === f
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setPasteModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 text-slate-200"
          >
            <Clipboard className="w-3.5 h-3.5 text-sky-400" />
            <span>Paste from Excel</span>
          </button>

          <button
            onClick={onLoadSampleData}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 text-slate-200"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={handleClearAll}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
            title="Clear data"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {importNotification && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{importNotification}</span>
        </div>
      )}

      {/* Illustrative Data Banner */}
      <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-300">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Tip: You can edit stock names directly on the table header below.
          </span>
        </div>
        <span className="font-mono text-slate-400">Total Observations: {observations.length}</span>
      </div>

      {/* Validation Warnings & Errors */}
      {validation.warnings.length > 0 && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-amber-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Observation Advisory</span>
          </div>
          {validation.warnings.map((w, i) => (
            <p key={i} className="pl-6 text-amber-300/80">{w}</p>
          ))}
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Validation Errors (Please fix before proceeding)</span>
          </div>
          {validation.errors.map((e, i) => (
            <p key={i} className="pl-6 text-rose-300/80">{e}</p>
          ))}
        </div>
      )}

      {/* Editable Spreadsheet Grid */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[140px]">Date / Period</th>
                {stocks.map((stock) => (
                  <th key={stock.id} className="py-3.5 px-4 min-w-[160px]">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={stock.name}
                          onChange={(e) => handleStockNameChange(stock.id, e.target.value)}
                          className="font-bold text-white bg-slate-950/80 border border-slate-700/60 rounded px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none w-full"
                          title="Click to edit stock name"
                        />
                        <Edit2 className="w-3 h-3 text-slate-500 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Weight:</span>
                        <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                          {stock.weight}%
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 w-12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm font-mono">
              {observations.map((obs, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors group">
                  <td className="py-2.5 px-4 text-center text-xs text-slate-500 font-sans">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={obs.date}
                      onChange={(e) => handleDateChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-sans"
                      placeholder="e.g. Jan 2026"
                    />
                  </td>
                  {stocks.map((stock) => (
                    <td key={stock.id} className="py-2.5 px-4">
                      <input
                        type="number"
                        step="any"
                        value={obs.prices[stock.id] ?? ''}
                        onChange={(e) => handlePriceChange(idx, stock.id, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono text-emerald-300"
                        placeholder="0.00"
                      />
                    </td>
                  ))}
                  <td className="py-2.5 px-4 text-center">
                    {observations.length > 2 && (
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete row"
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

        {/* Table Footer */}
        <div className="p-4 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAddRow}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Observation Row</span>
          </button>

          <span className="text-xs text-slate-400">
            Click any price cell to edit directly
          </span>
        </div>
      </div>

      {/* Upload Excel Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Upload Excel File (.xlsx, .csv)</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload your spreadsheet file (e.g., <code className="text-emerald-300 font-mono">Book1.xlsx</code>).
              The 1st row will be used for Stock Names, and Column 1 for Month/Dates.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer bg-emerald-950/10 hover:bg-emerald-950/20 transition-all text-center"
            >
              <Upload className="w-10 h-10 text-emerald-400" />
              <div>
                <span className="text-sm font-semibold text-white block">
                  Click to choose file or drag & drop here
                </span>
                <span className="text-xs text-slate-400">Supports .xlsx, .xls, .csv files</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Excel Data Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Paste Data from Excel / CSV</h3>
              <button
                onClick={() => setPasteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Paste rows copied directly from Excel. Header row with stock names will be automatically detected: <br />
              <code className="bg-slate-900 px-2 py-0.5 rounded text-indigo-300 font-mono text-[11px]">
                Month	Kaynes Technology	Larsen & Turbo	PC Jeweller
              </code>
            </p>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Month\tKaynes Technology\tLarsen & Turbo\tPC Jeweller\n2025-09-01\t7052\t3659\t12.34\n2025-10-01\t6704.5\t4030.9\t11.62\n2025-11-01\t5490\t4069.6\t9.9`}
              className="w-full p-3 rounded-xl glass-input text-xs font-mono"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPaste}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Setup</span>
        </button>

        <button
          onClick={onNext}
          disabled={!validation.isValid}
          className={`px-6 py-3 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all ${
            validation.isValid
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Calculate Periodic Returns</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
