import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Layout,
  RotateCcw,
  Sparkles,
  MoreHorizontal,
  Mail
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export const TodoPlanner: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const workspaceId = activeWorkspace?.id || 'workspace-akash-shiv';

  const {
    tasks,
    archivedTasks,
    fetchTasks,
    addTask,
    updateStatus,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    resetBoard,
    clearAllTasks,
  } = useTaskStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [isAdding, setIsAdding] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchTasks(workspaceId);
    }
  }, [workspaceId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(workspaceId, newTaskTitle, newTaskPriority);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const getPriorityBadge = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-[#fff3e5] text-[#ff7a00] border-[#ffe0c2]';
    }
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up font-['Sora']">
      {/* Header Bar with Dynamic Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#f2e8da] bg-white shadow-xs stark-hud-card">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white shadow-xs">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1c1917] tracking-wide">
              Kanban Task Board
            </h3>
            <p className="text-xs text-[#78716c]">
              {completedTasks.length} of {tasks.length} tasks completed
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setIsAdding(true);
              setIsTrashOpen(false);
              setIsMenuOpen(false);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-xs transition-all hover:scale-105 orange-pulse"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Task</span>
          </button>

          {/* Three Dots (...) More Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-[#ff7a00] text-white border-[#ff7a00] shadow-xs'
                  : 'border-[#f0e8dc] hover:bg-[#faf7f2] text-[#78716c]'
              }`}
              title="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-56 bg-white border border-[#f0e8dc] rounded-2xl shadow-xl p-1.5 z-30 animate-fade-in-up space-y-1">
                  <button
                    onClick={() => {
                      setIsTrashOpen(!isTrashOpen);
                      setIsAdding(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                      isTrashOpen
                        ? 'bg-[#fff3e5] text-[#ff7a00]'
                        : 'text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00]'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#78716c]" />
                    <span>{isTrashOpen ? 'Hide Trash Bin' : `View Trash Bin (${archivedTasks.length})`}</span>
                  </button>

                  <div className="h-[1px] bg-[#f2e8da] my-1" />

                  <button
                    onClick={() => {
                      resetBoard(workspaceId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00] transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#ff7a00]" />
                    <span>Reset to Default Tasks</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      useNotificationStore.getState().setModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1c1917] hover:bg-[#fffaf3] hover:text-[#ff7a00] transition-colors text-left"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#ff7a00]" />
                    <span>Email Daily Reminders</span>
                  </button>

                  <div className="h-[1px] bg-[#f2e8da] my-1" />

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (tasks.length === 0) return;
                      if (window.confirm("Move all tasks to the Trash Bin? You can restore them anytime.")) {
                        clearAllTasks(workspaceId);
                      }
                    }}
                    disabled={tasks.length === 0}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                      tasks.length === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Clear All to Trash</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recycle Bin Inline View */}
      {isTrashOpen && (
        <div className="p-4 bg-[#faf7f2] border border-[#f0e8dc] rounded-2xl animate-fade-in-up">
          <h4 className="text-xs font-bold text-[#1c1917] mb-3">Recycle Bin (Tasks Saved in Trash)</h4>
          {archivedTasks.length === 0 ? (
            <p className="text-xs text-[#a8a29e]">Trash Bin is empty. No archived tasks.</p>
          ) : (
            <div className="space-y-2">
              {archivedTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#f0e8dc] shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-[#44403c]">{t.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => restoreTask(workspaceId, t.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => permanentlyDeleteTask(workspaceId, t.id)}
                      className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-[#faf7f2] border border-[#f0e8dc] space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ff7a00]">Add New Task to Board</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#a8a29e] hover:text-[#1c1917] text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="What needs to be done? (e.g., Update Landing Page copy)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00] transition-colors"
            autoFocus
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#78716c] font-semibold">Priority:</span>
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTaskPriority(p)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                    newTaskPriority === p
                      ? 'bg-[#ff7a00] text-white border-[#ff7a00] shadow-xs'
                      : 'bg-white text-[#78716c] border-[#f0e8dc] hover:bg-[#fffaf3]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] text-white text-xs font-bold hover:scale-105 transition-all shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* 3-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: To Do */}
        <div className="rounded-2xl border border-[#f2e8da] bg-white p-3.5 space-y-3 shadow-xs stark-hud-card">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-xs" />
              <span className="text-xs font-black text-[#1c1917]">To Do</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-200">
                {todoTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {todoTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#a8a29e] border border-dashed border-[#f0e8dc] rounded-xl">
                No tasks to do
              </div>
            ) : (
              todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-[#faf7f2] hover:bg-white border border-[#f0e8dc] hover:border-[#ff7a00] shadow-xs hover-lift transition-all duration-300 space-y-2.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'in_progress')}
                        className="mt-0.5 text-[#a8a29e] hover:text-[#ff7a00] transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-[#1c1917] leading-snug">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                      title="Move to trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => updateStatus(workspaceId, task.id, 'in_progress')}
                      className="text-[#ff7a00] hover:underline font-bold"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="rounded-2xl border border-[#f2e8da] bg-white p-3.5 space-y-3 shadow-xs stark-hud-card">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
              <span className="text-xs font-black text-[#1c1917]">In Progress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                {inProgressTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {inProgressTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#a8a29e] border border-dashed border-[#f0e8dc] rounded-xl">
                No active tasks
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-[#fffaf3] hover:bg-white border border-[#ffe0c2] hover:border-[#ff7a00] shadow-xs hover-lift transition-all duration-300 space-y-2.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'completed')}
                        className="mt-0.5 text-amber-600 transition-colors"
                      >
                        <Clock className="w-4 h-4 animate-spin-slow" />
                      </button>
                      <span className="text-xs font-semibold text-[#1c1917] leading-snug">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                      title="Move to trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => updateStatus(workspaceId, task.id, 'completed')}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="rounded-2xl border border-[#f2e8da] bg-white p-3.5 space-y-3 shadow-xs stark-hud-card">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-xs font-black text-emerald-700">Completed</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {completedTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {completedTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#a8a29e] border border-dashed border-[#f0e8dc] rounded-xl">
                No completed tasks
              </div>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-[#faf7f2] hover:bg-white border border-[#f0e8dc] hover:border-emerald-400 shadow-xs space-y-2.5 opacity-80 group hover:opacity-100 hover-lift transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'todo')}
                        className="mt-0.5 text-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                      </button>
                      <span className="text-xs font-semibold text-[#1c1917] line-through opacity-70">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                      title="Move to trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => updateStatus(workspaceId, task.id, 'todo')}
                      className="text-[#78716c] hover:underline font-medium"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Board Footer */}
      <div className="p-3.5 bg-[#faf7f2] border border-[#f2e8da] rounded-2xl flex items-center justify-between shadow-xs text-[11px] text-[#a8a29e] font-medium">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#ff7a00]" />
          <span>Tasks automatically synchronize with the database.</span>
        </div>
        <span className="hidden sm:inline text-[10px] text-[#b0a89d]">More actions in ••• menu</span>
      </div>
    </div>
  );
};
