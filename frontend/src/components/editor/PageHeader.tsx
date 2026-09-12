import React, { useState } from 'react';
import { Page, usePageStore } from '../../store/usePageStore';
import { TypewriterText } from '../common/TypewriterText';
import {
  Smile,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface PageHeaderProps {
  page: Page;
}

const COMMON_EMOJIS = ['🚀', '🎯', '🔥', '⚡', '📖', '🧘', '🏋️', '💻', '💡', '📋', '🏆', '⭐'];

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #ff7a00 0%, #ffaa00 100%)',
  'linear-gradient(135deg, #1c1917 0%, #ff7a00 100%)',
  'linear-gradient(135deg, #05080c 0%, #00ff66 100%)',
  'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)',
];

export const PageHeader: React.FC<PageHeaderProps> = ({ page }) => {
  const { updatePage } = usePageStore();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const handleSelectIcon = (emoji: string) => {
    updatePage(page.id, { icon: emoji });
    setShowIconPicker(false);
  };

  const handleRemoveIcon = () => {
    updatePage(page.id, { icon: '' });
    setShowIconPicker(false);
  };

  const handleSelectCover = (cover: string) => {
    updatePage(page.id, { cover_image: cover });
    setShowCoverPicker(false);
  };

  const handleRemoveCover = () => {
    updatePage(page.id, { cover_image: '' });
  };

  return (
    <div className="relative group max-w-4xl mx-auto pt-6 px-4 sm:px-16">
      {/* Letter-by-Letter Flow & Backspace Removal Typewriter Banner */}
      <div className="w-full overflow-hidden py-2 px-3.5 rounded-xl bg-[#fffaf3] border border-[#ffe9d1] text-[#ff7a00] text-xs font-bold mb-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <span className="px-2 py-0.5 rounded-md bg-[#ff7a00] text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
            LIVE FOCUS
          </span>
          <TypewriterText
            phrases={[
              "Daily Habit Tracker & Streaks • Live Activity & Task Execution",
              "Build unbreakable consistency • Small daily habits create massive success",
              "Never break the streak • Track every task and habit effortlessly",
              "Execute high-priority items • Akash Shiv's Connected Workspace"
            ]}
            typingSpeed={50}
            deletingSpeed={25}
            pauseDuration={2400}
            className="truncate font-semibold text-[#1c1917]"
            cursorClassName="text-[#ff7a00]"
          />
        </div>
      </div>

      {/* Optional Page Cover Image */}
      {page.cover_image && (
        <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden mb-6 group/cover shadow-md">
          <div
            className="w-full h-full"
            style={{ background: page.cover_image }}
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white">
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="hover:text-amber-400 font-semibold"
            >
              Change cover
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={handleRemoveCover}
              className="hover:text-red-400 font-semibold"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Cover Picker Dropdown */}
      {showCoverPicker && (
        <div className="mb-4 p-3 rounded-2xl bg-white border border-[#f2e8da] shadow-xl space-y-2 z-30 animate-fade-in-up">
          <div className="flex items-center justify-between text-xs font-bold text-[#ff7a00]">
            <span>Select Cover Gradient</span>
            <button onClick={() => setShowCoverPicker(false)}>
              <X className="w-4 h-4 text-gray-400 hover:text-black" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COVER_GRADIENTS.map((grad, i) => (
              <button
                key={i}
                onClick={() => handleSelectCover(grad)}
                style={{ background: grad }}
                className="h-10 rounded-xl hover:scale-105 transition-transform border border-black/10"
              />
            ))}
          </div>
        </div>
      )}

      {/* Hover Action Bar to Add Icon / Cover if missing */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-[#a8a29e] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mb-2 h-6">
        {!page.icon && (
          <button
            onClick={() => setShowIconPicker(true)}
            className="flex items-center space-x-1 hover:text-[#ff7a00] px-2 py-1 rounded hover:bg-[#fff3e5]"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Add icon</span>
          </button>
        )}
        {!page.cover_image && (
          <button
            onClick={() => setShowCoverPicker(true)}
            className="flex items-center space-x-1 hover:text-[#ff7a00] px-2 py-1 rounded hover:bg-[#fff3e5]"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Add cover</span>
          </button>
        )}
      </div>

      {/* Title & Icon Container */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Icon Display */}
        {page.icon && (
          <div className="relative inline-block shrink-0">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-4xl sm:text-5xl hover:scale-110 transition-transform p-1.5 rounded-2xl hover:bg-[#fff3e5]"
            >
              {page.icon}
            </button>

            {showIconPicker && (
              <div className="absolute top-14 left-0 bg-white border border-[#f2e8da] rounded-2xl shadow-2xl p-3 z-50 w-64 space-y-2 text-xs animate-fade-in-up">
                <div className="flex items-center justify-between text-[#ff7a00] font-bold">
                  <span>Select Icon</span>
                  <button onClick={() => setShowIconPicker(false)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-black" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSelectIcon(emoji)}
                      className="text-xl hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRemoveIcon}
                  className="w-full text-center py-1 text-red-500 hover:underline text-[11px] font-semibold"
                >
                  Remove icon
                </button>
              </div>
            )}
          </div>
        )}

        {/* Static Page Title Heading */}
        <div className="flex-1 relative flex items-start min-w-[240px]">
          <h1 className="w-full text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c1917] tracking-tight font-['Sora'] leading-tight py-1 select-text">
            {page.title || 'Untitled'}
          </h1>
        </div>
      </div>
    </div>
  );
};
