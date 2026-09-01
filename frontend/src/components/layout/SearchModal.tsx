import React, { useEffect, useState } from 'react';
import { usePageStore } from '../../store/usePageStore';
import { Search, X, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearching, setSearching, pages, setActivePageId } = usePageStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearching(!isSearching);
      }
      if (e.key === 'Escape' && isSearching) {
        setSearching(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, setSearching]);

  if (!isSearching) return null;

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 z-50 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#333333] rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#37352f] dark:text-[#e6e6e6]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#e9e9e7] dark:border-[#333333] flex items-center space-x-3">
          <Search className="w-4 h-4 text-[#787774] shrink-0" />
          <input
            type="text"
            placeholder="Search pages by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder-[#787774] dark:placeholder-[#9b9b9b]"
            autoFocus
          />
          <button
            onClick={() => setSearching(false)}
            className="p-1 rounded hover:bg-[#efefee] dark:hover:bg-[#2f2f2f] text-[#787774]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredPages.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#787774]">
              No pages matching "{query}"
            </div>
          ) : (
            filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => {
                  setActivePageId(page.id);
                  setSearching(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f4f4f2] dark:hover:bg-[#2f2f2f] cursor-pointer transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-base">{page.icon || '📄'}</span>
                  <span className="font-medium truncate">{page.title || 'Untitled'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#787774] transition-opacity" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-[#f7f7f5] dark:bg-[#1f1f1f] border-t border-[#e9e9e7] dark:border-[#333333] flex items-center justify-between text-[11px] text-[#787774]">
          <span>
            Navigate with <kbd className="px-1 py-0.5 bg-white dark:bg-[#2c2c2c] rounded border">↑</kbd>{' '}
            <kbd className="px-1 py-0.5 bg-white dark:bg-[#2c2c2c] rounded border">↓</kbd>
          </span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
