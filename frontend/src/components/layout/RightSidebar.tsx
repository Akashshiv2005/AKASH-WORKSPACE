import React, { useState, useEffect } from 'react';
import {
  PanelRightClose,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Award,
  Flame,
  Brain,
  TrendingUp,
  Target,
  ListTodo,
  Smile,
  BookOpen,
  FileText,
  Volume2,
  Shield,
  X
} from 'lucide-react';
import { usePageStore } from '../../store/usePageStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useJournalStore } from '../../store/useJournalStore';

interface RightSidebarProps {
  isOpen: boolean;
  toggleRightSidebar: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  toggleRightSidebar,
}) => {
  const { pages, activePageId, createPage } = usePageStore();
  const activePage = pages.find((p) => p.id === activePageId);
  const { user } = useAuthStore();
  const userFirstName = user?.full_name?.split(' ')[0] || 'Akash';

  // Dynamic Stores
  const { habits, getBestStreak, getOverallPercentage, getTotalCheckmarks, getMaxPossibleCheckmarks } = useHabitStore();
  const { tasks } = useTaskStore();
  const { selectedMood, gratitude1, gratitude2, gratitude3 } = useJournalStore();

  // Focus Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(3);
  const [showAssistantBox, setShowAssistantBox] = useState(true);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setSessionsCount((prev) => prev + 1);
      setTimeLeft(25 * 60);
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const widgetType = activePage?.widget_type;

  // Dynamic Habit Stats
  const bestStreak = getBestStreak();
  const overallPercentage = getOverallPercentage();
  const totalCheckmarks = getTotalCheckmarks();
  const maxCheckmarks = getMaxPossibleCheckmarks();

  // Dynamic Task Stats
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High').length;
  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriorityTasks = tasks.filter((t) => t.priority === 'Low').length;

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Dynamic Document Metrics
  const pageTitle = activePage?.title || '';
  const contentText = typeof activePage?.content === 'string' ? activePage.content.replace(/<[^>]*>/g, ' ') : '';
  const rawWords = `${pageTitle} ${contentText}`.trim().split(/\s+/).filter(Boolean);
  const wordCount = pageTitle ? rawWords.length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden" 
        onClick={toggleRightSidebar}
      />
      <aside className="fixed right-0 md:relative z-50 w-64 h-screen bg-[#faf9f6] backdrop-blur-xl border-l border-zinc-200 flex flex-col shrink-0 select-none transition-all animate-slide-in-right font-['Sora'] text-zinc-900">
      {/* Header Bar */}
      <div className="p-3 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 shadow-xs">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xs font-black tracking-wide text-amber-700 uppercase animate-text-float">
            {widgetType === 'habit_tracker'
              ? 'HABIT INSPECTOR'
              : widgetType === 'todo_planner'
              ? 'TASK INSPECTOR'
              : widgetType === 'pomodoro'
              ? 'FOCUS DOCK'
              : widgetType === 'journal'
              ? 'JOURNAL DOCK'
              : 'PAGE DOCK'}
          </span>
        </div>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-zinc-900"
          title="Close Dock"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Main Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs select-none">
        {/* DYNAMIC OPTION 1: HABIT TRACKER ACTIVE */}
        {widgetType === 'habit_tracker' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Active Streak Card */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2 text-center animate-float">
              <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-bold">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
                <span className="uppercase text-[10px] tracking-wider text-slate-400 font-black">ACTIVE STREAK</span>
              </div>
              <div className="text-3xl font-black text-amber-400 shimmer-text-orange">
                {bestStreak} {bestStreak === 1 ? 'Day' : 'Days'} Active
              </div>
              <p className="text-[11px] text-slate-400">
                {habits.length} daily habits configured
              </p>
            </div>

            {/* Weekly Completion Progress */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                <span className="flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span className="uppercase text-[10px] tracking-wider text-zinc-500 font-black">WEEKLY GOAL</span>
                </span>
                <span className="text-amber-600 font-black text-sm">{overallPercentage}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200">
                <div style={{ width: `${overallPercentage}%` }} className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500" />
              </div>
              <p className="text-[10px] text-zinc-500 text-right font-medium">
                {totalCheckmarks} of {maxCheckmarks} checked
              </p>
            </div>

            {/* JARVIS Habit Advice */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px]">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span className="uppercase text-[10px] tracking-wider font-black">JARVIS HABIT ADVICE</span>
              </div>
              <p className="text-[11px] text-zinc-700 leading-relaxed font-medium">
                Consistency beats intensity every single time, {userFirstName}. Keep your streak alive!
              </p>
            </div>

            {/* JARVIS Assistant Teaser */}
            {showAssistantBox && (
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2 relative animate-fade-in-up">
                <button
                  onClick={() => setShowAssistantBox(false)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="uppercase text-[10px] tracking-wider font-black">JARVIS ASSISTANT</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Need habit advice or task assistance, {userFirstName}?
                </p>
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC OPTION 2: TASK PLANNER & KANBAN ACTIVE */}
        {widgetType === 'todo_planner' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Priority Operations Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-3">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider animate-text-float font-black">OPERATIONS BREAKDOWN</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-950/50 border border-rose-500/30">
                  <span className="text-rose-300 font-bold text-xs">High Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs">{highPriorityTasks} Tasks</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/50 border border-amber-500/30">
                  <span className="text-amber-300 font-bold text-xs">Medium Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs">{mediumPriorityTasks} Tasks</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                  <span className="text-emerald-300 font-bold text-xs">Low Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs">{lowPriorityTasks} Tasks</span>
                </div>
              </div>
            </div>

            {/* Column Pipeline Ratios */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <ListTodo className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider font-black">PIPELINE STATUS</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/25">
                  <div className="font-black text-rose-400 text-sm">{todoCount}</div>
                  <div className="text-[10px] text-slate-400">To Do</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/25">
                  <div className="font-black text-amber-400 text-sm">{inProgressCount}</div>
                  <div className="text-[10px] text-slate-400">In Progress</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/25">
                  <div className="font-black text-emerald-400 text-sm">{completedCount}</div>
                  <div className="text-[10px] text-slate-400">Done</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC OPTION 3: ARC FOCUS STATION / POMODORO ACTIVE */}
        {widgetType === 'pomodoro' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Full Focus Timer Widget */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-3 text-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="uppercase tracking-wider font-black">Focus Station</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  {sessionsCount} Done
                </span>
              </div>

              <div className="text-3xl font-black font-mono text-red-600">
                {formattedTime}
              </div>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 ${
                    isRunning ? 'bg-zinc-800 text-white' : 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(25 * 60);
                  }}
                  className="p-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audio Presets */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="uppercase tracking-wider font-black">Ambient Focus Audio</span>
              </div>
              <div className="space-y-1.5">
                <button className="w-full text-left p-2 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-zinc-200 text-zinc-800 font-medium text-[11px]">
                  🎧 Deep Concentration (432Hz)
                </button>
                <button className="w-full text-left p-2 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-zinc-200 text-zinc-800 font-medium text-[11px]">
                  🌧️ High Altitude Rain & Focus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC OPTION 4: DAILY JOURNAL ACTIVE */}
        {widgetType === 'journal' && (() => {
          const moodLabelMap: Record<string, string> = {
            '🚀': 'Motivated',
            '⚡': 'Energetic',
            '🎯': 'Focused',
            '🧘': 'Calm',
            '😊': 'Happy',
          };
          const moodName = moodLabelMap[selectedMood] || 'Reflective';
          const gratitudeItems = [gratitude1, gratitude2, gratitude3].filter((g) => g && g.trim());
          return (
            <div className="space-y-3 animate-fade-in-up">
              {/* Today's Mood Status */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2 text-center animate-float">
                <div className="flex items-center justify-center space-x-1 text-amber-400 font-bold text-[11px]">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span className="uppercase tracking-wider font-black">Logged Mood</span>
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {selectedMood || '🚀'} {moodName}
                </div>
                <p className="text-[11px] text-slate-400">{userFirstName}'s mood logged today</p>
              </div>

              {/* Gratitude Counter */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-100">
                  <span className="flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span className="uppercase tracking-wider text-[10px] text-slate-400 font-black">Gratitude Logs</span>
                  </span>
                  <span className="text-amber-400 font-black">{gratitudeItems.length} / 3</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {gratitude1 ? <p className="truncate">✓ 1. {gratitude1}</p> : <p className="text-slate-500 italic">1. Add gratitude in journal</p>}
                  {gratitude2 ? <p className="truncate">✓ 2. {gratitude2}</p> : <p className="text-slate-500 italic">2. Add gratitude in journal</p>}
                  {gratitude3 ? <p className="truncate">✓ 3. {gratitude3}</p> : <p className="text-slate-500 italic">3. Add gratitude in journal</p>}
                </div>
              </div>
            </div>
          );
        })()}

        {/* DYNAMIC OPTION 5: DEFAULT STANDARD DOCUMENT PAGE */}
        {!widgetType && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Page Metrics Inspector */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-3">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider animate-text-float font-black">Page Inspector</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Word Count</span>
                  <span className="font-bold text-slate-100">{wordCount} Words</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reading Time</span>
                  <span className="font-bold text-slate-100">~{readingTime} Min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Modified</span>
                  <span className="font-bold text-amber-400">Just Now</span>
                </div>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-700 font-bold text-[11px]">
                <Brain className="w-3.5 h-3.5 text-amber-600" />
                <span className="uppercase tracking-wider font-black">JARVIS Tools</span>
              </div>
              <button
                onClick={() => createPage('workspace-akash-shiv', null, 'Daily Habit Tracker', 'habit_tracker')}
                className="w-full text-left p-2 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-zinc-200 text-zinc-800 font-semibold text-[11px]"
              >
                🔥 Habit Tracker
              </button>
              <button
                onClick={() => createPage('workspace-akash-shiv', null, 'Arc Focus Station', 'pomodoro')}
                className="w-full text-left p-2 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-zinc-200 text-zinc-800 font-semibold text-[11px]"
              >
                ⚡ Arc Focus Timer
              </button>
            </div>
          </div>
        )}

        {/* Global Performance Footer */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span className="uppercase tracking-wider font-black text-[10px]">Executive Level</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black">
              MAX
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
            {userFirstName}, your daily productivity score is {overallPercentage > 0 ? `${overallPercentage}%` : '100%'}.
          </p>
        </div>
      </div>
    </aside>
    </>
  );
};

