import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Layout
} from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Design Q3 Product Architecture & Wireframes',
    category: 'Design',
    priority: 'High',
    status: 'in_progress',
    dueDate: '2026-09-05',
  },
  {
    id: 'task-2',
    title: 'Refactor Auth Service & JWT token refresh flow',
    category: 'Engineering',
    priority: 'High',
    status: 'completed',
    dueDate: '2026-09-02',
  },
  {
    id: 'task-3',
    title: 'Draft Product Launch Announcement Post',
    category: 'Marketing',
    priority: 'Medium',
    status: 'todo',
    dueDate: '2026-09-10',
  },
  {
    id: 'task-4',
    title: 'Perform Security Audit on Database Migrations',
    category: 'Security',
    priority: 'High',
    status: 'todo',
    dueDate: '2026-09-12',
  },
  {
    id: 'task-5',
    title: 'Set up automated E2E tests for Tiptap block editor',
    category: 'QA',
    priority: 'Low',
    status: 'in_progress',
    dueDate: '2026-09-15',
  },
];

export const TodoPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: 'General',
      priority: newTaskPriority,
      status: 'todo',
      dueDate: 'Today',
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const updateStatus = (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
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
    <div className="my-6 space-y-6 select-none animate-fade-in-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-[#f2e8da] bg-white shadow-xs stark-hud-card">
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

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-black shadow-xs transition-all hover:scale-105 orange-pulse"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Task</span>
        </button>
      </div>

      {/* Add Task Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-[#faf7f2] border border-[#f0e8dc] space-y-3 animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none focus:border-[#ff7a00] text-[#1c1917] font-medium"
              autoFocus
            />
            <select
              value={newTaskPriority}
              onChange={(e: any) => setNewTaskPriority(e.target.value)}
              className="px-3 py-2 bg-white border border-[#f0e8dc] rounded-xl text-xs outline-none text-[#ff7a00] font-bold"
            >
              <option value="High">High Priority (Red)</option>
              <option value="Medium">Medium Priority (Amber)</option>
              <option value="Low">Low Priority (Orange)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[#ff7a00] text-white text-xs font-black rounded-xl shadow-xs"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-xs text-[#78716c]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: To Do */}
        <div className="rounded-2xl border border-[#f2e8da] bg-white p-3.5 space-y-3 shadow-xs stark-hud-card">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-xs animate-ping" />
              <span className="text-xs font-black text-red-600">To Do</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-200">
                {todoTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#f0e8dc] shadow-xs space-y-2.5 group hover:border-[#ff7a00] hover:scale-[1.02] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => updateStatus(task.id, 'in_progress')}
                      className="mt-0.5 text-[#a8a29e] hover:text-[#ff7a00] transition-colors"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#1c1917]">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => updateStatus(task.id, 'in_progress')}
                    className="text-[#ff7a00] font-extrabold hover:underline"
                  >
                    Initiate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="rounded-2xl border border-[#f2e8da] bg-white p-3.5 space-y-3 shadow-xs stark-hud-card">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs animate-pulse" />
              <span className="text-xs font-black text-amber-700">In Progress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                {inProgressTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#f0e8dc] shadow-xs space-y-2.5 group hover:border-[#ff7a00] hover:scale-[1.02] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => updateStatus(task.id, 'completed')}
                      className="mt-0.5 text-amber-600 hover:text-emerald-600 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#1c1917]">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => updateStatus(task.id, 'completed')}
                    className="text-emerald-600 font-extrabold hover:underline"
                  >
                    Complete ✓
                  </button>
                </div>
              </div>
            ))}
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
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#f0e8dc] shadow-xs space-y-2.5 opacity-80 group hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => updateStatus(task.id, 'todo')}
                      className="mt-0.5 text-emerald-600 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                    </button>
                    <span className="text-xs font-semibold text-[#1c1917] line-through opacity-70">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 text-[#a8a29e] hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-md border font-black ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => updateStatus(task.id, 'todo')}
                    className="text-[#78716c] hover:underline font-medium"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
