import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Flame, Zap, Award, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const PomodoroTimer: React.FC = () => {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(' ')[0] || 'Akash';

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
      <div className="rounded-3xl border border-amber-300 bg-white p-8 shadow-md space-y-6 text-center">
        {/* Mode Switcher Pills */}
        <div className="inline-flex p-1.5 rounded-2xl bg-amber-50 border border-amber-200 space-x-2">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white shadow-md scale-105'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>25m Arc Focus</span>
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>5m Recharge</span>
          </button>
        </div>

        {/* Timer Countdown Display */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-60 h-60 rounded-full border-8 border-amber-400 bg-amber-50/50 flex flex-col items-center justify-center relative shadow-lg">
            <div className="text-5xl font-black tracking-tight text-red-600 font-mono animate-count-pulse">
              {formattedTime}
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 mt-2 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-amber-600 inline" />
              <span>{mode === 'focus' ? '🎯 Arc Focus Online' : '☕ Recharge Mode'}</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-1">
          <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200">
            <div
              style={{ width: `${progressPct}%` }}
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 transition-all duration-500 shadow-sm"
            />
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
            <span>Elapsed: {progressPct}%</span>
            <span>Target: {mode === 'focus' ? '25:00' : '05:00'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 pt-2">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl text-sm font-black text-white shadow-lg transition-all hover:scale-105 flex items-center space-x-2 ${
              isRunning
                ? 'bg-gradient-to-r from-zinc-700 to-zinc-900'
                : 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Pause Timer' : 'Initiate Arc Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-zinc-100 hover:bg-amber-100 text-amber-700 transition-all hover:scale-105 border border-zinc-200"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Footer */}
        <div className="inline-flex items-center space-x-4 pt-4 border-t border-zinc-200 text-xs font-bold text-zinc-600">
          <span className="flex items-center space-x-1">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{sessionsCount} Focus Sessions Today</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-red-600">
            <Award className="w-4 h-4" />
            <span>{firstName}'s Productivity Level: Maximum</span>
          </span>
        </div>
      </div>
    </div>
  );
};
