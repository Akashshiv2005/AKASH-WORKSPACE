import React, { useState } from 'react';
import { usePageStore } from '../../store/usePageStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Plus,
  Search,
  Settings,
  Trash2,
  PanelLeftClose,
  ChevronsUpDown,
  RotateCcw,
  Flame,
  CheckSquare,
  Zap,
  BookOpen,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onBackToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, onBackToLanding }) => {
  const {
    pages,
    archivedPages,
    setActivePageId,
    createPage,
    restorePage,
    deletePermanently,
    setSearching,
  } = usePageStore();

  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspaceStore();
  const { user, setAuthModalOpen } = useAuthStore();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  if (!isOpen) return null;

  const openWidgetPage = (widgetType: 'habit_tracker' | 'todo_planner' | 'pomodoro' | 'journal' | 'expense_tracker') => {
    if (activeWorkspace) {
      const titles: Record<string, string> = {
        habit_tracker: 'Daily Habit Tracker & Streaks',
        todo_planner: 'Task Planner',
        pomodoro: 'Arc Pomodoro Focus Station',
        journal: 'Daily Journal',
        expense_tracker: 'Expense Tracker',
      };
      const existing = pages.find((p) => (p.widget_type === widgetType || (p.title || '').toLowerCase().includes(widgetType.split('_')[0])) && !p.is_archived);
      if (existing) {
        setActivePageId(existing.id);
      } else {
        createPage(activeWorkspace.id, null, titles[widgetType], widgetType);
      }
    }
    if (window.innerWidth <= 768) toggleSidebar();
  };

  const handleCreateWsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWsName.trim()) {
      createWorkspace(newWsName.trim());
      setNewWsName('');
      setIsCreatingWs(false);
      setIsWorkspaceMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={toggleSidebar}
      />
      <aside className="fixed left-0 md:relative z-50 w-60 h-screen bg-[#faf9f6] backdrop-blur-xl border-r border-zinc-200 text-zinc-900 flex flex-col shrink-0 select-none transition-all animate-slide-in-left">
        {/* Workspace Switcher Header */}
        <div className="p-3 border-b border-zinc-200 relative">
          <div
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2ebe1] dark:hover:bg-zinc-900/80 cursor-pointer transition-all border border-transparent hover:border-[#e7dfd4] dark:hover:border-red-900/40"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#dc2626] via-[#f59e0b] to-[#b91c1c] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm animate-float gold-red-pulse">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-black uppercase tracking-wider text-[#a8a29e] truncate leading-tight animate-text-reveal">
                  AKASH WORKSPACE
                </div>
                <div className="text-xs font-extrabold truncate leading-tight mt-0.5 text-gradient-dark hover-text-shimmer">
                  {activeWorkspace?.name || "Akash Shiv's Workspace"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[#a8a29e] shrink-0">
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#dc2626]" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                className="p-1 rounded hover:bg-[#e7dfd4]"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Workspace Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute top-16 left-3 right-3 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 z-50 text-xs animate-fade-in-up text-zinc-900">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-amber-100/60 ${ws.id === activeWorkspace?.id ? 'font-semibold text-amber-700 bg-amber-50' : 'text-zinc-700'
                    }`}
                >
                  <span>{ws.icon || '💼'}</span>
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}

              <div className="border-t border-zinc-200 my-1" />

              {isCreatingWs ? (
                <form onSubmit={handleCreateWsSubmit} className="p-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Workspace name..."
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-50 border border-zinc-300 rounded text-xs outline-none focus:border-amber-500 text-zinc-900 placeholder:text-zinc-400"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingWs(false)}
                      className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-0.5 text-xs bg-amber-500 text-zinc-950 font-bold rounded"
                    >
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreatingWs(true)}
                  className="w-full text-left px-3 py-1.5 flex items-center space-x-2 hover:bg-amber-100/60 text-amber-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Workspace</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-2 space-y-1 border-b border-zinc-200 select-none flex-1 overflow-y-auto custom-scrollbar">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white font-extrabold text-xs shadow-xs hover:scale-[1.01] transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Iron Man Home</span>
            </button>
          )}

          <button
            onClick={() => setSearching(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Search Workspace</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-[10px] font-mono rounded text-amber-800">
              Ctrl K
            </kbd>
          </button>

          <button
            onClick={() => setAuthModalOpen(true, 'login')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-900 transition-all hover:scale-[1.01]"
          >
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            <span>Settings & Auth</span>
          </button>

          <div className="pt-2 px-2.5 pb-1 text-[10px] font-black uppercase text-amber-700 tracking-wider">
            HABIT & PRODUCTIVITY
          </div>

          {/* Habit Tracker Template Pill */}
          <button
            onClick={() => openWidgetPage('habit_tracker')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Habit Tracker</span>
          </button>

          {/* To-Do Planner Template Pill */}
          <button
            onClick={() => openWidgetPage('todo_planner')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
            <span>To-Do Planner</span>
          </button>

          {/* Pomodoro Focus Timer Pill */}
          <button
            onClick={() => openWidgetPage('pomodoro')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Arc Focus Timer</span>
          </button>

          {/* Daily Journal Pill */}
          <button
            onClick={() => openWidgetPage('journal')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Journal</span>
          </button>

          {/* Expense Tracker Pill */}
          <button
            onClick={() => openWidgetPage('expense_tracker')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-800 hover:text-zinc-950 font-medium transition-all hover:scale-[1.01]"
          >
            <span className="text-sm">💰</span>
            <span>Expense Tracker</span>
          </button>
        </div>

        {/* Footer: User Profile & Trash Bin */}
        <div className="p-2 border-t border-zinc-200 space-y-1 select-none">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-amber-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                A
              </div>
              <span className="text-xs font-bold text-zinc-900 truncate">
                {user?.full_name || 'Akash Shiv'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>

          <button
            onClick={() => setIsTrashOpen(!isTrashOpen)}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-100/60 text-xs text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Trash Bin ({archivedPages.length})</span>
          </button>

          {/* Trash Modal */}
          {isTrashOpen && (
            <div className="mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-xl text-xs space-y-1 animate-fade-in-up text-zinc-900">
              <div className="font-bold text-zinc-900 px-1">Trash Bin</div>
              {archivedPages.length === 0 ? (
                <p className="text-zinc-500 px-1 py-2 text-[11px]">No items in trash.</p>
              ) : (
                archivedPages.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-1 hover:bg-amber-50 rounded">
                    <span className="truncate max-w-[110px] text-zinc-800">{p.title || 'Untitled'}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => restorePage(p.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Restore"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deletePermanently(p.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
