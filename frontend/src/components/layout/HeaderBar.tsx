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
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  isRightSidebarOpen = true,
  toggleRightSidebar,
  darkMode,
  setDarkMode,
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
      <header className="h-12 border-b border-[#f0e8dc] glass-header px-4 flex items-center justify-between text-[#1c1917] select-none z-10 transition-colors">
        {/* Left Section: Workspace & Breadcrumbs */}
        <div className="flex items-center space-x-2.5 min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-[#f2ebe1] text-[#78716c] transition-colors"
              title="Open Left Sidebar"
            >
              <PanelLeft className="w-4 h-4 text-[#ff7a00]" />
            </button>
          )}

          {/* Workspace Shield Logo */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-gradient-dark hover-text-shimmer truncate max-w-[120px] md:max-w-none">
              {activeWorkspace?.name || "Akash Shiv's Workspace"}
            </span>
          </div>

          {/* Breadcrumb Path */}
          {breadcrumbs.map((page, index) => (
            <React.Fragment key={page.id}>
              <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e] shrink-0" />
              <div className="flex items-center space-x-1 min-w-0">
                {page.icon && <span className="text-xs shrink-0 animate-text-pop">{page.icon}</span>}
                <span className={`text-xs truncate transition-all duration-300 ${index === breadcrumbs.length - 1 ? 'font-bold text-[#1c1917] hover:text-[#ff7a00] animate-text-reveal' : 'text-[#78716c] hover:text-[#1c1917]'}`}>
                  {page.title || 'Untitled'}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Right Section: Ask JARVIS, Notifications & Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Ask JARVIS Button (ChatGPT Orange Accent) */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center space-x-1.5 px-2 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-sm transition-all hover:scale-105 orange-pulse"
            title="Open JARVIS AI Assistant"
          >
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
            <span className="tracking-wide hidden sm:inline shimmer-text-orange !text-white hover-lift">Ask JARVIS</span>
          </button>

          {/* Favorite Button */}
          {activePage && (
            <button
              onClick={() => toggleFavorite(activePage.id)}
              className={`hidden sm:flex p-1.5 rounded-lg hover:bg-[#f2ebe1] transition-colors ${
                activePage.is_favorite ? 'text-[#ff7a00]' : 'text-[#a8a29e]'
              }`}
              title={activePage.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-4 h-4 ${activePage.is_favorite ? 'fill-[#ff7a00]' : ''}`} />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-1.5 rounded-lg hover:bg-[#f2ebe1] text-[#78716c] transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#ff7a00]" /> : <Moon className="w-4 h-4 text-[#78716c]" />}
          </button>

          {/* Right Side Dock Toggle Button */}
          {toggleRightSidebar && (
            <button
              onClick={toggleRightSidebar}
              className={`p-1.5 rounded-lg hover:bg-[#f2ebe1] transition-colors ${
                isRightSidebarOpen ? 'text-[#ff7a00] font-bold' : 'text-[#78716c]'
              }`}
              title="Toggle Productivity Dock"
            >
              <PanelRight className="w-4 h-4" />
            </button>
          )}

          {/* Notifications Icon */}
          <button
            onClick={() => setNotificationModalOpen(true)}
            className="group relative flex p-1.5 rounded-lg hover:bg-[#f2ebe1] text-[#78716c] hover:text-[#ff7a00] hover:scale-110 active:scale-90 transition-all duration-200"
            title="Gmail Daily Digest & Task Reminders"
          >
            <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {notificationSettings?.is_enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff7a00] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs hover:bg-[#f2ebe1] text-[#44403c] transition-colors"
            title="Share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#78716c]" />}
            <span className="hidden sm:inline font-medium">{copied ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Page Options Menu */}
          {activePage && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg hover:bg-[#f2ebe1] text-[#78716c] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-[#f0e8dc] shadow-xl py-1 text-xs text-[#1c1917] z-50 animate-fade-in-up">
                  <button
                    onClick={() => {
                      duplicatePage(activePage.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#f9f6f0] flex items-center space-x-2 font-medium text-[#ff7a00]"
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
                    className="w-full text-left px-3 py-1.5 hover:bg-[#f9f6f0] flex items-center space-x-2 font-medium text-emerald-600"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Export Workspace JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      archivePage(activePage.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#f9f6f0] text-red-500 flex items-center space-x-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to Trash</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="w-[1px] h-4 bg-[#f0e8dc] mx-1" />

          {/* User Auth Profile Trigger */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center text-xs font-black shadow-xs">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-bold text-[#1c1917] hidden md:inline">
                {user?.full_name || 'Akash Shiv'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true, 'login')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#ff7a00] hover:bg-[#e66e00] text-white text-xs font-bold transition-all hover:scale-105 shadow-sm"
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
