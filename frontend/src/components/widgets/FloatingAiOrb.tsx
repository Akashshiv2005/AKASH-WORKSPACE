import React, { useState } from 'react';
import { Sparkles, Shield, X } from 'lucide-react';
import { GeminiAssistantModal } from '../ai/GeminiAssistantModal';

export const FloatingAiOrb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  React.useEffect(() => {
    setShowTooltip(window.innerWidth > 768);
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 select-none group">
        {/* Tooltip Teaser Bubble */}
        {showTooltip && !isOpen && (
          <div className="absolute right-0 bottom-16 mb-2 w-56 p-3 rounded-xl bg-white border border-[#f2e8da] shadow-xl text-xs flex items-start justify-between animate-fade-in-up">
            <div className="space-y-0.5">
              <span className="font-bold text-[#ff7a00] flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#ff7a00]" />
                <span>JARVIS AI Assistant</span>
              </span>
              <p className="text-[11px] text-[#78716c]">
                Need habit advice or task assistance, Akash?
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-[#a8a29e] hover:text-red-500 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating Orange Shield Orb Button (Exact ChatGPT Screenshot Design) */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white shadow-2xl animate-float orange-pulse hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white"
          title="Open JARVIS AI Assistant"
        >
          <Shield className="w-6 h-6 relative z-10 text-white fill-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#ff7a00] animate-ping" />
        </button>
      </div>

      {/* Gemini Assistant Modal */}
      <GeminiAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
