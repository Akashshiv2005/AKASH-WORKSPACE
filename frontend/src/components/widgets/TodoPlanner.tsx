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
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  return (
    <div className="my-6 space-y-6 select-none animate-fade-in-up font-['Sora']">
      {/* Header Bar with Dynamic Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 bg-white shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 text-white shadow-xs">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 tracking-wide cursor-default">
              Task Board
            </h3>
            <p className="text-xs text-zinc-500 animate-text-reveal">
              <span className="font-bold text-red-600">{completedTasks.length}</span> of {tasks.length} tasks completed
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
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black shadow-xs transition-all hover:scale-105 border border-amber-400/40"
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
                  ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                  : 'border-zinc-200 hover:bg-amber-50 text-zinc-600'
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
                <div className="absolute right-0 top-10 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl p-1.5 z-30 animate-fade-in-up space-y-1">
                  <button
                    onClick={() => {
                      setIsTrashOpen(!isTrashOpen);
                      setIsAdding(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left ${
                      isTrashOpen
                        ? 'bg-amber-50 text-red-600'
                        : 'text-zinc-800 hover:bg-amber-50 hover:text-red-600'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{isTrashOpen ? 'Hide Trash Bin' : `View Trash Bin (${archivedTasks.length})`}</span>
                  </button>

                  <div className="h-[1px] bg-zinc-200 my-1" />

                  <button
                    onClick={() => {
                      resetBoard(workspaceId);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-amber-50 hover:text-red-600 transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reset to Default Tasks</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      useNotificationStore.getState().setModalOpen(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-amber-50 hover:text-red-600 transition-colors text-left"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Email Daily Reminders</span>
                  </button>

                  <div className="h-[1px] bg-zinc-200 my-1" />

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
                        ? 'text-zinc-300 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
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
        <div className="p-4 bg-amber-50/50 border border-zinc-200 rounded-2xl animate-fade-in-up">
          <h4 className="text-xs font-bold text-zinc-900 mb-3">Recycle Bin (Tasks Saved in Trash)</h4>
          {archivedTasks.length === 0 ? (
            <p className="text-xs text-zinc-400">Trash Bin is empty. No archived tasks.</p>
          ) : (
            <div className="space-y-2">
              {archivedTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-zinc-200 shadow-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-zinc-800">{t.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => restoreTask(workspaceId, t.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => permanentlyDeleteTask(workspaceId, t.id)}
                      className="p-1 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
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
        <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 shadow-xs space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600">Add New Task to Board</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            placeholder="What needs to be done? (e.g., Update Landing Page copy)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 outline-none focus:border-red-600 transition-colors placeholder:text-zinc-400"
            autoFocus
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-500 font-semibold">Priority:</span>
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTaskPriority(p)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                    newTaskPriority === p
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-amber-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-bold hover:scale-105 transition-all shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: To Do */}
        <div className="rounded-2xl border border-zinc-200 bg-amber-50/30 p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
              <span className="text-xs font-black text-zinc-900">To Do</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {todoTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {todoTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-xl">
                No tasks to do
              </div>
            ) : (
              todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white hover:bg-amber-50/50 border border-zinc-200 hover:border-amber-300 shadow-xs hover-lift transition-all duration-300 space-y-2.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'in_progress')}
                        className="mt-0.5 text-zinc-400 hover:text-amber-600 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-zinc-900 leading-snug group-hover:text-red-600 transition-colors">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-opacity"
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
                      className="text-amber-600 hover:text-amber-700 font-bold"
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
        <div className="rounded-2xl border border-zinc-200 bg-amber-50/30 p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
              <span className="text-xs font-black text-zinc-900">In Progress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                {inProgressTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {inProgressTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-xl">
                No active tasks
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white hover:bg-amber-50/50 border border-zinc-200 hover:border-amber-300 shadow-xs hover-lift transition-all duration-300 space-y-2.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'completed')}
                        className="mt-0.5 text-amber-600 transition-colors"
                      >
                        <Clock className="w-4 h-4 animate-spin-slow" />
                      </button>
                      <span className="text-xs font-semibold text-zinc-900 leading-snug group-hover:text-red-600 transition-colors">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-opacity"
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
                      className="text-emerald-600 hover:text-emerald-700 font-bold"
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
        <div className="rounded-2xl border border-zinc-200 bg-amber-50/30 p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-xs font-black text-zinc-900">Completed</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {completedTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {completedTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-xl">
                No completed tasks
              </div>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white hover:bg-amber-50/50 border border-zinc-200 hover:border-emerald-300 shadow-xs space-y-2.5 opacity-80 group hover:opacity-100 hover-lift transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => updateStatus(workspaceId, task.id, 'todo')}
                        className="mt-0.5 text-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-zinc-500 line-through">
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(workspaceId, task.id)}
                      className="p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-400 hover:text-rose-600 transition-opacity"
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
                      className="text-zinc-500 hover:text-zinc-900 hover:underline font-medium"
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
      <div className="p-3.5 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between shadow-xs text-[11px] text-zinc-600 font-medium">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tasks automatically synchronize with the database.</span>
        </div>
        <span className="hidden sm:inline text-[10px] text-slate-500">More actions in ••• menu</span>
      </div>
    </div>
  );
};

