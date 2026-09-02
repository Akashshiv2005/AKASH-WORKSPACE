import { create } from 'zustand';

export interface Habit {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  completedDays: boolean[]; // 7 days: Mon (0) -> Sun (6)
  streak: number;
}

interface HabitState {
  habits: Habit[];
  toggleDay: (habitId: string, dayIndex: number) => void;
  addHabit: (name: string, icon: string) => void;
  deleteHabit: (habitId: string) => void;
  resetWeek: () => void;

  // Dynamic Getters
  getTotalCheckmarks: () => number;
  getMaxPossibleCheckmarks: () => number;
  getOverallPercentage: () => number;
  getBestStreak: () => number;
}

const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Workout & Stretch',
    category: 'Fitness',
    icon: '🏋️',
    color: 'from-[#ff7a00] to-[#ffaa00]',
    completedDays: [false, false, false, false, false, false, false],
    streak: 0,
  },
  {
    id: 'habit-2',
    name: 'Read 20 Pages of a Book',
    category: 'Learning',
    icon: '📖',
    color: 'from-[#ff7a00] to-[#ffaa00]',
    completedDays: [false, false, false, false, false, false, false],
    streak: 0,
  },
  {
    id: 'habit-3',
    name: 'Mindfulness & Meditation',
    category: 'Mental Health',
    icon: '🧘',
    color: 'from-[#ff7a00] to-[#ffaa00]',
    completedDays: [false, false, false, false, false, false, false],
    streak: 0,
  },
  {
    id: 'habit-4',
    name: 'Drink 2.5L Water Daily',
    category: 'Health',
    icon: '💧',
    color: 'from-[#ff7a00] to-[#ffaa00]',
    completedDays: [false, false, false, false, false, false, false],
    streak: 0,
  },
  {
    id: 'habit-5',
    name: 'Code Side Project 45m',
    category: 'Productivity',
    icon: '💻',
    color: 'from-[#ff7a00] to-[#ffaa00]',
    completedDays: [false, false, false, false, false, false, false],
    streak: 0,
  },
];

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: INITIAL_HABITS,

  toggleDay: (habitId, dayIndex) => {
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== habitId) return h;
        const newCompleted = [...h.completedDays];
        newCompleted[dayIndex] = !newCompleted[dayIndex];

        let streak = 0;
        for (let i = newCompleted.length - 1; i >= 0; i--) {
          if (newCompleted[i]) streak++;
          else if (i < dayIndex) break;
        }

        return { ...h, completedDays: newCompleted, streak };
      }),
    }));
  },

  addHabit: (name, icon) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      category: 'General',
      icon: icon || '🎯',
      color: 'from-[#ff7a00] to-[#ffaa00]',
      completedDays: [false, false, false, false, false, false, false],
      streak: 0,
    };
    set((state) => ({ habits: [...state.habits, newHabit] }));
  },

  deleteHabit: (habitId) => {
    set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) }));
  },

  resetWeek: () => {
    set((state) => ({
      habits: state.habits.map((h) => ({
        ...h,
        completedDays: [false, false, false, false, false, false, false],
        streak: 0,
      })),
    }));
  },

  getTotalCheckmarks: () => {
    return get().habits.reduce(
      (acc, h) => acc + h.completedDays.filter(Boolean).length,
      0
    );
  },

  getMaxPossibleCheckmarks: () => {
    return get().habits.length * 7;
  },

  getOverallPercentage: () => {
    const total = get().getTotalCheckmarks();
    const max = get().getMaxPossibleCheckmarks();
    return max > 0 ? Math.round((total / max) * 100) : 0;
  },

  getBestStreak: () => {
    return get().habits.reduce((max, h) => Math.max(max, h.streak), 0);
  },
}));
