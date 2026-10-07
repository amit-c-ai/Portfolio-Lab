'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, HelpCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { AnalysisResults } from '../../lib/types';
import { buildTutorContextPayload } from '../../lib/tutor/contextBuilder';
import { ChatMessage } from '../../lib/tutor/types';

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepLabel?: string;
  initialQuestion?: string;
  results?: AnalysisResults;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  isOpen,
  onClose,
  currentStepLabel = 'Portfolio Analysis',
  initialQuestion,
  results,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([
    'Why is correlation important for diversification?',
    'How was my portfolio risk calculated?',
    'What does covariance mean in simple terms?',
    'Why did my portfolio return change?',
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle auto-query when user clicks Ask AI Agent on a metric
  useEffect(() => {
    if (isOpen && initialQuestion) {
      handleSendQuestion(`Explain ${initialQuestion} in my portfolio analysis`);
    }
  }, [isOpen, initialQuestion]);

  const handleSendQuestion = async (text: string) => {
    const query = text.trim();
    if (!query || isLoading || !results) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build context payload
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const payload = buildTutorContextPayload(
        query,
        currentStepLabel,
        results,
        initialQuestion ? { name: initialQuestion } : undefined,
        history
      );

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.answer) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (data.suggestedFollowUps) {
          setSuggestedFollowUps(data.suggestedFollowUps);
        }
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ Note: ${data.error}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Failed to connect to AI Agent API. Please try again.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendQuestion(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-purple-500/30 shadow-2xl flex flex-col justify-between p-6 animate-slide-left text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 border border-purple-400/40 rounded-xl text-white shadow-lg">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">AI Portfolio Tutor</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full uppercase">
                  Active Agent
                </span>
              </div>
              <p className="text-xs text-purple-300/80">Context: {currentStepLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-3">
              <div className="flex items-center space-x-2 text-purple-300 text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Smart Financial Educator</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hi! I am your Portfolio Lab AI Agent. I evaluate your exact company numbers, risk figures, and correlations to explain financial formulas in simple terms.
              </p>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-br-none shadow-md'
                    : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-bl-none shadow-md space-y-2'
                }`}
              >
                {/* Render Markdown simple formatting */}
                {msg.content.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('📌') || line.startsWith('🧮') || line.startsWith('💡') ? 'font-semibold text-purple-200 mt-1' : ''}>
                    {line}
                  </p>
                ))}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl rounded-bl-none text-xs text-purple-300 animate-pulse w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Analyzing portfolio data...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Follow-Ups */}
        {suggestedFollowUps.length > 0 && !isLoading && (
          <div className="py-2 space-y-2 shrink-0 border-t border-slate-800/60">
            <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400">
              <HelpCircle className="w-3 h-3 text-purple-400" />
              <span>Suggested Follow-Ups:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {suggestedFollowUps.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuestion(q)}
                  className="px-2.5 py-1.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-[11px] text-purple-200 hover:bg-purple-900/60 hover:border-purple-400 transition-all text-left flex items-center space-x-1"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="pt-3 border-t border-slate-800 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask AI Agent about your numbers..."
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
