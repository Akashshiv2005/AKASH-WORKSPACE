import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  is_personal: boolean;
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, icon?: string) => Promise<Workspace | null>;
}

const DEFAULT_WORKSPACE: Workspace = {
  id: 'workspace-akash-shiv',
  name: "Akash Shiv's Workspace",
  slug: 'akash-shiv-workspace',
  icon: '⚡',
  is_personal: true,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [DEFAULT_WORKSPACE],
  activeWorkspace: DEFAULT_WORKSPACE,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ workspaces: [DEFAULT_WORKSPACE], activeWorkspace: DEFAULT_WORKSPACE });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await apiClient.get<Workspace[]>('/workspaces');
      if (res.data && res.data.length > 0) {
        set({ workspaces: res.data, activeWorkspace: res.data[0], error: null });
      } else {
        set({ workspaces: [DEFAULT_WORKSPACE], activeWorkspace: DEFAULT_WORKSPACE });
      }
    } catch {
      set({ workspaces: [DEFAULT_WORKSPACE], activeWorkspace: DEFAULT_WORKSPACE });
    } finally {
      set({ isLoading: false });
    }
  },

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  createWorkspace: async (name, icon = '📝') => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const res = await apiClient.post<Workspace>('/workspaces', { name, icon });
        const newWs = res.data;
        set((state) => ({
          workspaces: [...state.workspaces, newWs],
          activeWorkspace: newWs,
        }));
        return newWs;
      } else {
        const newWs: Workspace = {
          id: `ws-${Date.now()}`,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          icon,
          is_personal: false,
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWs],
          activeWorkspace: newWs,
        }));
        return newWs;
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to create workspace' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
