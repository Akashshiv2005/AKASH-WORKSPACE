import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '../api/client';

export interface Page {
  id: string;
  title: string;
  icon?: string;
  cover_image?: string;
  content?: string | any;
  widget_type?: 'habit_tracker' | 'todo_planner' | 'pomodoro' | 'journal' | 'expense_tracker' | 'dsa_planner' | 'plans_hub' | null;
  workspace_id: string;
  parent_id?: string | null;
  is_favorite: boolean;
  is_archived: boolean;
  position: number;
  created_at?: string;
  updated_at?: string;
}

interface PageState {
  pages: Page[];
  archivedPages: Page[];
  activePageId: string | null;
  isLoading: boolean;
  isSearching: boolean;
  searchQuery: string;

  fetchPages: (workspaceId: string) => Promise<void>;
  fetchArchivedPages: (workspaceId: string) => Promise<void>;
  setActivePageId: (pageId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearching: (open: boolean) => void;

  createPage: (workspaceId: string, parentId?: string | null, title?: string, widgetType?: 'habit_tracker' | 'todo_planner' | 'pomodoro' | 'journal' | 'expense_tracker' | 'dsa_planner' | 'plans_hub' | null) => Promise<Page>;
  updatePage: (pageId: string, updates: Partial<Page>) => Promise<void>;
  toggleFavorite: (pageId: string) => Promise<void>;
  archivePage: (pageId: string) => Promise<void>;
  restorePage: (pageId: string) => Promise<void>;
  deletePermanently: (pageId: string) => Promise<void>;
  duplicatePage: (pageId: string) => Promise<Page | null>;
}

const DEMO_PAGES: Page[] = [
  {
    id: 'page-habit-tracker',
    title: 'Daily Habit Tracker & Streaks',
    icon: '🔥',
    cover_image: '',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: "Akash's Habit & Routine Dashboard" }],
        },
      ],
    }),
    widget_type: 'habit_tracker',
    workspace_id: 'workspace-akash-shiv',
    parent_id: null,
    is_favorite: true,
    is_archived: false,
    position: 0,
  },
  {
    id: 'page-todo-planner',
    title: 'Task Planner Goals',
    icon: '📋',
    cover_image: '',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: "Akash's Interactive Task Board" }],
        },
      ],
    }),
    widget_type: 'todo_planner',
    workspace_id: 'workspace-akash-shiv',
    parent_id: null,
    is_favorite: true,
    is_archived: false,
    position: 1,
  },
  {
    id: 'page-pomodoro',
    title: 'Arc Pomodoro Focus Station',
    icon: '⚡',
    cover_image: '',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Deep Focus & Productivity Timer' }],
        },
      ],
    }),
    widget_type: 'pomodoro',
    workspace_id: 'workspace-akash-shiv',
    parent_id: null,
    is_favorite: true,
    is_archived: false,
    position: 2,
  },
  {
    id: 'page-plans-hub',
    title: '🎯 Study & Learning Plans',
    icon: '🎯',
    cover_image: '',
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Interactive Plans & Learning Hub' }],
        },
      ],
    }),
    widget_type: 'plans_hub',
    workspace_id: 'workspace-akash-shiv',
    parent_id: null,
    is_favorite: true,
    is_archived: false,
    position: 4,
  },
];

