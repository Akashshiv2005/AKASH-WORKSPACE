import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Flame,
  Trophy,
  Calendar,
  Trash2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  MoreHorizontal,
  Mail
} from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HabitTracker: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const workspaceId = activeWorkspace?.id || 'workspace-akash-shiv';

  const {
    habits,
    archivedHabits,
    fetchHabits,
    toggleDay,
    addHabit,
    deleteHabit,
    restoreHabit,
    permanentlyDeleteHabit,
    resetWeek,
    clearAllHabits,
    resetDefaultHabits,
    getTotalCheckmarks,
    getMaxPossibleCheckmarks,
    getOverallPercentage,
    getBestStreak,
  } = useHabitStore();

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('🎯');
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchHabits(workspaceId);
    }
  }, [workspaceId]);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(workspaceId, newHabitName, newHabitIcon);
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  const totalCheckmarks = getTotalCheckmarks();
  const maxPossible = getMaxPossibleCheckmarks();
  const overallPercentage = getOverallPercentage();
  const bestStreak = getBestStreak();

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up font-['Sora']">
      {/* Header Summary Cards (Fully Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Weekly Completion Rate */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-[#fff3e5] text-[#ff7a00] shadow-xs">
            <TrendingUp className="w-5 h-5 text-[#ff7a00]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#ff7a00] shimmer-text-orange">
              {overallPercentage}%
            </div>
            <div className="text-xs font-bold text-[#78716c]">Weekly Progress</div>
          </div>
        </div>

        {/* Current Best Streak */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-[#fff3e5] text-[#ff7a00] shadow-xs">
            <Flame className="w-5 h-5 fill-[#ff7a00] text-[#ff7a00]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#ff7a00] shimmer-text-orange">
              {bestStreak} Days
            </div>
            <div className="text-xs font-bold text-[#78716c]">Active Streak</div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="p-4 rounded-2xl bg-white border border-[#f2e8da] flex items-center space-x-4 shadow-xs hover:scale-[1.02] transition-all stark-hud-card">
          <div className="p-3 rounded-xl bg-[#fff3e5] text-[#ff7a00] shadow-xs">
            <Trophy className="w-5 h-5 text-[#ff7a00]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#ff7a00]">
              {totalCheckmarks} / {maxPossible}
            </div>
            <div className="text-xs font-bold text-[#78716c]">Habits Checked</div>
          </div>
        </div>
      </div>

      {/* Main Habit Table Container */}
      <div className="rounded-2xl border border-[#f2e8da] bg-white shadow-xs overflow-hidden stark-hud-card">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-[#f2e8da] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#ff7a00]" />
            <h3 className="text-sm font-black text-[#1c1917] tracking-wide">Weekly Tracker Grid</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsAddingHabit(true);
                setIsTrashOpen(false);
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-xs transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </button>

            {/* Three Dots (...) More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center ${
                  isMenuOpen
                    ? 'bg-[#ff7a00] text-white border-[#ff7a00] shadow-xs'
                    : 'border-[#f0e8dc] hover:bg-[#faf7f2] text-[#78716c]'
                }`}
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-10 w-56 bg-white border border-[#f0e8dc] rounded-2xl shadow-xl p-1.5 z-30 animate-fade-in-up space-y-1">
                    <button
                      onClick={() => {
                        resetWeek(workspaceId);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00] transition-colors text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span>Reset Week</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTrashOpen(!isTrashOpen);
                        setIsAddingHabit(false);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                        isTrashOpen
                          ? 'bg-[#fff3e5] text-[#ff7a00]'
                          : 'text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00]'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#78716c]" />
                      <span>{isTrashOpen ? 'Hide Trash Bin' : `View Trash Bin (${archivedHabits.length})`}</span>
                    </button>

                    <div className="h-[1px] bg-[#f2e8da] my-1" />

                    <button
                      onClick={() => {
                        resetDefaultHabits(workspaceId);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00] transition-colors text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span>Restore Demo Habits</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        useNotificationStore.getState().setModalOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00] transition-colors text-left"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span>Email Daily Reminders</span>
                    </button>

                    <div className="h-[1px] bg-[#f2e8da] my-1" />

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (habits.length === 0) return;
                        if (window.confirm("Move all habits to the Trash Bin? You can restore them anytime.")) {
                          clearAllHabits(workspaceId);
                        }
                      }}
                      disabled={habits.length === 0}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                        habits.length === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Clear All to Trash</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Recycle Bin Inline View */}
        {isTrashOpen && (
          <div className="p-4 bg-[#faf7f2] border-b border-[#f0e8dc] animate-fade-in-up">
            <h4 className="text-xs font-bold text-[#1c1917] mb-3">Recycle Bin (Habits Saved in Trash)</h4>
            {archivedHabits.length === 0 ? (
              <p className="text-xs text-[#a8a29e]">Trash Bin is empty. No archived habits.</p>
            ) : (
              <div className="space-y-2">
                {archivedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#f0e8dc] text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{habit.icon}</span>
                      <span className="font-semibold text-[#1c1917]">{habit.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => restoreHabit(workspaceId, habit.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#ff7a00] hover:bg-[#fff3e5] rounded-lg transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => permanentlyDeleteHabit(workspaceId, habit.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Habit Form */}
        {isAddingHabit && (
          <form
            onSubmit={handleAddHabit}
            className="p-4 bg-[#fffaf3] border-b border-[#ffe9d1] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in-up"
          >
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={newHabitIcon}
                onChange={(e) => setNewHabitIcon(e.target.value)}
                className="w-10 text-center text-lg p-1.5 rounded-xl border border-[#ffd8b3] bg-white outline-none"
                placeholder="🎯"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="New habit name (e.g., Read 20 Pages, Drink Water)..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#ffd8b3] bg-white text-xs outline-none focus:border-[#ff7a00] transition-colors"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAddingHabit(false)}
                className="px-3 py-2 text-xs font-semibold text-[#78716c] hover:bg-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white text-xs font-bold rounded-xl shadow-xs hover:scale-105 transition-all"
              >
                Save Habit
              </button>
            </div>
          </form>
        )}

        {/* Table Header Row */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 p-3 bg-[#fbf8f3] border-b border-[#f2e8da] text-xs font-black text-[#ff7a00] uppercase tracking-wider">
          <div className="col-span-4 pl-2">Habit Target</div>
          <div className="col-span-7 grid grid-cols-7 text-center">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="col-span-1 text-center">Streak</div>
        </div>

        {/* Habit Rows */}
        <div className="divide-y divide-[#f2e8da]">
          {habits.length === 0 && !isAddingHabit && (
            <div className="p-8 text-center animate-fade-in-up">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-sm font-black text-[#1c1917] mb-1">No Habits Found</h3>
              <p className="text-xs text-[#a8a29e] mb-4">
                You have cleared all your habits to the Trash Bin. Add a new one or restore habits anytime!
              </p>
              <button
                onClick={() => resetDefaultHabits(workspaceId)}
                className="px-4 py-2 bg-[#fff3e5] text-[#ff7a00] font-bold text-xs rounded-xl hover:bg-[#ffe0c2] transition-colors inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Demo Habits</span>
              </button>
            </div>
          )}
          {habits.map((habit) => {
            const completedDaysList = habit.completedDays || [false, false, false, false, false, false, false];
            const completedCount = completedDaysList.filter(Boolean).length;
            const progressPct = Math.round((completedCount / 7) * 100);

            return (
              <div
                key={habit.id}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 p-4 sm:p-3 items-start sm:items-center hover:bg-[#fffaf3] transition-colors group"
              >
                {/* Habit Info & Progress */}
                <div className="w-full sm:col-span-4 flex items-center justify-between sm:justify-start space-x-3 sm:pl-2 min-w-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-xl shrink-0 hover:scale-125 transition-transform">{habit.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#1c1917] truncate">
                        {habit.name}
                      </div>
                      <div className="w-full bg-[#f0e8dc] h-2 rounded-full mt-1 overflow-hidden">
                        <div
                          style={{ width: `${progressPct}%` }}
                          className="h-full bg-gradient-to-r from-[#ff7a00] to-[#ffaa00] transition-all duration-500 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Streak & Delete */}
                  <div className="sm:hidden flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#fff3e5] text-[#ff7a00] border border-[#ffe0c2]">
                      <Flame className="w-3 h-3 fill-[#ff7a00]" />
                      <span>{habit.streak}</span>
                    </span>
                    <button
                      onClick={() => deleteHabit(workspaceId, habit.id)}
                      className="p-1 text-[#a8a29e] hover:text-red-500 transition-opacity"
                      title="Move to trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Days Checkboxes */}
                <div className="w-full sm:col-span-7 grid grid-cols-7 text-center items-center mt-2 sm:mt-0">
                  {completedDaysList.map((isDone, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center space-y-1.5">
                      <span className="sm:hidden text-[10px] font-bold text-[#a8a29e] uppercase">
                        {DAYS_OF_WEEK[idx].charAt(0)}
                      </span>
                      <button
                        onClick={() => toggleDay(workspaceId, habit.id, idx)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isDone
                            ? `bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white shadow-sm scale-105 orange-pulse`
                            : 'bg-white hover:bg-[#faf7f2] text-transparent border-2 border-[#e7dfd4]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop Streak Counter & Delete */}
                <div className="hidden sm:flex col-span-1 items-center justify-center space-x-1">
                  <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#fff3e5] text-[#ff7a00] border border-[#ffe0c2]">
                    <Flame className="w-3 h-3 fill-[#ff7a00]" />
                    <span>{habit.streak}</span>
                  </span>
                  <button
                    onClick={() => deleteHabit(workspaceId, habit.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                    title="Move to trash"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-[#faf7f2] border-t border-[#f2e8da] flex items-center justify-between text-[11px] text-[#a8a29e] font-medium">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>Habits and checkmarks automatically sync to the database.</span>
          </div>
          <span className="hidden sm:inline text-[10px] text-[#b0a89d]">More actions in ••• menu</span>
        </div>
      </div>
    </div>
  );
};
