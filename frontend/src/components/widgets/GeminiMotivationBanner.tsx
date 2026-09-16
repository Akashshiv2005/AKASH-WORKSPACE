import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { RefreshCw, Quote, Shield, Sparkles } from 'lucide-react';
import { TypewriterText } from '../common/TypewriterText';
import { useAuthStore } from '../../store/useAuthStore';

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
  const { user } = useAuthStore();
  const fullName = user?.full_name || 'Akash Shiv';
  const firstName = user?.full_name?.split(' ')[0] || 'Akash';

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
      <div className="rounded-2xl bg-[#131b2e]/90 border border-indigo-500/25 p-6 text-slate-100 space-y-4 shadow-lg backdrop-blur-xl">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md animate-float">
              <Shield className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 inline-block">
                JARVIS AI BOOST
              </span>
              <p className="text-xs text-slate-400 animate-text-reveal">
                Personalized executive mindset for {fullName}
              </p>
            </div>
          </div>

          <button
            onClick={fetchMotivation}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-amber-400/40 text-xs font-bold text-amber-400 transition-all hover:scale-105 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hover-text-shimmer">{loading ? 'Generating...' : 'Refresh JARVIS Quote'}</span>
          </button>
        </div>

        {/* Quote Block */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-indigo-500/20 space-y-3 relative shadow-sm">
          <Quote className="w-10 h-10 text-amber-400/10 absolute right-4 top-3 pointer-events-none" />
          <p className="text-sm font-semibold italic text-slate-200 leading-relaxed animate-text-reveal hover:text-amber-300 transition-colors duration-300">
            "{motivation.quote}"
          </p>
          <div className="text-xs font-bold text-amber-400 shimmer-text-orange inline-block">
            — {motivation.author}
          </div>
        </div>

        {/* Live Typewriter Mindset Ticker */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2 border-t border-indigo-500/20 overflow-hidden">
          <div className="flex items-center space-x-1 font-bold text-amber-400 uppercase tracking-wider text-[10px] shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>EXECUTIVE TIP:</span>
          </div>
          <TypewriterText
            phrases={[
              motivation.mindset_tip || "Focus on taking one tiny action right now. Momentum follows action.",
              motivation.focus_question || "What is the single most important task you will complete today?",
              `Consistency beats intensity every single time, ${firstName}.`,
              "Small daily incremental habits compound into massive success."
            ]}
            typingSpeed={45}
            deletingSpeed={22}
            pauseDuration={2800}
            className="text-xs font-semibold text-slate-200 truncate"
            cursorClassName="text-amber-400"
          />
        </div>
      </div>
    </div>
  );
};

