import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { useWorkspaceStore } from './useWorkspaceStore';

export interface ExpenseItem {
  id: string;
  amount: number;
  description: string;
  category: string;
  payment_method: 'Cash' | 'GPay';
  date: string;
}

interface ExpenseState {
  expenses: ExpenseItem[];
  savingsGoal: number;
  isLoading: boolean;
  
  fetchExpenses: (workspaceId: string) => Promise<void>;
  addExpense: (workspaceId: string, amount: number, description: string, category: string, payment_method: 'Cash' | 'GPay') => Promise<void>;
  deleteExpense: (workspaceId: string, id: string) => Promise<void>;
  
  clearAllExpenses: () => void;
  setSavingsGoal: (goal: number) => void;

  getTotalExpenses: () => number;
  getExpensesByMethod: (method: 'Cash' | 'GPay') => number;
  getExpensesByCategory: () => { name: string; value: number }[];
}

const DEFAULT_EXPENSES: ExpenseItem[] = [];

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: DEFAULT_EXPENSES,
      savingsGoal: 5000, // Default goal
      isLoading: false,

      fetchExpenses: async (workspaceId) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        set({ isLoading: true });
        try {
          const res = await apiClient.get<ExpenseItem[]>(`/workspaces/${workspaceId}/expenses`);
          set({ expenses: res.data });
        } catch (err) {
          console.error("Failed to fetch expenses", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addExpense: async (workspaceId, amount, description, category, payment_method) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const res = await apiClient.post<ExpenseItem>(`/workspaces/${workspaceId}/expenses`, {
              amount,
              description: description.trim(),
              category,
              payment_method
            });
            set((state) => ({ expenses: [res.data, ...state.expenses] }));
          } catch (err) {
             console.error("Failed to add expense", err);
          }
        } else {
          // Fallback for offline/local
          const newExpense: ExpenseItem = {
            id: `exp-${Date.now()}`,
            amount,
            description: description.trim(),
            category,
            payment_method,
            date: new Date().toISOString(),
          };
          set((state) => ({ expenses: [newExpense, ...state.expenses] }));
        }
      },

      deleteExpense: async (workspaceId, id) => {
        const token = localStorage.getItem('access_token');
        if (token && !id.startsWith('exp-')) {
          try {
            await apiClient.delete(`/workspaces/${workspaceId}/expenses/${id}`);
            set((state) => ({
              expenses: state.expenses.filter((e) => e.id !== id),
            }));
          } catch (err) {
            console.error("Failed to delete expense", err);
          }
        } else {
          set((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
          }));
        }
      },

      clearAllExpenses: () => {
        set({ expenses: [] });
      },

      setSavingsGoal: (goal: number) => {
        set({ savingsGoal: goal });
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((total, exp) => total + exp.amount, 0);
      },

      getExpensesByMethod: (method) => {
        return get().expenses
          .filter(exp => exp.payment_method === method)
          .reduce((total, exp) => total + exp.amount, 0);
      },

      getExpensesByCategory: () => {
        const grouped = get().expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
      },
    }),
    {
      name: 'akash-expenses-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savingsGoal: state.savingsGoal }), // Only persist savings goal
    }
  )
);
