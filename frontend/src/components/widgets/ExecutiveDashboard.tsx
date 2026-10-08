import React from 'react';
import {
  Shield,
  Flame,
  CheckSquare,
  BookOpen,
  DollarSign,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useJournalStore } from '../../store/useJournalStore';
import { usePageStore } from '../../store/usePageStore';
import { useAuthStore } from '../../store/useAuthStore';

interface ExecutiveDashboardProps {
  onNavigateToWidget?: (widgetType: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onNavigateToWidget }) => {
  const { user } = useAuthStore();
  const { tasks, updateStatus } = useTaskStore();
  const { habits, toggleDay, getBestStreak, getOverallPercentage, getTotalCheckmarks } = useHabitStore();
  const { getTotalExpenses, savingsGoal } = useExpenseStore();
  const { entries, selectedMood, gratitude1, gratitude2, gratitude3, reflectionText } = useJournalStore();
  const { setActivePageId, pages } = usePageStore();

  const fullName = user?.full_name || 'Akash Shiv';

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'completed');

  const totalSpent = getTotalExpenses();
  const budget = savingsGoal || 5000;
  const budgetPercent = Math.min(100, Math.round((totalSpent / (budget || 1)) * 100));

  const overallScore = getOverallPercentage();
  const bestStreak = getBestStreak();

  const navigateTo = (widgetType: string) => {
    const page = pages.find((p) => p.widget_type === widgetType);
    if (page) {
      setActivePageId(page.id);
    } else if (onNavigateToWidget) {
      onNavigateToWidget(widgetType);
    }
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up">
      {/* Top Welcome Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white p-6 shadow-2xl space-y-3">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 fill-amber-200" />
              <span>Iron Man Executive Workspace Control</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Welcome back, {fullName}! ⚡
            </h1>
            <p className="text-xs text-amber-100 font-medium max-w-xl">
              Here is your live 360° workspace overview. All your tasks, habits, daily reflections, and expenses in one central dashboard.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-300">{overallScore}%</div>
              <div className="text-[10px] text-amber-100 font-bold uppercase">Productivity</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-xl font-black text-rose-300">{bestStreak}d</div>
              <div className="text-[10px] text-amber-100 font-bold uppercase">Best Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Executive Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Habit Kpi */}
        <div
          onClick={() => navigateTo('habit_tracker')}
          className="p-5 rounded-3xl bg-white dark:bg-[#201c2e] border border-[#e9e9e7] dark:border-[#372e50] shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 font-bold">
              <Flame className="w-5 h-5 text-amber-500" />
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center">
              <span>{getTotalCheckmarks()} Checked</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{bestStreak} Days</div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Habit Streak</div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${overallScore}%` }} />
          </div>
        </div>

        {/* Task Kpi */}
        <div
          onClick={() => navigateTo('todo_planner')}
          className="p-5 rounded-3xl bg-white dark:bg-[#201c2e] border border-[#e9e9e7] dark:border-[#372e50] shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 font-bold">
              <CheckSquare className="w-5 h-5 text-red-500" />
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center">
              <span>{completedTasks}/{totalTasks} Done</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">{inProgressTasks + highPriorityTasks.length} Pending</div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tasks Needing Focus</div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Daily Journal Kpi */}
        <div
          onClick={() => navigateTo('journal')}
          className="p-5 rounded-3xl bg-white dark:bg-[#201c2e] border border-[#e9e9e7] dark:border-[#372e50] shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 font-bold">
              <BookOpen className="w-5 h-5 text-purple-500" />
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center">
              <span>{entries.length} Entries Logged</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white flex items-center space-x-1">
              <span>{selectedMood || '🚀'}</span>
              <span className="text-lg">Logged Today</span>
            </div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Daily Diary Mood & Reflection</div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Expense Kpi */}
        <div
          onClick={() => navigateTo('expense_tracker')}
          className="p-5 rounded-3xl bg-white dark:bg-[#201c2e] border border-[#e9e9e7] dark:border-[#372e50] shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <span>₹{totalSpent.toLocaleString()} Spent</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">₹{(budget - totalSpent).toLocaleString()}</div>
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Remaining Monthly Budget</div>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${budgetPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Workspace 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's Tasks & Priority Board */}
        <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white dark:bg-[#201c2e] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">High Priority & Active Tasks</h3>
            </div>
            <button
              onClick={() => navigateTo('todo_planner')}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
            >
              View All Tasks →
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-4 text-center">No tasks on board. Add a task to start tracking!</p>
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] text-xs font-medium"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className={`truncate font-semibold text-zinc-800 dark:text-zinc-200 ${task.status === 'completed' ? 'line-through text-zinc-400' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  <button
                    onClick={() => updateStatus('workspace-akash-shiv', task.id, task.status === 'completed' ? 'todo' : 'completed')}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500 hover:text-white'
                    }`}
                  >
                    {task.status === 'completed' ? 'Done ✓' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Habits Quick Tracker */}
        <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white dark:bg-[#201c2e] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Active Habit Tracker Overview</h3>
            </div>
            <button
              onClick={() => navigateTo('habit_tracker')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Manage Habits →
            </button>
          </div>

          {habits.length === 0 ? (
            <p className="text-xs text-zinc-500 italic p-4 text-center">No active habits configured.</p>
          ) : (
            <div className="space-y-2.5">
              {habits.slice(0, 5).map((habit) => {
                const todayIdx = (new Date().getDay() + 6) % 7; // Mon -> 0
                const isChecked = habit.completedDays ? habit.completedDays[todayIdx] : false;
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] text-xs font-medium"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-base">{habit.icon}</span>
                      <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">{habit.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                        {habit.streak}d streak
                      </span>
                    </div>

                    <button
                      onClick={() => toggleDay('workspace-akash-shiv', habit.id, todayIdx)}
                      className={`p-1.5 rounded-xl border transition-all shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white dark:bg-[#201c2e] text-zinc-400 border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Latest Journal Entry Digest Card */}
      <div className="rounded-3xl border border-[#e9e9e7] dark:border-[#372e50] bg-white dark:bg-[#201c2e] p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-extrabold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Today's Logged Daily Reflection</span>
          </div>
          <button
            onClick={() => navigateTo('journal')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Open Daily Journal →
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-purple-50/70 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 font-bold text-zinc-900 dark:text-white">
              <span className="text-xl">{selectedMood || '🚀'}</span>
              <span>Logged Mood Today</span>
            </div>
            {reflectionText ? (
              <p className="text-zinc-700 dark:text-zinc-300 italic font-medium">"{reflectionText}"</p>
            ) : (
              <p className="text-zinc-500 italic">No notes written for today yet. Click "Open Daily Journal" to record your entry!</p>
            )}
          </div>

          {(gratitude1 || gratitude2 || gratitude3) && (
            <div className="space-y-1 text-purple-800 dark:text-purple-300 font-medium bg-white/70 dark:bg-[#1a1726] p-3 rounded-xl border border-purple-200/60 dark:border-purple-800 shrink-0 min-w-48">
              <div className="font-bold text-[11px] text-purple-900 dark:text-purple-200">Grateful For:</div>
              {gratitude1 && <p className="truncate">• {gratitude1}</p>}
              {gratitude2 && <p className="truncate">• {gratitude2}</p>}
              {gratitude3 && <p className="truncate">• {gratitude3}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
