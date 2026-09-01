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
  'linear-gradient(135deg, #e62429 0%, #ff8c00 100%)',
  'linear-gradient(135deg, #8b0000 0%, #ffd700 100%)',
  'linear-gradient(135deg, #111319 0%, #dc2626 100%)',
  'linear-gradient(135deg, #1a1c29 0%, #f59e0b 100%)',
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
    <div className="relative group select-none max-w-4xl mx-auto pt-6 px-16">
      {/* Optional Page Cover Image (ONLY shown if user explicitly sets cover_image) */}
      {page.cover_image && (
        <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-6 group/cover shadow-md">
          <div
            className="w-full h-full"
            style={{ background: page.cover_image }}
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs text-white">
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
        <div className="mb-4 p-3 rounded-2xl bg-[#141722] border border-amber-500/30 shadow-2xl space-y-2 z-30 animate-fade-in-up">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Select Cover Gradient</span>
            <button onClick={() => setShowCoverPicker(false)}>
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COVER_GRADIENTS.map((grad, i) => (
              <button
                key={i}
                onClick={() => handleSelectCover(grad)}
                style={{ background: grad }}
                className="h-10 rounded-xl hover:scale-105 transition-transform border border-white/20"
              />
            ))}
          </div>
        </div>
      )}

      {/* Hover Action Bar to Add Icon / Cover if missing */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2 h-6">
        {!page.icon && (
          <button
            onClick={() => setShowIconPicker(true)}
            className="flex items-center space-x-1 hover:text-amber-400 px-2 py-1 rounded hover:bg-white/10"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Add icon</span>
          </button>
        )}
        {!page.cover_image && (
          <button
            onClick={() => setShowCoverPicker(true)}
            className="flex items-center space-x-1 hover:text-red-400 px-2 py-1 rounded hover:bg-white/10"
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
            className="text-4xl hover:scale-110 transition-transform p-1 rounded-xl hover:bg-white/10"
          >
            {page.icon}
          </button>

          {showIconPicker && (
            <div className="absolute top-12 left-0 bg-[#141722] border border-amber-500/30 rounded-2xl shadow-2xl p-3 z-50 w-64 space-y-2 text-xs animate-fade-in-up">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>Select Icon</span>
                <button onClick={() => setShowIconPicker(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
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
                className="w-full text-center py-1 text-red-400 hover:underline text-[11px] font-semibold"
              >
                Remove icon
              </button>
            </div>
          )}
        </div>
      )}

      {/* Page Title Input */}
      <input
        type="text"
        value={page.title || ''}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="w-full text-3xl font-extrabold bg-transparent outline-none text-[#37352f] dark:text-white placeholder-[#b4b4b0] dark:placeholder-gray-600 tracking-tight"
      />
    </div>
  );
};
