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
      <footer className="bg-slate-950/90 border-t border-slate-900 py-6 text-center text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-300">
            Portfolio Analysis Module V1 — Financial Education Platform
          </p>
          <p className="text-slate-400 flex items-center space-x-1.5">
            <span>Developed by</span>
            <a
              href="https://www.instagram.com/__j.o.y.b.o.y___/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center space-x-1 underline decoration-indigo-500/40 underline-offset-4"
            >
              <span>JOYBOY</span>
              <svg className="w-3.5 h-3.5 text-pink-400 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
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
