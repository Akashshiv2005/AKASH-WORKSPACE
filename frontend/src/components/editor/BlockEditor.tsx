import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import { Page, usePageStore } from '../../store/usePageStore';
import { HabitTracker } from '../widgets/HabitTracker';
import { TodoPlanner } from '../widgets/TodoPlanner';
import { PomodoroTimer } from '../widgets/PomodoroTimer';
import { DailyJournal } from '../widgets/DailyJournal';
import { ExpenseTracker } from '../widgets/ExpenseTracker';
import { GeminiMotivationBanner } from '../widgets/GeminiMotivationBanner';
import {
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter
} from 'lucide-react';

interface BlockEditorProps {
  page: Page;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ page }) => {
  const { updatePage } = usePageStore();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Press '/' for commands or start typing...",
      }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
    ],
    content: page.content ? (typeof page.content === 'string' && page.content.startsWith('{') ? JSON.parse(page.content) : page.content) : '<p></p>',
    onUpdate: ({ editor }) => {
      const jsonContent = JSON.stringify(editor.getJSON());
      updatePage(page.id, { content: jsonContent });

      // Detect Slash command
      const { selection } = editor.state;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, selection.from - 2),
        selection.from,
        '\n'
      );

      if (textBefore === '/') {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSlashMenuPos({ top: rect.bottom + 8, left: rect.left });
          setShowSlashMenu(true);
        }
      } else {
        setShowSlashMenu(false);
      }
    },
  });

  // Re-sync content when switching active page
  useEffect(() => {
    if (editor && page) {
      const parsedContent = page.content ? (typeof page.content === 'string' && page.content.startsWith('{') ? JSON.parse(page.content) : page.content) : '<p></p>';
      editor.commands.setContent(parsedContent);
    }
  }, [page.id]);

  if (!editor) return null;

  const runCommand = (action: () => void) => {
    action();
    setShowSlashMenu(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-16 pb-24 text-[#37352f] dark:text-[#e6e6e6]">
      {/* Gemini AI Daily Motivation Banner */}
      <GeminiMotivationBanner />

      {/* Widget Render: Habit Tracker */}
      {page.widget_type === 'habit_tracker' && <HabitTracker />}

      {/* Widget Render: To-Do Planner */}
      {page.widget_type === 'todo_planner' && <TodoPlanner />}

      {/* Widget Render: Pomodoro Focus Timer */}
      {page.widget_type === 'pomodoro' && <PomodoroTimer />}

      {/* Widget Render: Daily Journal & Reflection */}
      {page.widget_type === 'journal' && <DailyJournal />}

      {/* Widget Render: Expense Tracker */}
      {page.widget_type === 'expense_tracker' && <ExpenseTracker />}

      {/* Floating Toolbar when selecting text */}
      {editor.state.selection && !editor.state.selection.empty && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black dark:bg-[#2c2c2c] text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center space-x-1 z-40 text-xs">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('underline') ? 'text-blue-400' : ''}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('strike') ? 'text-blue-400' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('highlight') ? 'text-yellow-400' : ''}`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-white/20 ${editor.isActive('code') ? 'text-blue-400' : ''}`}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tiptap Editor Content Component */}
      {page.widget_type ? (
        <div className="mt-8 pt-6 border-t border-[#f2e8da] dark:border-[#333333]">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#a8a29e] mb-3 select-none">
            <span>📝</span>
            <span>Page Notes & Scratchpad</span>
          </div>
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-none focus:outline-none min-h-[120px] font-sans"
          />
        </div>
      ) : (
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none focus:outline-none min-h-[250px] font-sans pt-2"
        />
      )}

      {/* Slash Commands Floating Popup */}
      {showSlashMenu && (
        <div
          style={{ top: `${slashMenuPos.top}px`, left: `${slashMenuPos.left}px` }}
          className="fixed bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#333333] rounded-xl shadow-2xl p-2 z-50 w-64 space-y-1 text-xs text-[#37352f] dark:text-[#e6e6e6]"
        >
          <div className="px-2 py-1 text-[10px] font-bold uppercase text-[#787774] dark:text-[#9b9b9b]">
            Basic Blocks
          </div>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleHeading({ level: 1 }).run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <Heading1 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="font-semibold">Heading 1</p>
              <p className="text-[10px] text-[#787774]">Big section title</p>
            </div>
          </button>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleHeading({ level: 2 }).run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <Heading2 className="w-4 h-4 text-purple-500" />
            <div>
              <p className="font-semibold">Heading 2</p>
              <p className="text-[10px] text-[#787774]">Medium section title</p>
            </div>
          </button>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBulletList().run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <List className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="font-semibold">Bullet List</p>
              <p className="text-[10px] text-[#787774]">Simple bulleted list</p>
            </div>
          </button>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleTaskList().run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <CheckSquare className="w-4 h-4 text-amber-500" />
            <div>
              <p className="font-semibold">To-do List</p>
              <p className="text-[10px] text-[#787774]">Track tasks with checkboxes</p>
            </div>
          </button>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).toggleBlockquote().run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <Quote className="w-4 h-4 text-rose-500" />
            <div>
              <p className="font-semibold">Quote</p>
              <p className="text-[10px] text-[#787774]">Capture a quote or highlight</p>
            </div>
          </button>

          <button
            onClick={() => runCommand(() => editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).setHorizontalRule().run())}
            className="w-full text-left px-2.5 py-1.5 hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] rounded-lg flex items-center space-x-2.5"
          >
            <Minus className="w-4 h-4 text-[#787774]" />
            <div>
              <p className="font-semibold">Divider</p>
              <p className="text-[10px] text-[#787774]">Visually divide content</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
