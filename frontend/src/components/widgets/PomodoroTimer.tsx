import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Flame, Zap, Award, Shield } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(3);

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60;

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'focus') {
        setSessionsCount((prev) => prev + 1);
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  return (
    <div className="my-6 select-none animate-fade-in-up">
      <div className="rounded-3xl border border-[#00f0ff]/30 bg-[#101424]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6 text-center stark-hud-card">
        {/* Mode Switcher Pills */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#0a0c16] border border-[#00f0ff]/30 space-x-2">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-105 arc-reactor-glow'
                : 'text-[#91a0c0] hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>25m Arc Focus</span>
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md scale-105'
                : 'text-[#91a0c0] hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>5m Recharge</span>
          </button>
        </div>

        {/* Timer Countdown Display (Arc Reactor Ring) */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-60 h-60 rounded-full border-8 border-[#00f0ff]/30 flex flex-col items-center justify-center relative shadow-2xl arc-reactor-glow">
            <div className="text-5xl font-black tracking-tight text-[#00f0ff] font-mono stark-text-cyan">
              {formattedTime}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mt-2 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400 inline" />
              <span>{mode === 'focus' ? '🎯 Arc Focus Online' : '☕ Recharge Mode'}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-1">
          <div className="w-full bg-[#182038] h-3 rounded-full overflow-hidden border border-[#00f0ff]/20">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500 transition-all duration-500 shadow-md"
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-[#91a0c0]">
            <span>Elapsed: {progressPct}%</span>
            <span>Target: {mode === 'focus' ? '25:00' : '05:00'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black text-white shadow-2xl transition-all hover:scale-105 flex items-center space-x-2 ${
              isRunning
                ? 'bg-gradient-to-r from-red-600 to-rose-600'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Pause Timer' : 'Initiate Arc Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-[#182038] hover:bg-[#202a4a] text-[#00f0ff] transition-all hover:scale-105 border border-[#00f0ff]/30"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Footer */}
        <div className="inline-flex items-center space-x-4 pt-4 border-t border-[#00f0ff]/20 text-xs font-bold text-[#91a0c0]">
          <span className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{sessionsCount} Focus Sessions Today</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-[#00f0ff]">
            <Award className="w-4 h-4" />
            <span>Akash's Productivity Level: Maximum</span>
          </span>
        </div>
      </div>
    </div>
  );
};
