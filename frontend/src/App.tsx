import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { HeaderBar } from './components/layout/HeaderBar';
import { SearchModal } from './components/layout/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { EmailNotificationModal } from './components/notifications/EmailNotificationModal';
import { PageHeader } from './components/editor/PageHeader';
import { BlockEditor } from './components/editor/BlockEditor';
import { FloatingAiOrb } from './components/widgets/FloatingAiOrb';
import { ServerHealthBanner } from './components/common/ServerHealthBanner';
import { IronManLandingPage } from './components/ironman/IronManLandingPage';
import { usePageStore } from './store/usePageStore';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { useAuthStore } from './store/useAuthStore';
import { useTaskStore } from './store/useTaskStore';
import { useHabitStore } from './store/useHabitStore';
import { useExpenseStore } from './store/useExpenseStore';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth > 768);
    setIsRightSidebarOpen(window.innerWidth > 768);
  }, []);
  const [darkMode, setDarkMode] = useState(true);

  const { fetchCurrentUser } = useAuthStore();
  const { fetchWorkspaces, activeWorkspace } = useWorkspaceStore();
  const { fetchPages, pages, activePageId } = usePageStore();

  useEffect(() => {
    const initializeAppData = async () => {
      await fetchCurrentUser();
      await fetchWorkspaces();
    };
    initializeAppData();
  }, []);

  useEffect(() => {
    if (activeWorkspace?.id) {
      const wsId = activeWorkspace.id;
      fetchPages(wsId);
      useTaskStore.getState().fetchTasks(wsId);
      useHabitStore.getState().fetchHabits(wsId);
      useExpenseStore.getState().fetchExpenses(wsId);
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

  if (viewMode === 'landing') {
    return (
      <IronManLandingPage onEnterWorkspace={() => setViewMode('workspace')} />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#180306] text-zinc-100 relative font-['Sora'] select-none">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => {
          setIsSidebarOpen(!isSidebarOpen);
          if (!isSidebarOpen && window.innerWidth <= 768) setIsRightSidebarOpen(false);
        }}
        onBackToLanding={() => setViewMode('landing')}
      />

      {/* Center Layout Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10">
        {/* Render Cold-Start & Keep-Alive Banner */}
        <ServerHealthBanner />

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
          onBackToLanding={() => setViewMode('landing')}
        />

        {/* Main Editor Page View */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative z-10">
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
