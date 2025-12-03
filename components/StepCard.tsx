import React, { useState } from 'react';
import { NotebookStep } from '../types';
import { Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface StepCardProps {
  step: NotebookStep;
  isExpanded: boolean;
  onToggle: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, isExpanded, onToggle }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(step.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-6 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-slate-900/50 hover:border-slate-600">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-800"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
            {step.stepNumber}
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{step.title}</h3>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-slate-700">
          <div className="mb-6 text-slate-300 leading-relaxed space-y-2">
            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">What's happening here?</h4>
            <p>{step.description}</p>
          </div>

          <div className="relative group">
            <div className="absolute -top-3 left-4 px-2 bg-slate-800 text-xs font-mono text-slate-400 flex items-center gap-1">
                <Terminal className="w-3 h-3" /> Python
            </div>
            <div className="absolute top-2 right-2">
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 pt-6 rounded-md overflow-x-auto text-sm font-mono text-green-300 border border-slate-800">
              <code>{step.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
