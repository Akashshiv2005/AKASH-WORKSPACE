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
      <div className="rounded-2xl bg-[#fffdfa] dark:bg-[#18181b] border border-amber-300 dark:border-zinc-800 p-6 text-zinc-900 dark:text-zinc-100 space-y-4 shadow-sm">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center shadow-xs animate-float">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400 inline-block">
                JARVIS AI BOOST
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-text-reveal">
                Personalized executive mindset for {fullName}
              </p>
            </div>
          </div>

          <button
            onClick={fetchMotivation}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-900/50 text-xs font-bold text-red-600 dark:text-amber-400 transition-all hover:scale-105 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hover-text-shimmer">{loading ? 'Generating...' : 'Refresh JARVIS Quote'}</span>
          </button>
        </div>

        {/* Quote Block */}
        <div className="p-5 rounded-2xl bg-[#fffbf5] dark:bg-zinc-900 border border-amber-200 dark:border-zinc-800 space-y-3 relative shadow-xs">
          <Quote className="w-10 h-10 text-red-600/10 dark:text-amber-400/10 absolute right-4 top-3 pointer-events-none" />
          <p className="text-sm font-semibold italic text-zinc-900 dark:text-zinc-100 leading-relaxed animate-text-reveal hover:text-red-600 dark:hover:text-amber-400 transition-colors duration-300">
            "{motivation.quote}"
          </p>
          <div className="text-xs font-bold text-red-600 dark:text-amber-400 shimmer-text-orange inline-block">
            — {motivation.author}
          </div>
        </div>

        {/* Live Typewriter Mindset Ticker */}
        <div className="flex items-center space-x-2 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-amber-200 dark:border-zinc-800 overflow-hidden">
          <div className="flex items-center space-x-1 font-bold text-red-600 uppercase tracking-wider text-[10px] shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
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
            className="text-xs font-semibold text-zinc-900 truncate"
            cursorClassName="text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

