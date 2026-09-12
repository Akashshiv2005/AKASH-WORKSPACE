import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  workspace_id?: string;
  is_archived?: boolean;
}

interface TaskState {
  tasks: TaskItem[];
  archivedTasks: TaskItem[];
  isLoading: boolean;

  fetchTasks: (workspaceId: string) => Promise<void>;
  addTask: (arg1: string, arg2?: any, arg3?: 'High' | 'Medium' | 'Low') => Promise<void>;
  updateStatus: (workspaceId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => Promise<void>;
  deleteTask: (workspaceId: string, taskId: string) => Promise<void>;
  restoreTask: (workspaceId: string, taskId: string) => Promise<void>;
  permanentlyDeleteTask: (workspaceId: string, taskId: string) => Promise<void>;
  resetBoard: (workspaceId: string) => Promise<void>;
  clearAllTasks: (workspaceId: string) => Promise<void>;
}

export const DEFAULT_TASKS: TaskItem[] = [
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

const mapBackendTask = (raw: any): TaskItem => ({
  id: raw.id,
  title: raw.title,
  category: 'General',
  priority: (raw.priority as 'High' | 'Medium' | 'Low') || 'Medium',
  status: (raw.status as 'todo' | 'in_progress' | 'completed') || 'todo',
  dueDate: 'Today',
  workspace_id: raw.workspace_id,
  is_archived: raw.is_archived || false,
});

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_TASKS,
      archivedTasks: [],
      isLoading: false,

      fetchTasks: async (workspaceId: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        set({ isLoading: true });
        try {
          const [resActive, resArchived] = await Promise.all([
            apiClient.get<any[]>(`/workspaces/${workspaceId}/tasks?archived=false`),
            apiClient.get<any[]>(`/workspaces/${workspaceId}/tasks?archived=true`),
          ]);

          if (resActive.data) {
            set({ tasks: resActive.data.map(mapBackendTask) });
          }
          if (resArchived.data) {
            set({ archivedTasks: resArchived.data.map(mapBackendTask) });
          }
        } catch (err) {
          console.error('Failed to fetch tasks from DB:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      addTask: async (arg1: string, arg2?: any, arg3?: 'High' | 'Medium' | 'Low') => {
        let workspaceId = 'workspace-akash-shiv';
        let title = '';
        let priority: 'High' | 'Medium' | 'Low' = 'Medium';

        if (arg3 !== undefined) {
          workspaceId = arg1;
          title = (arg2 || '').trim();
          priority = arg3;
        } else if (arg2 !== undefined) {
          if (arg1.startsWith('workspace-') || arg1.length > 20) {
            workspaceId = arg1;
            title = (arg2 || '').trim();
          } else {
            title = arg1.trim();
            priority = arg2 as 'High' | 'Medium' | 'Low';
          }
        } else {
          title = arg1.trim();
        }

        const token = localStorage.getItem('access_token');
        const trimmedTitle = title;

        if (token) {
          try {
            const res = await apiClient.post<any>(`/workspaces/${workspaceId}/tasks`, {
              title: trimmedTitle,
              priority,
              status: 'todo',
            });
            const newTask = mapBackendTask(res.data);
            set((state) => ({ tasks: [newTask, ...state.tasks] }));
            return;
          } catch (err) {
            console.error('Failed to create task in DB, saving locally:', err);
          }
        }

        // Local fallback
        const localTask: TaskItem = {
          id: `task-${Date.now()}`,
          title: trimmedTitle,
          category: 'General',
          priority,
          status: 'todo',
          dueDate: 'Today',
        };
        set((state) => ({ tasks: [localTask, ...state.tasks] }));
      },

      updateStatus: async (workspaceId: string, taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !taskId.startsWith('task-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, { status });
          } catch (err) {
            console.error('Failed to update task status in DB:', err);
          }
        }
      },

      deleteTask: async (workspaceId: string, taskId: string) => {
        const taskToArchive = get().tasks.find((t) => t.id === taskId);
        if (!taskToArchive) return;

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          archivedTasks: [{ ...taskToArchive, is_archived: true }, ...state.archivedTasks],
        }));

        const token = localStorage.getItem('access_token');
        if (token && !taskId.startsWith('task-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, { is_archived: true });
          } catch (err) {
            console.error('Failed to archive task in DB:', err);
          }
        }
      },

      restoreTask: async (workspaceId: string, taskId: string) => {
        const taskToRestore = get().archivedTasks.find((t) => t.id === taskId);
        if (!taskToRestore) return;

        set((state) => ({
          archivedTasks: state.archivedTasks.filter((t) => t.id !== taskId),
          tasks: [{ ...taskToRestore, is_archived: false }, ...state.tasks],
        }));

        const token = localStorage.getItem('access_token');
        if (token && !taskId.startsWith('task-')) {
          try {
            await apiClient.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, { is_archived: false });
          } catch (err) {
            console.error('Failed to restore task in DB:', err);
          }
        }
      },

      permanentlyDeleteTask: async (workspaceId: string, taskId: string) => {
        set((state) => ({
          archivedTasks: state.archivedTasks.filter((t) => t.id !== taskId),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !taskId.startsWith('task-')) {
          try {
            await apiClient.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
          } catch (err) {
            console.error('Failed to permanently delete task in DB:', err);
          }
        }
      },

      resetBoard: async (workspaceId: string) => {
        set({ tasks: DEFAULT_TASKS });

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            for (const def of DEFAULT_TASKS) {
              const res = await apiClient.post<any>(`/workspaces/${workspaceId}/tasks`, {
                title: def.title,
                priority: def.priority,
                status: def.status,
              });
              def.id = res.data.id;
            }
            set({ tasks: [...DEFAULT_TASKS] });
          } catch (err) {
            console.error('Failed to seed default tasks in DB:', err);
          }
        }
      },

      clearAllTasks: async (workspaceId: string) => {
        const currentActive = get().tasks;
        if (currentActive.length === 0) return;

        // Move all active tasks into Trash Bin (archivedTasks)
        set((state) => ({
          archivedTasks: [
            ...currentActive.map((t) => ({ ...t, is_archived: true })),
            ...state.archivedTasks,
          ],
          tasks: [],
        }));

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await apiClient.post(`/workspaces/${workspaceId}/tasks/clear-all`);
          } catch (err) {
            console.error('Failed to archive tasks to DB trash bin:', err);
          }
        }
      },
    }),
    {
      name: 'akash-tasks-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
