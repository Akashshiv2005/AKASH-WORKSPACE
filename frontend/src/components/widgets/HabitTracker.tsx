import React, { useState } from 'react';
import {
  Check,
  Plus,
  Flame,
  Trophy,
  Calendar,
  Trash2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { useHabitStore } from '../../store/useHabitStore';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const HabitTracker: React.FC = () => {
  const {
    habits,
    toggleDay,
    addHabit,
    deleteHabit,
    resetWeek,
    clearAllHabits,
    getTotalCheckmarks,
    getMaxPossibleCheckmarks,
    getOverallPercentage,
    getBestStreak,
  } = useHabitStore();

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('🎯');

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName, newHabitIcon);
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
        {/* Table Controls */}
        <div className="p-4 border-b border-[#f2e8da] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#ff7a00]" />
            <h3 className="text-sm font-black text-[#1c1917] tracking-wide">Weekly Tracker Grid</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={resetWeek}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#f0e8dc] hover:bg-[#faf7f2] text-xs font-semibold text-[#78716c] transition-all"
              title="Reset checkmarks for this week"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Week</span>
            </button>

            <button
              onClick={clearAllHabits}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition-all"
              title="Clear all habits for a blank slate"
            >
              <span>Clear All</span>
            </button>

            <button
              onClick={() => setIsAddingHabit(true)}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-xs transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </button>
          </div>
        </div>

        {/* Add Habit Inline Form */}
        {isAddingHabit && (
          <form onSubmit={handleAddHabit} className="p-4 bg-[#faf7f2] border-b border-[#f0e8dc] flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in-up">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Icon (🏋️)..."
                value={newHabitIcon}
                onChange={(e) => setNewHabitIcon(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-center text-sm outline-none text-[#ff7a00] font-bold"
              />
              <input
                type="text"
                placeholder="Habit title (e.g., Read 30 mins)..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00] text-[#1c1917] font-medium"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#ff7a00] text-white text-xs font-black rounded-xl whitespace-nowrap"
              >
                Save Habit
              </button>
              <button
                type="button"
                onClick={() => setIsAddingHabit(false)}
                className="px-2.5 py-1.5 text-xs text-[#78716c]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Days Header (Desktop Only) */}
        <div className="hidden sm:grid grid-cols-12 gap-2 p-3 bg-[#faf7f2] text-xs font-black text-[#ff7a00] border-b border-[#f0e8dc]">
          <div className="col-span-4 pl-2 text-[#ff7a00]">Habit Target</div>
          <div className="col-span-7 grid grid-cols-7 text-center text-[#78716c]">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="col-span-1 text-center text-[#78716c]">Streak</div>
        </div>

        {/* Habit Rows */}
        <div className="divide-y divide-[#f2e8da]">
          {habits.map((habit) => {
            const completedCount = habit.completedDays.filter(Boolean).length;
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
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-[#a8a29e] hover:text-red-500 transition-opacity"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Days Checkboxes */}
                <div className="w-full sm:col-span-7 grid grid-cols-7 text-center items-center mt-2 sm:mt-0">
                  {habit.completedDays.map((isDone, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center space-y-1.5">
                      <span className="sm:hidden text-[10px] font-bold text-[#a8a29e] uppercase">
                        {DAYS_OF_WEEK[idx].charAt(0)}
                      </span>
                      <button
                        onClick={() => toggleDay(habit.id, idx)}
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
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
