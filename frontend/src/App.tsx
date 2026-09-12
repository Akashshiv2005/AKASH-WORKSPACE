import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { HeaderBar } from './components/layout/HeaderBar';
import { SearchModal } from './components/layout/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { EmailNotificationModal } from './components/notifications/EmailNotificationModal';
import { PageHeader } from './components/editor/PageHeader';
import { BlockEditor } from './components/editor/BlockEditor';
import { FloatingAiOrb } from './components/widgets/FloatingAiOrb';
import { usePageStore } from './store/usePageStore';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { useAuthStore } from './store/useAuthStore';

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth > 768);
    setIsRightSidebarOpen(window.innerWidth > 768);
  }, []);
  const [darkMode, setDarkMode] = useState(false);

  const { fetchCurrentUser } = useAuthStore();
  const { fetchWorkspaces, activeWorkspace } = useWorkspaceStore();
  const { fetchPages, pages, activePageId } = usePageStore();

  useEffect(() => {
    fetchCurrentUser();
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      fetchPages(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activePage = pages.find((p) => p.id === activePageId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fdfbf7] text-[#1c1917]">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => {
          setIsSidebarOpen(!isSidebarOpen);
          if (!isSidebarOpen && window.innerWidth <= 768) setIsRightSidebarOpen(false);
        }}
      />

      {/* Center Layout Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        {/* Header Bar */}
        <HeaderBar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => {
            setIsSidebarOpen(!isSidebarOpen);
            if (!isSidebarOpen && window.innerWidth <= 768) setIsRightSidebarOpen(false);
          }}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleRightSidebar={() => {
            setIsRightSidebarOpen(!isRightSidebarOpen);
            if (!isRightSidebarOpen && window.innerWidth <= 768) setIsSidebarOpen(false);
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main Editor Page View */}
        <main className="flex-1 overflow-y-auto relative">
          {activePage ? (
            <div className="animate-fade-in-up">
              <PageHeader page={activePage} />
              <BlockEditor page={activePage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 select-none">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center text-2xl font-black shadow-xl animate-float">
                ⚡
              </div>
              <h2 className="text-xl font-bold text-[#37352f] dark:text-white">
                No Page Selected
              </h2>
              <p className="text-xs text-gray-500 max-w-sm">
                Select a page from the left sidebar or create a new page to start building your workspace.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Right Productivity Dock Side Panel */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        toggleRightSidebar={() => {
          setIsRightSidebarOpen(!isRightSidebarOpen);
          if (!isRightSidebarOpen && window.innerWidth <= 768) setIsSidebarOpen(false);
        }}
      />

      {/* Global Floating AI Assistant Orb */}
      <FloatingAiOrb />

      {/* Global Modals */}
      <SearchModal />
      <AuthModal />
      <EmailNotificationModal />
    </div>
  );
};

export default App;
