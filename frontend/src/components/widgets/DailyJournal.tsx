import React, { useState } from 'react';
import { BookOpen, Heart, CheckCircle2, Save } from 'lucide-react';
import { useJournalStore } from '../../store/useJournalStore';
import { useAuthStore } from '../../store/useAuthStore';

const MOODS = [
  { emoji: '🚀', label: 'Motivated', color: 'bg-purple-500/10 border-purple-500/30 text-purple-600' },
  { emoji: '⚡', label: 'Energetic', color: 'bg-amber-500/10 border-amber-500/30 text-amber-600' },
  { emoji: '🎯', label: 'Focused', color: 'bg-blue-500/10 border-blue-500/30 text-blue-600' },
  { emoji: '🧘', label: 'Calm', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' },
  { emoji: '😊', label: 'Happy', color: 'bg-rose-500/10 border-rose-500/30 text-rose-600' },
];

export const DailyJournal: React.FC = () => {
  const { user } = useAuthStore();
  const {
    selectedMood,
    gratitude1,
    gratitude2,
    gratitude3,
    reflectionText,
    setMood,
    setGratitude1,
    setGratitude2,
    setGratitude3,
    setReflectionText,
    saveJournal,
  } = useJournalStore();

  const [saved, setSaved] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'Akash';
  const fullName = user?.full_name || 'Akash Shiv';

  const handleSave = () => {
    saveJournal();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up">
      <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white/90 dark:bg-[#201c2e]/90 backdrop-blur-xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#372e50] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#37352f] dark:text-white">
                {fullName}'s Daily Journal & Reflection
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#9b9b9b]">
                Record daily gratitude, mood, and achievements
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Journal Saved ✓' : 'Save Entry'}</span>
          </button>
        </div>

        {/* Mood Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#787774] dark:text-[#9b9b9b]">
            How are you feeling today, {firstName}?
          </label>
          <div className="grid grid-cols-5 gap-3">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.emoji)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center space-y-1 ${
                  selectedMood === m.emoji
                    ? `${m.color} border-2 shadow-md scale-105 font-bold`
                    : 'bg-[#f7f7f5] dark:bg-[#252036] border-[#e9e9e7] dark:border-[#372e50] text-[#787774]'
                }`}
              >
                <span className="text-2xl hover:scale-125 transition-transform">{m.emoji}</span>
                <span className="text-[11px] font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Gratitude Logs */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Heart className="w-4 h-4 fill-purple-400" />
            <span>3 Things I'm Grateful For Today</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={gratitude1}
              onChange={(e) => setGratitude1(e.target.value)}
              placeholder="1. What went well today?..."
              className="w-full px-3.5 py-2 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
            />
            <input
              type="text"
              value={gratitude2}
              onChange={(e) => setGratitude2(e.target.value)}
              placeholder="2. Someone or something that helped me..."
              className="w-full px-3.5 py-2 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
            />
            <input
              type="text"
              value={gratitude3}
              onChange={(e) => setGratitude3(e.target.value)}
              placeholder="3. A small win I experienced..."
              className="w-full px-3.5 py-2 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
            />
          </div>
        </div>

        {/* Reflection Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#787774] dark:text-[#9b9b9b]">
            Daily Key Wins & Reflection Log
          </label>
          <textarea
            rows={4}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write down your achievements, thoughts, and ideas for tomorrow..."
            className="w-full p-3.5 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-2xl text-xs outline-none focus:border-purple-500 leading-relaxed font-medium"
          />
        </div>
      </div>
    </div>
  );
};
