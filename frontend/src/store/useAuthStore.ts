import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  isLoading: boolean;
  error: string | null;

  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  fetchCurrentUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_USER: User = {
  id: 'user-akash-shiv',
  email: 'akash.shiv@workspace.ai',
  full_name: 'Akash Shiv',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_USER,
  isAuthenticated: true,
  isAuthModalOpen: false,
  authMode: 'login',
  isLoading: false,
  error: null,

  setAuthModalOpen: (open, mode = 'login') =>
    set({ isAuthModalOpen: open, authMode: mode, error: null }),

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: DEFAULT_USER, isAuthenticated: true });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await apiClient.get<User>('/auth/me');
      set({ user: res.data, isAuthenticated: true, error: null });
    } catch {
      set({ user: DEFAULT_USER, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      set({ isAuthenticated: true, isAuthModalOpen: false, error: null });
      const userRes = await apiClient.get<User>('/auth/me');
      set({ user: userRes.data });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Invalid email or password';
      set({ error: message, isAuthenticated: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  registerUser: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      const { access_token, refresh_token } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      set({ isAuthenticated: true, isAuthModalOpen: false, error: null });
      const userRes = await apiClient.get<User>('/auth/me');
      set({ user: userRes.data });
      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed';
      set({ error: message, isAuthenticated: false });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: DEFAULT_USER, isAuthenticated: true });
  },
}));
