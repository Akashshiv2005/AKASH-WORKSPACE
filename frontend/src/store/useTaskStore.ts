import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
}

interface TaskState {
  tasks: TaskItem[];
  addTask: (title: string, priority: 'High' | 'Medium' | 'Low') => void;
  updateStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => void;
  deleteTask: (taskId: string) => void;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Design Q3 Product Architecture & Wireframes',
    category: 'Design',
    priority: 'High',
    status: 'in_progress',
    dueDate: '2026-09-05',
  },
  {
    id: 'task-2',
    title: 'Refactor Auth Service & JWT token refresh flow',
    category: 'Engineering',
    priority: 'High',
    status: 'completed',
    dueDate: '2026-09-02',
  },
  {
    id: 'task-3',
    title: 'Draft Product Launch Announcement Post',
    category: 'Marketing',
    priority: 'Medium',
    status: 'todo',
    dueDate: '2026-09-10',
  },
  {
    id: 'task-4',
    title: 'Perform Security Audit on Database Migrations',
    category: 'Security',
    priority: 'High',
    status: 'todo',
    dueDate: '2026-09-12',
  },
  {
    id: 'task-5',
    title: 'Set up automated E2E tests for Tiptap block editor',
    category: 'QA',
    priority: 'Low',
    status: 'in_progress',
    dueDate: '2026-09-15',
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,

      addTask: (title, priority) => {
        const newTask: TaskItem = {
          id: `task-${Date.now()}`,
          title: title.trim(),
          category: 'General',
          priority,
          status: 'todo',
          dueDate: 'Today',
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) }));
      },
    }),
    {
      name: 'akash-tasks-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