export const usePageStore = create<PageState>()(
  persist(
    (set, get) => ({
      pages: DEMO_PAGES,
      archivedPages: [],
      activePageId: 'page-plans-hub',
      isLoading: false,
      isSearching: false,
      searchQuery: '',

      setActivePageId: (pageId) => set({ activePageId: pageId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearching: (open) => set({ isSearching: open }),

      fetchPages: async (workspaceId) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ pages: get().pages.length ? get().pages : DEMO_PAGES });
          return;
        }
        set({ isLoading: true });
        try {
          const res = await apiClient.get<Page[]>(`/workspaces/${workspaceId}/pages?archived=false`);
          if (res.data && res.data.length > 0) {
            set({ pages: res.data });
            if (!get().activePageId) {
              set({ activePageId: res.data[0].id });
            }
          }
        } catch {
          // keep fallback
        } finally {
          set({ isLoading: false });
        }
      },

      fetchArchivedPages: async (workspaceId) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
          const res = await apiClient.get<Page[]>(`/workspaces/${workspaceId}/pages?archived=true`);
          set({ archivedPages: res.data || [] });
        } catch {
          // ignore
        }
      },

      createPage: async (workspaceId, parentId = null, title = 'Untitled', widgetType = null) => {
        const getIcon = () => {
          if (widgetType === 'habit_tracker') return '🔥';
          if (widgetType === 'todo_planner') return '📋';
          if (widgetType === 'pomodoro') return '⚡';
          if (widgetType === 'journal') return '📖';
          if (widgetType === 'dsa_planner') return '🎓';
          if (widgetType === 'plans_hub') return '🎯';
          return '📄';
        };

        const tempId = `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newPage: Page = {
          id: tempId,
          title,
          icon: getIcon(),
          cover_image: '',
          content: '',
          widget_type: widgetType,
          workspace_id: workspaceId,
          parent_id: parentId,
          is_favorite: false,
          is_archived: false,
          position: get().pages.length,
        };

        // 1. Instant local state update (0ms UI lag)
        set((state) => ({
          pages: [...state.pages, newPage],
          activePageId: newPage.id,
        }));

        // 2. Background API Sync (non-blocking)
        const token = localStorage.getItem('access_token');
        if (token) {
          apiClient
            .post<Page>('/pages', {
              title,
              workspace_id: workspaceId,
              parent_id: parentId,
              icon: getIcon(),
            })
            .then((res) => {
              if (res.data && res.data.id) {
                const realPage = { ...res.data, widget_type: widgetType, cover_image: '' };
                set((state) => ({
                  pages: state.pages.map((p) => (p.id === tempId ? realPage : p)),
                  activePageId: state.activePageId === tempId ? realPage.id : state.activePageId,
                }));
              }
            })
            .catch(() => {
              // Silently retain local page on network error
            });
        }

        return newPage;
      },

      updatePage: async (pageId, updates) => {
        set((state) => ({
          pages: state.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !pageId.startsWith('page-')) {
          try {
            await apiClient.patch(`/pages/${pageId}`, updates);
          } catch {
            // handle sync error silently
          }
        }
      },

      toggleFavorite: async (pageId) => {
        const page = get().pages.find((p) => p.id === pageId);
        if (!page) return;
        const updatedFav = !page.is_favorite;

        set((state) => ({
          pages: state.pages.map((p) => (p.id === pageId ? { ...p, is_favorite: updatedFav } : p)),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !pageId.startsWith('page-')) {
          try {
            await apiClient.post(`/pages/${pageId}/favorite`);
          } catch {
            // silently handle
          }
        }
      },

      archivePage: async (pageId) => {
        const page = get().pages.find((p) => p.id === pageId);
        if (!page) return;

        set((state) => {
          const filtered = state.pages.filter((p) => p.id !== pageId);
          const nextActive = filtered.length > 0 ? filtered[0].id : null;
          return {
            pages: filtered,
            archivedPages: [...state.archivedPages, { ...page, is_archived: true }],
            activePageId: state.activePageId === pageId ? nextActive : state.activePageId,
          };
        });

        const token = localStorage.getItem('access_token');
        if (token && !pageId.startsWith('page-')) {
          try {
            await apiClient.post(`/pages/${pageId}/archive`);
          } catch {
            // handle fallback
          }
        }
      },

      restorePage: async (pageId) => {
        const page = get().archivedPages.find((p) => p.id === pageId);
        if (!page) return;

        set((state) => ({
          archivedPages: state.archivedPages.filter((p) => p.id !== pageId),
          pages: [...state.pages, { ...page, is_archived: false }],
          activePageId: pageId,
        }));

        const token = localStorage.getItem('access_token');
        if (token && !pageId.startsWith('page-')) {
          try {
            await apiClient.post(`/pages/${pageId}/restore`);
          } catch {
            // handle fallback
          }
        }
      },

      deletePermanently: async (pageId) => {
        set((state) => ({
          archivedPages: state.archivedPages.filter((p) => p.id !== pageId),
        }));

        const token = localStorage.getItem('access_token');
        if (token && !pageId.startsWith('page-')) {
          try {
            await apiClient.delete(`/pages/${pageId}`);
          } catch {
            // fallback
          }
        }
      },

      duplicatePage: async (pageId) => {
        const page = get().pages.find((p) => p.id === pageId);
        if (!page) return null;

        return get().createPage(
          page.workspace_id,
          page.parent_id,
          `${page.title} (Copy)`,
          page.widget_type
        );
      },
    }),
    {
      name: 'akash-pages-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pages: state.pages,
        archivedPages: state.archivedPages,
        activePageId: state.activePageId,
      }),
    }
  )
);
