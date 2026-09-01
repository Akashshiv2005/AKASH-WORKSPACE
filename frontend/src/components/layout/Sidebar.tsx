import React, { useState } from 'react';
import { usePageStore, Page } from '../../store/usePageStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Settings,
  Trash2,
  PanelLeftClose,
  Star,
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const {
    pages,
    archivedPages,
    activePageId,
    setActivePageId,
    createPage,
    toggleFavorite,
    archivePage,
    restorePage,
    deletePermanently,
    setSearching,
  } = usePageStore();

  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace } = useWorkspaceStore();
  const { user, setAuthModalOpen } = useAuthStore();

  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    'page-project-roadmap': true,
  });
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  if (!isOpen) return null;

  const toggleExpand = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handleCreateRootPage = () => {
    if (activeWorkspace) {
      createPage(activeWorkspace.id, null, 'Untitled');
    }
  };

  const handleCreateHabitTracker = () => {
    if (activeWorkspace) {
      createPage(activeWorkspace.id, null, '✨ Daily Habit Tracker & Streaks', 'habit_tracker');
    }
  };

  const handleCreateTodoPlanner = () => {
    if (activeWorkspace) {
      createPage(activeWorkspace.id, null, '🎯 Task Planner & Kanban', 'todo_planner');
    }
  };

  const handleCreatePomodoro = () => {
    if (activeWorkspace) {
      createPage(activeWorkspace.id, null, '⚡ Arc Pomodoro Focus Station', 'pomodoro');
    }
  };

  const handleCreateJournal = () => {
    if (activeWorkspace) {
      createPage(activeWorkspace.id, null, "📖 Daily Journal", 'journal');
    }
  };

  const handleCreateChildPage = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWorkspace) {
      createPage(activeWorkspace.id, parentId, 'Untitled');
      setExpandedPages((prev) => ({ ...prev, [parentId]: true }));
    }
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

  // Group pages by parent
  const rootPages = pages.filter((p) => !p.parent_id);
  const favoritePages = pages.filter((p) => p.is_favorite);

  const renderPageItem = (page: Page, level = 0) => {
    const children = pages.filter((p) => p.parent_id === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedPages[page.id];
    const isActive = activePageId === page.id;

    return (
      <div key={page.id} className="select-none">
        <div
          onClick={() => setActivePageId(page.id)}
          style={{ paddingLeft: `${Math.max(12, level * 16 + 12)}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer text-xs transition-all ${
            isActive
              ? 'active-page-pill text-[#ff7a00] font-bold shadow-xs'
              : 'hover:bg-[#f2ebe1] text-[#44403c]'
          }`}
        >
          <div className="flex items-center space-x-1.5 min-w-0">
            {/* Expand Arrow */}
            <button
              onClick={(e) => toggleExpand(page.id, e)}
              className={`p-0.5 rounded hover:bg-[#e7dfd4] transition-colors ${
                hasChildren ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#78716c]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#78716c]" />
              )}
            </button>

            {/* Icon */}
            <span className="text-xs shrink-0">{page.icon || '📄'}</span>

            {/* Title */}
            <span className="truncate font-medium">{page.title || 'Untitled'}</span>
          </div>

          {/* Quick Actions on Hover */}
          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(page.id);
              }}
              className={`p-1 rounded hover:bg-[#e7dfd4] ${
                page.is_favorite ? 'text-[#ff7a00]' : 'text-[#a8a29e]'
              }`}
              title="Favorite"
            >
              <Star className={`w-3 h-3 ${page.is_favorite ? 'fill-[#ff7a00]' : ''}`} />
            </button>

            <button
              onClick={(e) => handleCreateChildPage(page.id, e)}
              className="p-1 rounded hover:bg-[#e7dfd4] text-[#a8a29e]"
              title="Add sub-page"
            >
              <Plus className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                archivePage(page.id);
              }}
              className="p-1 rounded hover:bg-[#e7dfd4] text-[#a8a29e] hover:text-red-500"
              title="Move to trash"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Child Pages */}
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {children.map((child) => renderPageItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 h-screen bg-[#faf7f2] border-r border-[#f0e8dc] flex flex-col shrink-0 select-none transition-colors">
      {/* Workspace Switcher Header (Clean ChatGPT Layout Alignment) */}
      <div className="p-3 border-b border-[#f0e8dc] relative">
        <div
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f2ebe1] cursor-pointer transition-all border border-transparent hover:border-[#e7dfd4]"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm animate-float orange-pulse">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-black uppercase tracking-wider text-[#a8a29e] truncate leading-tight">
                AKASH WORKSPACE
              </div>
              <div className="text-xs font-extrabold text-[#1c1917] truncate leading-tight mt-0.5">
                {activeWorkspace?.name || "Akash Shiv's Workspace"}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-[#a8a29e] shrink-0">
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#ff7a00]" />
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
          <div className="absolute top-16 left-3 right-3 bg-white border border-[#f0e8dc] rounded-xl shadow-xl py-2 z-50 text-xs animate-fade-in-up">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#ff7a00] tracking-wider">
              Workspaces
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws);
                  setIsWorkspaceMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-[#f9f6f0] ${
                  ws.id === activeWorkspace?.id ? 'font-semibold text-[#ff7a00] bg-[#fff3e5]' : 'text-[#44403c]'
                }`}
              >
                <span>{ws.icon || '💼'}</span>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}

            <div className="border-t border-[#f0e8dc] my-1" />

            {isCreatingWs ? (
              <form onSubmit={handleCreateWsSubmit} className="p-2 space-y-2">
                <input
                  type="text"
                  placeholder="Workspace name..."
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-2 py-1 bg-[#faf7f2] border border-[#f0e8dc] rounded text-xs outline-none focus:border-[#ff7a00] text-[#1c1917]"
                  autoFocus
                />
                <div className="flex justify-end space-x-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWs(false)}
                    className="px-2 py-0.5 text-xs text-[#78716c]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-xs bg-[#ff7a00] text-white font-bold rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingWs(true)}
                className="w-full text-left px-3 py-1.5 flex items-center space-x-2 hover:bg-[#f9f6f0] text-[#ff7a00] font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Workspace</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => setSearching(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-[#ff7a00]" />
            <span>Search Workspace</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-[#f0e8dc] text-[10px] font-mono rounded text-[#78716c]">
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={() => setAuthModalOpen(true, 'login')}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] transition-all hover:scale-[1.01]"
        >
          <Settings className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>Settings & Auth</span>
        </button>

        <div className="pt-2 px-2.5 pb-1 text-[10px] font-black uppercase text-[#a8a29e] tracking-wider">
          HABIT & PRODUCTIVITY
        </div>

        {/* Habit Tracker Template Pill */}
        <button
          onClick={handleCreateHabitTracker}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] font-medium transition-all hover:scale-[1.01]"
        >
          <Flame className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>Habit Tracker</span>
        </button>

        {/* To-Do Planner Template Pill */}
        <button
          onClick={handleCreateTodoPlanner}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] font-medium transition-all hover:scale-[1.01]"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>To-Do Planner</span>
        </button>

        {/* Pomodoro Focus Timer Pill */}
        <button
          onClick={handleCreatePomodoro}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] font-medium transition-all hover:scale-[1.01]"
        >
          <Zap className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>Arc Focus Timer</span>
        </button>

        {/* Daily Journal Pill */}
        <button
          onClick={handleCreateJournal}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#44403c] font-medium transition-all hover:scale-[1.01]"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>Daily Journal</span>
        </button>
      </div>

      {/* Favorites Section */}
      {favoritePages.length > 0 && (
        <div className="mt-2 px-2">
          <div className="px-2 py-1 text-[10px] font-black uppercase text-[#a8a29e] tracking-wider flex items-center space-x-1">
            <Star className="w-3 h-3 fill-[#ff7a00] text-[#ff7a00]" />
            <span>FAVORITES</span>
          </div>
          <div className="space-y-0.5">
            {favoritePages.map((page) => (
              <div
                key={page.id}
                onClick={() => setActivePageId(page.id)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-all ${
                  activePageId === page.id
                    ? 'active-page-pill text-[#ff7a00] font-bold'
                    : 'hover:bg-[#f2ebe1] text-[#44403c]'
                }`}
              >
                <span>{page.icon || '📄'}</span>
                <span className="truncate">{page.title || 'Untitled'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Private Pages List */}
      <div className="flex-1 overflow-y-auto mt-3 px-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-[10px] font-black uppercase text-[#a8a29e] tracking-wider">
            PRIVATE PAGES
          </span>
          <button
            onClick={handleCreateRootPage}
            className="p-1 rounded hover:bg-[#e7dfd4] text-[#78716c]"
            title="Create root page"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-0.5 mt-1">
          {rootPages.map((page) => renderPageItem(page, 0))}
        </div>
      </div>

      {/* Footer: User Profile & Trash Bin */}
      <div className="p-2 border-t border-[#f0e8dc] space-y-1">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#f0e8dc]/60">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9500] flex items-center justify-center text-[10px] font-black text-white shrink-0">
              A
            </div>
            <span className="text-xs font-bold text-[#1c1917] truncate">
              {user?.full_name || 'Akash Shiv'}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#ff7a00] animate-ping" />
        </div>

        <button
          onClick={() => setIsTrashOpen(!isTrashOpen)}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f2ebe1] text-xs text-[#78716c] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span>Trash Bin ({archivedPages.length})</span>
        </button>

        {/* Trash Modal */}
        {isTrashOpen && (
          <div className="mt-2 p-2 bg-white border border-[#f0e8dc] rounded-xl shadow-xl text-xs space-y-1 animate-fade-in-up">
            <div className="font-bold text-[#1c1917] px-1">Trash Bin</div>
            {archivedPages.length === 0 ? (
              <p className="text-[#a8a29e] px-1 py-2 text-[11px]">No items in trash.</p>
            ) : (
              archivedPages.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-1 hover:bg-[#f9f6f0] rounded">
                  <span className="truncate max-w-[110px]">{p.title || 'Untitled'}</span>
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
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
