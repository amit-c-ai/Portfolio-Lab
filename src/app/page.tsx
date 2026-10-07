'use client';

import React, { useState, useMemo } from 'react';
import { Stock, PriceObservation, Frequency } from '../lib/types';
import { DEFAULT_STOCKS, SAMPLE_PRICE_OBSERVATIONS, runCompleteAnalysis } from '../lib/finance';
import { Header } from '../components/layout/Header';
import { StepNavigator } from '../components/layout/StepNavigator';
import { AITutorPanel } from '../components/tutor/AITutorPanel';
import { Step1Landing } from '../components/steps/Step1Landing';
import { Step2PortfolioSetup } from '../components/steps/Step2PortfolioSetup';
import { Step3DataInput } from '../components/steps/Step3DataInput';
import { Step4Returns } from '../components/steps/Step4Returns';
import { Step5RiskAnalysis } from '../components/steps/Step5RiskAnalysis';
import { Step6CovarianceCorr } from '../components/steps/Step6CovarianceCorr';
import { Step7Portfolio } from '../components/steps/Step7Portfolio';
import { Step8Diversification } from '../components/steps/Step8Diversification';
import { Step9FinalInsights } from '../components/steps/Step9FinalInsights';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(1);
  const [stocks, setStocks] = useState<Stock[]>(DEFAULT_STOCKS);
  const [observations, setObservations] = useState<PriceObservation[]>(
    SAMPLE_PRICE_OBSERVATIONS
  );
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [aiTutorOpen, setAiTutorOpen] = useState<boolean>(false);
  const [activeMetricContext, setActiveMetricContext] = useState<string | undefined>(undefined);

  // Synchronize stock changes with price observations table
  const handleUpdateStocks = (newStocks: Stock[]) => {
    setStocks(newStocks);

    setObservations((prevObs) =>
      prevObs.map((obs) => {
        const updatedPrices: Record<string, number> = {};
        newStocks.forEach((stock) => {
          updatedPrices[stock.id] = obs.prices[stock.id] !== undefined ? obs.prices[stock.id] : 100;
        });
        return { ...obs, prices: updatedPrices };
      })
    );
  };

  // Import full dataset (stocks + price observations) from Excel file or paste
  const handleImportExcelData = (importedStocks: Stock[], importedObs: PriceObservation[]) => {
    setStocks(importedStocks);
    setObservations(importedObs);
    setMaxCompletedStep(3);
    setCurrentStep(3); // Jump straight to price input with populated data
  };

  const handleOpenAITutorWithMetric = (metricName?: string) => {
    setActiveMetricContext(metricName);
    setAiTutorOpen(true);
  };

  // Compute complete financial results client-side
  const analysisResults = useMemo(() => {
    return runCompleteAnalysis(stocks, observations);
  }, [stocks, observations]);

  const handleNextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next > maxCompletedStep) {
      setMaxCompletedStep(next);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectStep = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSampleData = () => {
    setStocks(DEFAULT_STOCKS);
    setObservations(SAMPLE_PRICE_OBSERVATIONS);
    setFrequency('monthly');
    if (currentStep === 1) {
      setCurrentStep(2);
      setMaxCompletedStep(Math.max(maxCompletedStep, 2));
    }
  };

  const handleReset = () => {
    if (confirm('Reset portfolio setup and price data to default sample portfolio?')) {
      setStocks(DEFAULT_STOCKS);
      setObservations(SAMPLE_PRICE_OBSERVATIONS);
      setFrequency('monthly');
      setCurrentStep(1);
      setMaxCompletedStep(1);
    }
  };

  const stepLabels: Record<number, string> = {
    1: 'Landing & Overview',
    2: 'Portfolio Setup',
    3: 'Historical Price Input',
    4: 'Periodic Return Calculation',
    5: 'Individual Risk & Volatility',
    6: 'Covariance & Pearson Correlation',
    7: 'Portfolio Expected Return & Risk',
    8: 'Diversification Analysis',
    9: 'Final Executive Insights',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        onLoadSampleData={handleLoadSampleData}
        onImportExcelData={handleImportExcelData}
        onReset={handleReset}
        onOpenAITutor={handleOpenAITutorWithMetric}
      />

      {/* Step Navigator Bar */}
      <StepNavigator
        currentStep={currentStep}
        onSelectStep={handleSelectStep}
        maxCompletedStep={maxCompletedStep}
      />

      {/* Main App Content View (Portfolio Analysis Module) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === 1 && (
          <Step1Landing
            onStartAnalysis={() => {
              setCurrentStep(2);
              setMaxCompletedStep(Math.max(maxCompletedStep, 2));
            }}
            onLoadSampleData={handleLoadSampleData}
            onImportExcelData={handleImportExcelData}
            onOpenAITutor={() => handleOpenAITutorWithMetric()}
          />
        )}

        {currentStep === 2 && (
          <Step2PortfolioSetup
            stocks={stocks}
            onUpdateStocks={handleUpdateStocks}
            onNext={handleNextStep}
          />
        )}

        {currentStep === 3 && (
          <Step3DataInput
            stocks={stocks}
            observations={observations}
            frequency={frequency}
            onUpdateObservations={setObservations}
            onUpdateStocks={handleUpdateStocks}
            onImportExcelData={handleImportExcelData}
            onUpdateFrequency={setFrequency}
            onLoadSampleData={handleLoadSampleData}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {currentStep === 4 && (
          <Step4Returns
            results={analysisResults}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        )}

        {currentStep === 5 && (
          <Step5RiskAnalysis
            results={analysisResults}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onOpenAITutor={handleOpenAITutorWithMetric}
          />
        )}

        {currentStep === 6 && (
          <Step6CovarianceCorr
            results={analysisResults}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onOpenAITutor={handleOpenAITutorWithMetric}
          />
        )}

        {currentStep === 7 && (
          <Step7Portfolio
            results={analysisResults}
            stocks={stocks}
            onUpdateStocks={handleUpdateStocks}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onOpenAITutor={handleOpenAITutorWithMetric}
          />
        )}

        {currentStep === 8 && (
          <Step8Diversification
            results={analysisResults}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onOpenAITutor={handleOpenAITutorWithMetric}
          />
        )}

        {currentStep === 9 && (
          <Step9FinalInsights
            results={analysisResults}
            onReset={handleReset}
            onOpenAITutor={handleOpenAITutorWithMetric}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            Portfolio Analysis Module V1 — Financial Education Platform
          </p>
          <p className="text-[11px] text-slate-600">
            Educational tool only. Historical performance does not guarantee future results. Calculations performed client-side using standard sample formulas.
          </p>
        </div>
      </footer>

      {/* AI Tutor Drawer Panel */}
      <AITutorPanel
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        currentStepLabel={stepLabels[currentStep]}
        initialQuestion={activeMetricContext}
        results={analysisResults}
      />
    </div>
  );
}
