import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authMode,
    setAuthModalOpen,
    login,
    registerUser,
    isLoading,
    error,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await login(email, password);
    } else {
      await registerUser(email, password, fullName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-fade-in-up">
      <div className="w-full max-w-md bg-white dark:bg-[#201c2e] border border-purple-500/30 rounded-3xl shadow-2xl p-7 text-[#37352f] dark:text-[#e6e6e6] relative">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-[#efefee] dark:hover:bg-[#2e2744] text-[#787774] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl animate-float">
            N
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#37352f] dark:text-white">
            {authMode === 'login' ? 'Welcome Back' : 'Create Notion Account'}
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#9b9b9b]">
            {authMode === 'login'
              ? 'Sign in to access your workspaces & pages'
              : 'Start organizing your thoughts and workspace'}
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold mb-1 text-[#787774] dark:text-[#9b9b9b]">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#787774] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1 text-[#787774] dark:text-[#9b9b9b]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#787774] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-[#787774] dark:text-[#9b9b9b]">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#787774] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#f7f7f5] dark:bg-[#1a1726] border border-[#e9e9e7] dark:border-[#372e50] rounded-xl text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Switch Auth Mode Footer */}
        <div className="mt-6 text-center text-xs text-[#787774]">
          {authMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setAuthModalOpen(true, 'register')}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setAuthModalOpen(true, 'login')}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
