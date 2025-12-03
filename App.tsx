import React, { useState, useEffect } from 'react';
import { generateNotebookPlan } from './services/geminiService';
import { NotebookPlan, UserInput } from './types';
import { StepCard } from './components/StepCard';
import { downloadIpynb } from './utils/notebookConverter';
import { BookOpen, Download, Loader2, PlayCircle, Settings, HardDrive, Cpu, AlertTriangle, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<NotebookPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  
  const [input, setInput] = useState<UserInput>({
    modelSize: 'small',
    language: 'English',
    dataSource: 'google_drive'
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const generatedPlan = await generateNotebookPlan(input);
      setPlan(generatedPlan);
      setExpandedStep(1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              WhisperTuner
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Intro / Config Section */}
        {!plan && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-white tracking-tight">
                Fine-tune Whisper in Colab
              </h2>
              <p className="text-lg text-slate-400">
                Generate a beginner-friendly, step-by-step notebook plan to fine-tune OpenAI's Whisper model on your own voice data.
              </p>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-xl text-left space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Model Size
                  </label>
                  <select 
                    value={input.modelSize}
                    onChange={(e) => setInput({...input, modelSize: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="tiny">Tiny (Fastest, Less Accurate)</option>
                    <option value="base">Base</option>
                    <option value="small">Small (Recommended)</option>
                    <option value="medium">Medium (Better, Slower)</option>
                    <option value="large">Large (Best, Slowest)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Language
                  </label>
                  <input 
                    type="text"
                    value={input.language}
                    onChange={(e) => setInput({...input, language: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g. English, Spanish"
                  />
                </div>
                
                 <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> Data Source
                  </label>
                  <select 
                    value={input.dataSource}
                    onChange={(e) => setInput({...input, dataSource: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="google_drive">Google Drive (Recommended for Colab)</option>
                    <option value="local">Local Files (VS Code / Jupyter)</option>
                    <option value="huggingface_hub">HuggingFace Hub</option>
                  </select>
                  
                  {input.dataSource === 'google_drive' && (
                    <div className="text-xs text-blue-300/80 bg-blue-900/20 p-3 rounded-lg border border-blue-900/30 mt-2">
                      <p className="font-semibold mb-1 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Drive Setup:</p>
                      <p className="mb-1">Create a folder <code>my_whisper_data</code> in your Drive root containing:</p>
                      <ul className="list-disc list-inside opacity-80 space-y-1">
                        <li>Your audio files (<code>.wav</code>)</li>
                        <li>A <code>metadata.csv</code> with header: <code>file_name,transcription</code></li>
                      </ul>
                    </div>
                  )}

                  {input.dataSource === 'local' && (
                    <div className="text-xs text-amber-300/80 bg-amber-900/20 p-3 rounded-lg border border-amber-900/30 mt-2">
                      <p className="font-semibold mb-1 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Local Setup:</p>
                      <p className="mb-1">Ensure a folder <code>my_whisper_data</code> exists in the <strong>same directory</strong> as your notebook containing:</p>
                      <ul className="list-disc list-inside opacity-80 space-y-1">
                        <li>Your audio files (<code>.wav</code>)</li>
                        <li>A <code>metadata.csv</code> with header: <code>file_name,transcription</code></li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6" />
                    Generate Notebook Plan
                  </>
                )}
              </button>
              
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3 text-red-300 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
            
            <div className="text-slate-500 text-sm">
              <p>Tip: This tool generates a starter notebook. Fine-tuning requires a good GPU!</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {plan && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <button 
                  onClick={() => setPlan(null)}
                  className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-flex items-center gap-1"
                >
                   ← Start Over
                </button>
                <h2 className="text-3xl font-bold text-white">{plan.title}</h2>
                <p className="text-slate-400 mt-2 max-w-2xl">{plan.introduction}</p>
              </div>
              <button
                onClick={() => downloadIpynb(plan)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700 flex items-center gap-2 shadow-sm"
              >
                <Download className="w-5 h-5" />
                Download .ipynb
              </button>
            </div>

            <div className="space-y-4">
              {plan.steps.map((step) => (
                <StepCard 
                  key={step.stepNumber} 
                  step={step} 
                  isExpanded={expandedStep === step.stepNumber}
                  onToggle={() => handleToggleStep(step.stepNumber)}
                />
              ))}
            </div>
            
            <div className="bg-blue-900/10 border border-blue-800/30 p-6 rounded-xl text-center">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Ready to start?</h3>
              <p className="text-slate-400 mb-6">
                Download the .ipynb file above and run it in your environment.
                {input.dataSource === 'google_drive' ? 
                  " Upload it to colab.research.google.com and enable GPU Runtime." : 
                  " Ensure your local environment has a GPU enabled (e.g. CUDA)."
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;