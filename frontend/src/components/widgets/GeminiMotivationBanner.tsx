import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { RefreshCw, Quote, Shield } from 'lucide-react';

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


      </div>
    </div>
  );
};
