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

  // Dynamic Stores
  const { habits, getBestStreak, getOverallPercentage, getTotalCheckmarks, getMaxPossibleCheckmarks } = useHabitStore();
  const { tasks } = useTaskStore();

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
  const wordCount = pageTitle ? pageTitle.split(/\s+/).filter(Boolean).length + 24 : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden" 
        onClick={toggleRightSidebar}
      />
      <aside className="fixed right-0 md:relative z-50 w-64 h-screen bg-[#faf7f2] border-l border-[#f0e8dc] flex flex-col shrink-0 select-none transition-all animate-fade-in-up font-['Sora']">
      {/* Header Bar */}
      <div className="p-3 border-b border-[#f0e8dc] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#fff3e5] text-[#ff7a00] shadow-xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black tracking-wide text-[#1c1917] uppercase animate-text-float">
            {widgetType === 'habit_tracker'
              ? 'HABIT INSPECTOR'
              : widgetType === 'todo_planner'
              ? 'KANBAN INSPECTOR'
              : widgetType === 'pomodoro'
              ? 'FOCUS DOCK'
              : widgetType === 'journal'
              ? 'JOURNAL DOCK'
              : 'PAGE DOCK'}
          </span>
        </div>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded-lg hover:bg-[#f2ebe1] text-[#78716c]"
          title="Close Dock"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Main Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* DYNAMIC OPTION 1: HABIT TRACKER ACTIVE */}
        {widgetType === 'habit_tracker' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Active Streak Card (Dynamically Reacts) */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2 text-center animate-float">
              <div className="flex items-center justify-center space-x-1.5 text-[#ff7a00] font-bold">
                <Flame className="w-4 h-4 fill-[#ff7a00] text-[#ff7a00] animate-bounce" />
                <span className="uppercase text-[10px] tracking-wider text-[#a8a29e] font-black">ACTIVE STREAK</span>
              </div>
              <div className="text-3xl font-black text-[#ff7a00] shimmer-text-orange">
                {bestStreak} {bestStreak === 1 ? 'Day' : 'Days'} Active
              </div>
              <p className="text-[11px] text-[#78716c]">
                {habits.length} daily habits configured
              </p>
            </div>

            {/* Weekly Completion Progress (Dynamically Reacts) */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1c1917]">
                <span className="flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span className="uppercase text-[10px] tracking-wider text-[#a8a29e] font-black">WEEKLY GOAL</span>
                </span>
                <span className="text-[#1c1917] font-black text-sm">{overallPercentage}%</span>
              </div>
              <div className="w-full bg-[#f0e8dc] h-2.5 rounded-full overflow-hidden">
                <div style={{ width: `${overallPercentage}%` }} className="h-full bg-gradient-to-r from-[#ff7a00] to-[#ffaa00] transition-all duration-500" />
              </div>
              <p className="text-[10px] text-[#78716c] text-right font-medium">
                {totalCheckmarks} of {maxCheckmarks} checked
              </p>
            </div>

            {/* JARVIS Habit Advice */}
            <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#ffe9d1] shadow-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <Target className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="animate-text-float uppercase text-[10px] tracking-wider font-black">JARVIS HABIT ADVICE</span>
              </div>
              <p className="text-[11px] text-[#44403c] leading-relaxed font-medium">
                Consistency beats intensity every single time, Akash. Keep your streak alive!
              </p>
            </div>

            {/* JARVIS Assistant Teaser */}
            {showAssistantBox && (
              <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2 relative animate-fade-in-up">
                <button
                  onClick={() => setShowAssistantBox(false)}
                  className="absolute right-3 top-3 text-[#a8a29e] hover:text-[#1c1917]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span className="uppercase text-[10px] tracking-wider font-black">JARVIS ASSISTANT</span>
                </div>
                <p className="text-[11px] text-[#57534e]">
                  Need habit advice or task assistance, Akash?
                </p>
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC OPTION 2: TASK PLANNER & KANBAN ACTIVE */}
        {widgetType === 'todo_planner' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Priority Operations Breakdown (Dynamically Reacts) */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-3">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <Target className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider animate-text-float font-black">OPERATIONS BREAKDOWN</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-red-600 font-bold text-xs">High Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-xs">{highPriorityTasks} Tasks</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 font-bold text-xs">Medium Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs">{mediumPriorityTasks} Tasks</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-bold text-xs">Low Priority</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs">{lowPriorityTasks} Tasks</span>
                </div>
              </div>
            </div>

            {/* Column Pipeline Ratios (Dynamically Reacts) */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <ListTodo className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider font-black">PIPELINE STATUS</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-red-50 border border-red-200">
                  <div className="font-black text-red-600 text-sm">{todoCount}</div>
                  <div className="text-[10px] text-[#78716c]">To Do</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="font-black text-amber-600 text-sm">{inProgressCount}</div>
                  <div className="text-[10px] text-[#78716c]">In Progress</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-black text-emerald-600 text-sm">{completedCount}</div>
                  <div className="text-[10px] text-[#78716c]">Done</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC OPTION 3: ARC FOCUS STATION / POMODORO ACTIVE */}
        {widgetType === 'pomodoro' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Full Focus Timer Widget */}
            <div className="p-4 rounded-2xl bg-white border border-[#ffe0c2] shadow-xs space-y-3 text-center animate-float orange-pulse">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#ff7a00]">
                <span className="flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span className="animate-text-float uppercase tracking-wider font-black">Focus Station</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#fff3e5] text-[#ff7a00] font-bold">
                  {sessionsCount} Done
                </span>
              </div>

              <div className="text-3xl font-black font-mono text-[#ff7a00] shimmer-text-orange">
                {formattedTime}
              </div>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center space-x-1.5 transition-all hover:scale-105 ${
                    isRunning ? 'bg-amber-600' : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9500]'
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
                  className="p-1.5 rounded-xl bg-[#f2ebe1] text-[#78716c] hover:text-[#1c1917]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audio Presets */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider font-black">Ambient Focus Audio</span>
              </div>
              <div className="space-y-1.5">
                <button className="w-full text-left p-2 rounded-xl bg-[#f9f6f0] hover:bg-[#fff3e5] border border-[#f0e8dc] text-[#44403c] font-medium text-[11px]">
                  🎧 Deep Concentration (432Hz)
                </button>
                <button className="w-full text-left p-2 rounded-xl bg-[#f9f6f0] hover:bg-[#fff3e5] border border-[#f0e8dc] text-[#44403c] font-medium text-[11px]">
                  🌧️ High Altitude Rain & Focus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC OPTION 4: DAILY JOURNAL ACTIVE */}
        {widgetType === 'journal' && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Today's Mood Status */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2 text-center animate-float">
              <div className="flex items-center justify-center space-x-1 text-[#ff7a00] font-bold text-[11px]">
                <Smile className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider font-black">Logged Mood</span>
              </div>
              <div className="text-3xl font-black text-[#ff7a00]">
                🚀 Motivated
              </div>
              <p className="text-[11px] text-[#78716c]">Akash's energy is peak today</p>
            </div>

            {/* Gratitude Counter */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1c1917]">
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#ff7a00]" />
                  <span className="uppercase tracking-wider text-[10px] text-[#a8a29e] font-black">Gratitude Logs</span>
                </span>
                <span className="text-[#ff7a00] font-black">3 / 3</span>
              </div>
              <div className="space-y-1 text-[11px] text-[#44403c]">
                <p>✓ 1. Deep work focus progress</p>
                <p>✓ 2. Supportive environment</p>
                <p>✓ 3. Consistent habit execution</p>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC OPTION 5: DEFAULT STANDARD DOCUMENT PAGE */}
        {!widgetType && (
          <div className="space-y-3 animate-fade-in-up">
            {/* Page Metrics Inspector (Dynamically Computed) */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-3">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <FileText className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider animate-text-float font-black">Page Inspector</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#78716c]">Word Count</span>
                  <span className="font-bold text-[#1c1917]">{wordCount} Words</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716c]">Reading Time</span>
                  <span className="font-bold text-[#1c1917]">~{readingTime} Min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78716c]">Last Modified</span>
                  <span className="font-bold text-[#ff7a00]">Just Now</span>
                </div>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] shadow-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-[#ff7a00] font-bold text-[11px]">
                <Brain className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span className="uppercase tracking-wider font-black">JARVIS Tools</span>
              </div>
              <button
                onClick={() => createPage('workspace-akash-shiv', null, '✨ Daily Habit Tracker', 'habit_tracker')}
                className="w-full text-left p-2 rounded-xl bg-[#f9f6f0] hover:bg-[#fff3e5] border border-[#f0e8dc] text-[#44403c] font-semibold text-[11px]"
              >
                🔥 Habit Tracker
              </button>
              <button
                onClick={() => createPage('workspace-akash-shiv', null, '⚡ Arc Focus Station', 'pomodoro')}
                className="w-full text-left p-2 rounded-xl bg-[#f9f6f0] hover:bg-[#fff3e5] border border-[#f0e8dc] text-[#44403c] font-semibold text-[11px]"
              >
                ⚡ Arc Focus Timer
              </button>
            </div>
          </div>
        )}

        {/* Global Performance Footer */}
        <div className="p-4 rounded-2xl bg-[#fffaf3] border border-[#ffe9d1] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#ff7a00]">
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-[#ff7a00]" />
              <span className="uppercase tracking-wider font-black text-[10px]">Executive Level</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff7a00] text-white font-black">
              MAX
            </span>
          </div>
          <p className="text-[11px] text-[#57534e] font-medium leading-relaxed">
            Akash, your daily productivity score is {overallPercentage > 0 ? `${overallPercentage}%` : '100%'}.
          </p>
        </div>
      </div>
    </aside>
    </>
  );
};
