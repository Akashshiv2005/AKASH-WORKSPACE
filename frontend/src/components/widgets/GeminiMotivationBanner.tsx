import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { RefreshCw, Quote, Compass, Target, CheckCircle2, Shield, Lock } from 'lucide-react';

interface MotivationData {
  quote: string;
  author: string;
  mindset_tip: string;
  focus_question: string;
}

const FALLBACK_MOTIVATION: MotivationData = {
  quote: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.",
  author: "Mark Twain",
  mindset_tip: "Focus on taking one tiny action right now. Momentum follows action.",
  focus_question: "What is the single most important task you will complete today?"
};

export const GeminiMotivationBanner: React.FC = () => {
  const [motivation, setMotivation] = useState<MotivationData>(FALLBACK_MOTIVATION);
  const [loading, setLoading] = useState(false);
  const [dailyFocus, setDailyFocus] = useState('');
  const [focusLocked, setFocusLocked] = useState(false);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post<MotivationData>('/ai/motivate', { topic: 'productivity' });
      if (res.data && res.data.quote) {
        setMotivation(res.data);
      }
    } catch {
      // keep current fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  return (
    <div className="my-6 select-none animate-fade-in-up">
      <div className="rounded-2xl bg-[#fffaf3] border border-[#ffe9d1] p-6 text-[#1c1917] space-y-4 shadow-sm">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center shadow-xs animate-float">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#ff7a00]">
                JARVIS AI BOOST
              </span>
              <p className="text-xs text-[#78716c]">
                Personalized executive mindset for Akash Shiv
              </p>
            </div>
          </div>

          <button
            onClick={fetchMotivation}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#fff7ed] border border-[#ffd8b3] text-xs font-bold text-[#ff7a00] transition-all hover:scale-105 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Refresh JARVIS Quote'}</span>
          </button>
        </div>

        {/* Quote Block (Exact ChatGPT Quote Styling) */}
        <div className="p-5 rounded-2xl bg-[#fffcf7] border border-[#f5ede2] space-y-3 relative shadow-xs">
          <Quote className="w-10 h-10 text-[#ff7a00]/10 absolute right-4 top-3 pointer-events-none" />
          <p className="text-sm font-semibold italic text-[#1c1917] leading-relaxed">
            "{motivation.quote}"
          </p>
          <div className="text-xs font-bold text-[#ff7a00]">
            — {motivation.author}
          </div>
        </div>

        {/* Mindset Tip & Focus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Mindset Tip */}
          <div className="p-4 rounded-xl bg-white border border-[#f2e8da] flex items-start space-x-3 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#fff3e5] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-[#ff7a00]" />
            </div>
            <div>
              <span className="font-bold text-[#ff7a00]">JARVIS Mindset Protocol</span>
              <p className="text-[#57534e] mt-0.5 font-medium leading-relaxed">{motivation.mindset_tip}</p>
            </div>
          </div>

          {/* Daily Reflection Question */}
          <div className="p-4 rounded-xl bg-white border border-[#f2e8da] flex items-start space-x-3 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#fff3e5] flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-3.5 h-3.5 text-[#ff7a00]" />
            </div>
            <div>
              <span className="font-bold text-[#ff7a00]">Daily Priority Target</span>
              <p className="text-[#57534e] mt-0.5 font-medium leading-relaxed">{motivation.focus_question}</p>
            </div>
          </div>
        </div>

        {/* Daily Intention Lock-In Field */}
        <div className="pt-2 border-t border-[#f0e8dc] flex items-center space-x-2">
          <input
            type="text"
            placeholder="Akash, lock in your primary target for today..."
            value={dailyFocus}
            onChange={(e) => setDailyFocus(e.target.value)}
            disabled={focusLocked}
            className="flex-1 px-4 py-2.5 bg-white border border-[#f2e8da] rounded-xl text-xs outline-none focus:border-[#ff7a00] transition-colors font-medium text-[#1c1917] shadow-xs"
          />
          <button
            onClick={() => dailyFocus.trim() && setFocusLocked(!focusLocked)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
              focusLocked
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white hover:scale-105'
            }`}
          >
            {focusLocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{focusLocked ? 'Target Locked ✓' : 'Lock Target'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
