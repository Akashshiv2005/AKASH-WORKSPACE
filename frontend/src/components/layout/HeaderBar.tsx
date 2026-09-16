import React, { useState } from 'react';
import { usePageStore } from '../../store/usePageStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { GeminiAssistantModal } from '../ai/GeminiAssistantModal';
import {
  PanelLeft,
  PanelRight,
  Star,
  Sun,
  Moon,
  MoreHorizontal,
  ChevronRight,
  User,
  Share2,
  Trash2,
  Copy,
  Check,
  Zap,
  Shield,
  Bell
} from 'lucide-react';

interface HeaderBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isRightSidebarOpen?: boolean;
  toggleRightSidebar?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onBackToLanding?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  isRightSidebarOpen = true,
  toggleRightSidebar,
  darkMode,
  setDarkMode,
  onBackToLanding,
}) => {
  const { pages, activePageId, toggleFavorite, archivePage, duplicatePage } = usePageStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { user, isAuthenticated, setAuthModalOpen } = useAuthStore();
  const { setModalOpen: setNotificationModalOpen, settings: notificationSettings } = useNotificationStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const activePage = pages.find((p) => p.id === activePageId);

  // Build breadcrumb
  const getBreadcrumb = () => {
    if (!activePage) return [];
    const trail = [activePage];
    let current = activePage;
    while (current.parent_id) {
      const parent = pages.find((p) => p.id === current.parent_id);
      if (parent) {
        trail.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return trail;
  };

  const breadcrumbs = getBreadcrumb();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="h-14 border-b border-amber-500/30 bg-[#120a0d]/95 backdrop-blur-xl px-4 flex items-center justify-between text-white select-none z-10 transition-colors shrink-0">
        {/* Left Section: Workspace & Breadcrumbs */}
        <div className="flex items-center space-x-3 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-red-950/60 text-amber-400 transition-colors"
              title="Open Left Sidebar"
            >
              <PanelLeft className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Iron Man Landing Page Back Trigger */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-amber-500 hover:from-indigo-600 hover:to-amber-400 text-white font-black text-[11px] tracking-wider transition-all hover:scale-105 shadow-md border border-amber-400/50 shrink-0 whitespace-nowrap"
              title="Return to Iron Man Home Landing Page"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              <span>IRON MAN HOME</span>
            </button>
          )}

          {/* Workspace Shield Logo */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <span className="text-xs font-extrabold text-amber-400 tracking-wide truncate max-w-[140px] md:max-w-none">
              {activeWorkspace?.name || "Akash Shiv's Workspace"}
            </span>
          </div>

          {/* Breadcrumb Path */}
          {breadcrumbs.map((page, index) => (
            <React.Fragment key={page.id}>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
              <div className="flex items-center space-x-1 min-w-0">
                {page.icon && <span className="text-xs shrink-0">{page.icon}</span>}
                <span className={`text-xs truncate transition-all ${index === breadcrumbs.length - 1 ? 'font-bold text-amber-300' : 'text-zinc-300 hover:text-white'}`}>
                  {page.title || 'Untitled'}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Right Section: Ask JARVIS, Notifications & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Ask JARVIS Button (Gold & Red Accent) */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-500 hover:from-red-600 hover:to-amber-400 text-white text-xs font-black shadow-md transition-all hover:scale-105 border border-amber-400/40"
            title="Open JARVIS AI Assistant"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="tracking-wide hidden sm:inline text-white">Ask JARVIS</span>
          </button>

          {/* Favorite Button */}
          {activePage && (
            <button
              onClick={() => toggleFavorite(activePage.id)}
              className={`hidden sm:flex p-1.5 rounded-lg hover:bg-red-950/60 transition-colors ${
                activePage.is_favorite ? 'text-amber-400' : 'text-zinc-400'
              }`}
              title={activePage.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-4 h-4 ${activePage.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-1.5 rounded-lg hover:bg-red-950/60 text-amber-400 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-400" />}
          </button>

          {/* Right Side Dock Toggle Button */}
          {toggleRightSidebar && (
            <button
              onClick={toggleRightSidebar}
              className={`p-1.5 rounded-lg hover:bg-red-950/60 transition-colors ${
                isRightSidebarOpen ? 'text-amber-400 font-bold' : 'text-zinc-400'
              }`}
              title="Toggle Productivity Dock"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}

          {/* Notifications Icon */}
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="group relative flex p-1.5 rounded-lg hover:bg-red-950/60 text-amber-400 hover:scale-110 active:scale-90 transition-all duration-200"
            title="Gmail Daily Digest & Task Reminders"
          >
            <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {notificationSettings?.is_enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-red-900 animate-pulse" />
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs hover:bg-red-950/60 text-zinc-300 transition-colors border border-amber-500/20"
            title="Share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline font-medium">{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Workspace Options Menu */}
          {activePage && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg hover:bg-indigo-950/60 text-slate-300 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-[#131b2e] border border-indigo-500/30 shadow-2xl py-1 text-xs text-slate-100 z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      duplicatePage(activePage.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-900/40 flex items-center space-x-2 font-medium text-amber-400"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate Page</span>
                  </button>

                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(usePageStore.getState().pages, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `workspace-backup-${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-900/40 flex items-center space-x-2 font-medium text-emerald-400"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export Workspace JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      archivePage(activePage.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-indigo-900/40 text-rose-400 flex items-center space-x-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="w-[1px] h-4 bg-indigo-500/30 mx-1" />

          {/* User Auth Profile Trigger */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-bold text-slate-100 hidden md:inline">
                {user?.full_name || 'Akash Shiv'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true, 'login')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all hover:scale-105 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Gemini Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
};

