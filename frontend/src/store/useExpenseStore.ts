import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ExpenseItem {
  id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: 'Cash' | 'GPay';
  date: string;
}

interface ExpenseState {
  expenses: ExpenseItem[];
  savingsGoal: number;
  addExpense: (amount: number, description: string, category: string, paymentMethod: 'Cash' | 'GPay') => void;
  deleteExpense: (id: string) => void;
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

      addExpense: (amount, description, category, paymentMethod) => {
        const newExpense: ExpenseItem = {
          id: `exp-${Date.now()}`,
          amount,
          description: description.trim(),
          category,
          paymentMethod,
          date: new Date().toISOString(),
        };
        set((state) => ({ expenses: [newExpense, ...state.expenses] }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
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
          .filter(exp => exp.paymentMethod === method)
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
    }
  )
);
