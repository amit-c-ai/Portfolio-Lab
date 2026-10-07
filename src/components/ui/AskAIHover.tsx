'use client';

import React, { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface AskAIHoverProps {
  children: React.ReactNode;
  metricName: string;
  metricValue?: string | number;
  onAskAI?: (metricName: string, metricValue?: string | number) => void;
  className?: string;
}

export const AskAIHover: React.FC<AskAIHoverProps> = ({
  children,
  metricName,
  metricValue,
  onAskAI,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onAskAI) {
      e.stopPropagation();
      onAskAI(metricName, metricValue);
    }
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Hover Floating AI Agent Badge */}
      <div
        onClick={handleClick}
        className={`absolute -top-3 right-2 z-20 transition-all duration-200 cursor-pointer ${
          isHovered
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-950/90 border border-purple-400/50 text-purple-200 shadow-lg shadow-purple-500/20 backdrop-blur-md hover:border-purple-300 transition-all">
          <Bot className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span className="text-[10px] font-bold tracking-tight">Ask AI Agent</span>
          <Sparkles className="w-3 h-3 text-purple-300" />
        </div>
      </div>
    </div>
  );
};
