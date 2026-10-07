'use client';

import React from 'react';
import { Stock } from '../../lib/types';
import { validatePortfolioSetup } from '../../lib/finance/validation';
import { Plus, Trash2, Scale, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Step2PortfolioSetupProps {
  stocks: Stock[];
  onUpdateStocks: (stocks: Stock[]) => void;
  onNext: () => void;
}

export const Step2PortfolioSetup: React.FC<Step2PortfolioSetupProps> = ({
  stocks,
  onUpdateStocks,
  onNext,
}) => {
  const validation = validatePortfolioSetup(stocks);

  const totalWeight = stocks.reduce((acc, s) => acc + (isNaN(s.weight) ? 0 : s.weight), 0);
  const roundedSum = Math.round(totalWeight * 100) / 100;

  const handleStockCountChange = (count: number) => {
    if (count < 2 || count > 10) return;

    if (count > stocks.length) {
      const newStocks = [...stocks];
      for (let i = stocks.length; i < count; i++) {
        newStocks.push({
          id: `stock-${i + 1}`,
          name: `Stock ${String.fromCharCode(65 + i)}`,
          ticker: `STK${i + 1}`,
          weight: 0,
        });
      }
      onUpdateStocks(autoBalanceWeights(newStocks));
    } else if (count < stocks.length) {
      const newStocks = stocks.slice(0, count);
      onUpdateStocks(autoBalanceWeights(newStocks));
    }
  };

  const handleNameChange = (id: string, name: string) => {
    onUpdateStocks(stocks.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleTickerChange = (id: string, ticker: string) => {
    onUpdateStocks(stocks.map((s) => (s.id === id ? { ...s, ticker } : s)));
  };

  const handleWeightChange = (id: string, weightNum: number) => {
    onUpdateStocks(
      stocks.map((s) => (s.id === id ? { ...s, weight: isNaN(weightNum) ? 0 : weightNum } : s))
    );
  };

  const handleAddStock = () => {
    if (stocks.length >= 10) return;
    const i = stocks.length;
    const newStocks = [
      ...stocks,
      {
        id: `stock-${i + 1}`,
        name: `Stock ${String.fromCharCode(65 + i)}`,
        ticker: `STK${i + 1}`,
        weight: 0,
      },
    ];
    onUpdateStocks(autoBalanceWeights(newStocks));
  };

  const handleDeleteStock = (id: string) => {
    if (stocks.length <= 2) return;
    const filtered = stocks.filter((s) => s.id !== id);
    // Re-index remaining stocks with stable IDs
    const reindexed = filtered.map((s, idx) => ({
      ...s,
      id: `stock-${idx + 1}`,
    }));
    onUpdateStocks(autoBalanceWeights(reindexed));
  };

  const autoBalanceWeights = (stockList: Stock[]): Stock[] => {
    if (stockList.length === 0) return stockList;
    const equalWeight = Math.floor(100 / stockList.length);
    const remainder = 100 - equalWeight * stockList.length;

    return stockList.map((s, idx) => ({
      ...s,
      weight: idx === 0 ? equalWeight + remainder : equalWeight,
    }));
  };

  return (
    <div className="space-y-8 py-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Step 1 of 8
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Portfolio Setup</h2>
          <p className="text-sm text-slate-400 mt-1">
            Define your holdings and target portfolio allocation weights (must sum to 100%).
          </p>
        </div>

        {/* Stock Count Quick Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Assets:</span>
          {[2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleStockCountChange(num)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                stocks.length === num
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Total Weight Status Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          validation.isValid
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {validation.isValid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
          )}
          <div>
            <div className="font-bold text-sm">
              {validation.isValid
                ? 'Portfolio weights are valid (100%)'
                : 'Portfolio weights must add up to 100%'}
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Current total: <span className="font-mono font-bold text-sm">{roundedSum}%</span>
              {!validation.isValid && ` (Difference: ${(100 - roundedSum).toFixed(1)}%)`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onUpdateStocks(autoBalanceWeights(stocks))}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center space-x-2 text-slate-200 shrink-0"
        >
          <Scale className="w-4 h-4 text-indigo-400" />
          <span>Auto-Balance Equal Weights</span>
        </button>
      </div>

      {/* Stock Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock, index) => (
          <div
            key={stock.id}
            className="glass-card p-5 rounded-2xl space-y-4 relative border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-300">Asset #{index + 1}</span>
              </div>
              {stocks.length > 2 && (
                <button
                  onClick={() => handleDeleteStock(stock.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Remove stock"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Stock Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={stock.name}
                  onChange={(e) => handleNameChange(stock.id, e.target.value)}
                  placeholder="e.g. Reliance, Apple..."
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Ticker Symbol (Optional)
                </label>
                <input
                  type="text"
                  value={stock.ticker || ''}
                  onChange={(e) => handleTickerChange(stock.id, e.target.value)}
                  placeholder="e.g. RELIANCE, AAPL"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono uppercase"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">
                    Portfolio Weight (%)
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {stock.weight}%
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={stock.weight}
                    onChange={(e) => handleWeightChange(stock.id, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stock.weight}
                    onChange={(e) => handleWeightChange(stock.id, parseFloat(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-xl glass-input text-sm text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {stocks.length < 10 && (
          <button
            onClick={handleAddStock}
            className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 text-slate-400 hover:text-indigo-300 transition-all bg-slate-950/30"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold">Add Another Stock</span>
            <span className="text-xs text-slate-500">Up to 10 stocks maximum</span>
          </button>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-6 border-t border-slate-800">
        <button
          onClick={onNext}
          disabled={!validation.isValid}
          className={`px-6 py-3 rounded-2xl font-semibold text-sm flex items-center space-x-2 transition-all ${
            validation.isValid
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Continue to Price Data Input</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
