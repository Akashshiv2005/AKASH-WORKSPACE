import React, { useState } from 'react';
import {
  BookOpen,
  Heart,
  CheckCircle2,
  Save,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useJournalStore } from '../../store/useJournalStore';
import { useAuthStore } from '../../store/useAuthStore';

const MOODS = [
  { emoji: '🚀', label: 'Motivated', color: 'bg-purple-500/10 border-purple-500/30 text-purple-600' },
  { emoji: '⚡', label: 'Energetic', color: 'bg-amber-500/10 border-amber-500/30 text-amber-600' },
  { emoji: '🎯', label: 'Focused', color: 'bg-red-500/10 border-red-500/30 text-red-600' },
  { emoji: '🧘', label: 'Calm', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' },
  { emoji: '😊', label: 'Happy', color: 'bg-rose-500/10 border-rose-500/30 text-rose-600' },
];

export const DailyJournal: React.FC = () => {
  const { user } = useAuthStore();
  const {
    entries,
    selectedDate,
    selectedMood,
    energyLevel,
    rating,
    gratitude1,
    gratitude2,
    gratitude3,
    reflectionText,
    setSelectedDate,
    setMood,
    setEnergyLevel,
    setRating,
    setGratitude1,
    setGratitude2,
    setGratitude3,
    setReflectionText,
    saveJournalEntry,
    deleteJournalEntry,
  } = useJournalStore();

  const [saved, setSaved] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'Akash';
  const fullName = user?.full_name || 'Akash Shiv';

  const handleSave = () => {
    saveJournalEntry();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDateChange = (offset: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + offset);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up">
      {/* Main Journal Card */}
      <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white/90 dark:bg-[#201c2e]/90 backdrop-blur-xl p-6 shadow-2xl space-y-6">
        
        {/* Top Header & Date Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e9e9e7] dark:border-[#372e50] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#37352f] dark:text-white flex items-center space-x-2">
                <span>{fullName}'s Executive Daily Diary</span>
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#9b9b9b]">
                Select date, track mood, gratitudes, and reflections
              </p>
            </div>
          </div>

          {/* Date Selector Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-1.5 hover:bg-white dark:hover:bg-[#28223c] rounded-xl text-zinc-600 dark:text-zinc-300 transition-all"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 px-3 py-1 text-xs font-bold text-zinc-800 dark:text-zinc-100">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer text-zinc-800 dark:text-zinc-100"
                />
              </div>

              <button
                onClick={() => handleDateChange(1)}
                className="p-1.5 hover:bg-white dark:hover:bg-[#28223c] rounded-xl text-zinc-600 dark:text-zinc-300 transition-all"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105 shrink-0"
            >
              {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Diary Saved ✓' : 'Save Entry'}</span>
            </button>
          </div>
        </div>

        {/* Selected Date Header */}
        <div className="flex items-center justify-between bg-purple-50/70 dark:bg-purple-950/20 px-4 py-2.5 rounded-2xl border border-purple-200/50 dark:border-purple-800/30">
          <span className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Editing Entry for: {formatDisplayDate(selectedDate)}</span>
          </span>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            {entries.some((e) => e.date === selectedDate) ? '✓ Logged' : '✍️ Draft'}
          </span>
        </div>

        {/* Mood & Energy & Productivity Rating Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mood Selector */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-[#787774] dark:text-[#9b9b9b]">
              How are you feeling today, {firstName}?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.emoji)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center space-y-1 ${
                    selectedMood === m.emoji
                      ? `${m.color} border-2 shadow-md scale-105 font-bold`
                      : 'bg-[#f7f7f5] dark:bg-[#252036] border-[#e9e9e7] dark:border-[#372e50] text-[#787774]'
                  }`}
                >
                  <span className="text-2xl hover:scale-125 transition-transform">{m.emoji}</span>
                  <span className="text-[10px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy & Productivity Rating */}
          <div className="space-y-4 bg-[#f7f7f5] dark:bg-[#252036] p-4 rounded-2xl border border-[#e9e9e7] dark:border-[#372e50]">
            {/* Energy Level */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#787774] dark:text-[#9b9b9b]">
                Energy Level
              </label>
              <div className="flex items-center space-x-1.5">
                {(['High', 'Medium', 'Low'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setEnergyLevel(lvl)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      energyLevel === lvl
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-[#1a1726] border-[#e9e9e7] dark:border-[#372e50] text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {lvl === 'High' ? '⚡ High' : lvl === 'Medium' ? '🔋 Med' : '🪫 Low'}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#787774] dark:text-[#9b9b9b]">
                Daily Productivity Rating
              </label>
              <div className="flex items-center space-x-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 ml-2">
                  {rating}/5 Stars
                </span>
              </div>
            </div>
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
            Daily Key Wins & Reflection Journal Notes
          </label>
          <textarea
            rows={4}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write down your achievements, thoughts, ideas, and reflections for today..."
            className="w-full p-3.5 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-2xl text-xs outline-none focus:border-purple-500 leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* Past Diary Log History */}
      <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white/90 dark:bg-[#201c2e]/90 backdrop-blur-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#e9e9e7] dark:border-[#372e50] pb-3">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-zinc-900 dark:text-white">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Past Daily Diary History ({entries.length} Entries Logged)</span>
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-xs text-zinc-500 italic p-4 text-center">No past diary entries saved yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedDate(entry.date)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  entry.date === selectedDate
                    ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 shadow-md'
                    : 'bg-[#f7f7f5] dark:bg-[#1a1726] border-[#e9e9e7] dark:border-[#372e50] hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{entry.selectedMood || '🚀'}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {formatDisplayDate(entry.date)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
                      {entry.energyLevel || 'High'} Energy
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                        {entry.rating || 5}/5
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJournalEntry(entry.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Gratitude summary */}
                {(entry.gratitude1 || entry.gratitude2 || entry.gratitude3) && (
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5 bg-white/60 dark:bg-[#201c2e]/60 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                    {entry.gratitude1 && <p className="truncate">🙏 {entry.gratitude1}</p>}
                    {entry.gratitude2 && <p className="truncate">🙏 {entry.gratitude2}</p>}
                    {entry.gratitude3 && <p className="truncate">🙏 {entry.gratitude3}</p>}
                  </div>
                )}

                {/* Reflection summary */}
                {entry.reflectionText && (
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 italic font-medium">
                    "{entry.reflectionText}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
