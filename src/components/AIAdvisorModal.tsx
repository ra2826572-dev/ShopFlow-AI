import React from 'react';
import { Rocket, X, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AIAdvisorModal: React.FC = () => {
  const { aiInsightsOpen, setAIInsightsOpen, aiInsights, loadingAI, fetchAIInsights } = useApp();

  if (!aiInsightsOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#11152D] via-[#1E2240] to-[#2D2B60] text-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ShopFlow AI Business Advisor</h3>
              <p className="text-xs text-purple-300">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button 
            onClick={() => setAIInsightsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-[250px] max-h-[60vh] overflow-y-auto pr-2 text-sm leading-relaxed text-slate-200 space-y-4">
          {loadingAI ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-purple-200">Analyzing store sales, inventory & profit metrics...</p>
            </div>
          ) : (
            <div className="whitespace-pre-line bg-white/5 border border-white/10 p-6 rounded-2xl">
              {aiInsights}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-purple-500/20 mt-6">
          <button
            onClick={fetchAIInsights}
            disabled={loadingAI}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-semibold border border-purple-500/40 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Refresh Analysis
          </button>
          <button
            onClick={() => setAIInsightsOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
