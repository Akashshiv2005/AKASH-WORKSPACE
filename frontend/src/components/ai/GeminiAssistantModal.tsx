import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Sparkles, X, Send, Bot, User, Flame, Target, BookOpen } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "👋 At your service, Akash! I am JARVIS, your personal AI executive assistant. How may I assist you with your habits, schedule, or productivity goals today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<{ reply: string }>('/ai/chat', {
        message: textToSend.trim(),
      });
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: res.data.reply || 'Always a pleasure assisting you, Akash.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '✨ JARVIS Recommendation: Focus on completing your highest priority task first, Akash. Set a 25-minute Pomodoro timer and minimize distractions.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-xl bg-white dark:bg-[#201c2e] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[560px] text-[#37352f] dark:text-[#e6e6e6]">
        {/* Header Bar */}
        <div className="p-4 border-b border-[#e9e9e7] dark:border-[#332a4a] bg-gradient-to-r from-violet-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">JARVIS AI Productivity Assistant</h3>
              <p className="text-[11px] text-purple-200">Personal executive assistant for Akash Shiv</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-[#f7f7f5] dark:bg-[#1a1726] border-b border-[#e9e9e7] dark:border-[#2e2642] flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => sendMessage('JARVIS, give me an energetic morning motivational boost!')}
            className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 font-medium shrink-0 flex items-center space-x-1 hover:bg-amber-500/20"
          >
            <Flame className="w-3 h-3" />
            <span>Morning Boost</span>
          </button>
          <button
            onClick={() => sendMessage('JARVIS, suggest 3 key daily goals for me today')}
            className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 font-medium shrink-0 flex items-center space-x-1 hover:bg-blue-500/20"
          >
            <Target className="w-3 h-3" />
            <span>Daily Goal Ideas</span>
          </button>
          <button
            onClick={() => sendMessage('JARVIS, how do I optimize my habit tracking routine?')}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-medium shrink-0 flex items-center space-x-1 hover:bg-emerald-500/20"
          >
            <BookOpen className="w-3 h-3" />
            <span>Habit Advice</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                  msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-violet-600 to-purple-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-[#f4f4f2] dark:bg-[#2a243a] text-[#37352f] dark:text-[#f0ecfc] border border-[#e9e9e7] dark:border-[#3d3356] rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-purple-500 text-xs italic">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>JARVIS is processing...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 border-t border-[#e9e9e7] dark:border-[#332a4a] bg-[#ffffff] dark:bg-[#201c2e] flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask JARVIS for advice, task planning, or daily motivation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#332a4a] rounded-xl text-xs outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
