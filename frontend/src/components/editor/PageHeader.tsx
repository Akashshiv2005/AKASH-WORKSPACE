import React, { useState } from 'react';
import { Page, usePageStore } from '../../store/usePageStore';
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePage(page.id, { title: e.target.value });
  };

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
    <div className="relative group select-none max-w-4xl mx-auto pt-6 px-12 sm:px-16">
      {/* Right-to-Left Floating Ticker Bar in Title Area */}
      <div className="w-full overflow-hidden whitespace-nowrap py-1.5 px-3 rounded-xl bg-[#fff3e5] border border-[#ffe0c2] text-[#ff7a00] text-xs font-bold mb-4 shadow-xs">
        <div className="animate-flow-rtl">
          ✨ {page.title || 'Akash Workspace'} • Live Activity & Task Execution • Build Consistency • Akash Shiv's Connected Workspace ✨
        </div>
      </div>

      {/* Optional Page Cover Image */}
      {page.cover_image && (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-6 group/cover shadow-md">
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
            <span>•</span>
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
      <div className="flex items-center space-x-2 text-xs font-semibold text-[#a8a29e] opacity-0 group-hover:opacity-100 transition-opacity mb-2 h-6">
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

      {/* Icon Display */}
      {page.icon && (
        <div className="relative inline-block mb-3">
          <button
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="text-5xl hover:scale-110 transition-transform p-1.5 rounded-2xl hover:bg-[#fff3e5]"
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

      {/* Page Title Input (Enlarged Outfit Font) */}
      <input
        type="text"
        value={page.title || ''}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="w-full text-4xl sm:text-5xl font-extrabold bg-transparent outline-none text-[#1c1917] placeholder-[#a8a29e] tracking-tight font-['Sora']"
      />
    </div>
  );
};
