import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface Habit {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  completedDays: boolean[]; // 7 days: Mon (0) -> Sun (6)
  streak: number;
  workspace_id?: string;
  is_archived?: boolean;
}

interface HabitState {
  habits: Habit[];
  archivedHabits: Habit[];
  isLoading: boolean;

  fetchHabits: (workspaceId: string) => Promise<void>;
  addHabit: (workspaceId: string, name: string, icon?: string) => Promise<void>;
  toggleDay: (workspaceId: string, habitId: string, dayIndex: number) => Promise<void>;
  deleteHabit: (workspaceId: string, habitId: string) => Promise<void>;
  restoreHabit: (workspaceId: string, habitId: string) => Promise<void>;
  permanentlyDeleteHabit: (workspaceId: string, habitId: string) => Promise<void>;
  resetWeek: (workspaceId: string) => Promise<void>;
  clearAllHabits: (workspaceId: string) => Promise<void>;
  resetDefaultHabits: (workspaceId: string) => Promise<void>;

  // Dynamic Getters
  getTotalCheckmarks: () => number;
  getMaxPossibleCheckmarks: () => number;
  getOverallPercentage: () => number;
  getBestStreak: () => number;
}

export const DEFAULT_HABITS: Habit[] = [
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

const mapBackendHabit = (raw: any): Habit => ({
  id: raw.id,
  name: raw.name,
  category: raw.category || 'General',
  icon: raw.icon || '🎯',
  color: raw.color || 'from-[#ff7a00] to-[#ffaa00]',
  completedDays: Array.isArray(raw.completed_days) ? raw.completed_days : (raw.completedDays || [false, false, false, false, false, false, false]),
  streak: raw.streak || 0,
  workspace_id: raw.workspace_id,
  is_archived: raw.is_archived || false,
});

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: DEFAULT_HABITS,
      archivedHabits: [],
      isLoading: false,

      fetchHabits: async (workspaceId: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        set({ isLoading: true });
        try {
          const [resActive, resArchived] = await Promise.all([
            apiClient.get<any[]>(`/workspaces/${workspaceId}/habits?archived=false`),
            apiClient.get<any[]>(`/workspaces/${workspaceId}/habits?archived=true`)
          ]);
          
          if (resActive.data) {
            set({ habits: resActive.data.map(mapBackendHabit) });
          }
          if (resArchived.data) {
            set({ archivedHabits: resArchived.data.map(mapBackendHabit) });
          }
        } catch (err) {
          console.error("Failed to fetch habits from DB:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addHabit: async (workspaceId: string, name: string, icon?: string) => {
        const token = localStorage.getItem('access_token');
        const habitIcon = icon || '🎯';
        const trimmedName = name.trim();

        if (token) {
          try {
            const res = await apiClient.post<any>(`/workspaces/${workspaceId}/habits`, {
              name: trimmedName,
              icon: habitIcon,
              streak: 0,
              completed_days: [false, false, false, false, false, false, false]
            });
            const newHabit = mapBackendHabit(res.data);
            set((state) => ({ habits: [newHabit, ...state.habits] }));
            return;
          } catch (err) {
            console.error("Failed to add habit to DB, saving locally:", err);
          }
        }

        // Local fallback
        const localHabit: Habit = {
          id: `habit-${Date.now()}`,
          name: trimmedName,
          category: 'General',
          icon: habitIcon,
          color: 'from-[#ff7a00] to-[#ffaa00]',
          completedDays: [false, false, false, false, false, false, false],
          streak: 0,
        };
        set((state) => ({ habits: [localHabit, ...state.habits] }));
      },

      toggleDay: async (workspaceId: string, habitId: string, dayIndex: number) => {
        let updatedCompletedDays: boolean[] = [];
        let updatedStreak = 0;

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

            updatedCompletedDays = newCompleted;
            updatedStreak = streak;
            return { ...h, completedDays: newCompleted, streak };
          }),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !habitId.startsWith('habit-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/habits/${habitId}`, {
              completed_days: updatedCompletedDays,
              streak: updatedStreak
            });
          } catch (err) {
            console.error("Failed to update habit checkmark in DB:", err);
          }
        }
      },

      deleteHabit: async (workspaceId: string, habitId: string) => {
        const habitToArchive = get().habits.find((h) => h.id === habitId);
        if (!habitToArchive) return;

        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
          archivedHabits: [{ ...habitToArchive, is_archived: true }, ...state.archivedHabits],
        }));

        const token = localStorage.getItem('access_token');
        if (token && !habitId.startsWith('habit-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/habits/${habitId}`, {
              is_archived: true
            });
          } catch (err) {
            console.error("Failed to archive habit in DB:", err);
          }
        }
      },

      restoreHabit: async (workspaceId: string, habitId: string) => {
        const habitToRestore = get().archivedHabits.find((h) => h.id === habitId);
        if (!habitToRestore) return;

        set((state) => ({
          archivedHabits: state.archivedHabits.filter((h) => h.id !== habitId),
          habits: [{ ...habitToRestore, is_archived: false }, ...state.habits],
        }));

        const token = localStorage.getItem('access_token');
        if (token && !habitId.startsWith('habit-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/habits/${habitId}`, {
              is_archived: false
            });
          } catch (err) {
            console.error("Failed to restore habit in DB:", err);
          }
        }
      },

      permanentlyDeleteHabit: async (workspaceId: string, habitId: string) => {
        set((state) => ({
          archivedHabits: state.archivedHabits.filter((h) => h.id !== habitId),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !habitId.startsWith('habit-')) {
          try {
            await apiClient.delete(`/workspaces/${workspaceId}/habits/${habitId}`);
          } catch (err) {
            console.error("Failed to delete habit permanently from DB:", err);
          }
        }
      },

      resetWeek: async (workspaceId: string) => {
        const emptyDays = [false, false, false, false, false, false, false];
        set((state) => ({
          habits: state.habits.map((h) => ({
            ...h,
            completedDays: [...emptyDays],
            streak: 0,
          })),
        }));

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const currentHabits = get().habits;
            await Promise.all(
              currentHabits.filter(h => !h.id.startsWith('habit-')).map(h =>
                apiClient.patch(`/workspaces/${workspaceId}/habits/${h.id}`, {
                  completed_days: emptyDays,
                  streak: 0
                })
              )
            );
          } catch (err) {
            console.error("Failed to reset week in DB:", err);
          }
        }
      },

      clearAllHabits: async (workspaceId: string) => {
        const currentActive = get().habits;
        if (currentActive.length === 0) return;

        // Move all active habits into Trash Bin (archivedHabits)
        set((state) => ({
          archivedHabits: [
            ...currentActive.map(h => ({ ...h, is_archived: true })),
            ...state.archivedHabits
          ],
          habits: []
        }));

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await apiClient.post(`/workspaces/${workspaceId}/habits/clear-all`);
          } catch (err) {
            console.error("Failed to clear habits to DB trash bin:", err);
          }
        }
      },

      resetDefaultHabits: async (workspaceId: string) => {
        set({ habits: DEFAULT_HABITS });

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            for (const def of DEFAULT_HABITS) {
              const res = await apiClient.post<any>(`/workspaces/${workspaceId}/habits`, {
                name: def.name,
                icon: def.icon,
                streak: 0,
                completed_days: def.completedDays
              });
              // update id
              def.id = res.data.id;
            }
            set({ habits: [...DEFAULT_HABITS] });
          } catch (err) {
            console.error("Failed to seed default habits in DB:", err);
          }
        }
      },

      getTotalCheckmarks: () => {
        return get().habits.reduce(
          (acc, h) => acc + (h.completedDays ? h.completedDays.filter(Boolean).length : 0),
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
        return get().habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
      },
    }),
    {
      name: 'akash-habits-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
