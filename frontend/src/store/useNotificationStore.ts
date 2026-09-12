import { create } from 'zustand';
import { apiClient } from '../api/client';

export interface NotificationSettings {
  id: string;
  workspace_id: string;
  recipient_email: string;
  is_enabled: boolean;
  notify_if_pending_only: boolean;
  has_custom_smtp: boolean;
  last_sent_at?: string | null;
}

interface NotificationState {
  settings: NotificationSettings | null;
  isModalOpen: boolean;
  isLoading: boolean;
  isSending: boolean;
  statusMessage: { type: 'success' | 'error' | 'info'; text: string } | null;

  setModalOpen: (open: boolean) => void;
  setStatusMessage: (msg: { type: 'success' | 'error' | 'info'; text: string } | null) => void;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: {
    recipient_email?: string;
    is_enabled?: boolean;
    notify_if_pending_only?: boolean;
    custom_smtp_user?: string;
    custom_smtp_password?: string;
  }) => Promise<boolean>;
  sendTestEmail: (email: string, smtpUser?: string, smtpPass?: string) => Promise<{ success: boolean; message: string }>;
  sendDailyDigest: (email?: string, smtpUser?: string, smtpPass?: string) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  id: 'default',
  workspace_id: 'default-workspace',
  recipient_email: 'akashshiv2005@gmail.com',
  is_enabled: true,
  notify_if_pending_only: false,
  has_custom_smtp: false,
  last_sent_at: null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isModalOpen: false,
  isLoading: false,
  isSending: false,
  statusMessage: null,

  setModalOpen: (open) => set({ isModalOpen: open, statusMessage: null }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get<NotificationSettings>('/notifications/settings');
      if (res.data) {
        set({ settings: res.data });
      }
    } catch {
      // Fallback to default
      set({ settings: DEFAULT_SETTINGS });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<NotificationSettings>('/notifications/settings', data);
      set({ settings: res.data });
      set({
        statusMessage: {
          type: 'success',
          text: 'Notification preferences saved successfully!',
        },
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to save settings';
      set({ statusMessage: { type: 'error', text: msg } });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  sendTestEmail: async (email, smtpUser, smtpPass) => {
    set({ isSending: true, statusMessage: null });
    try {
      const res = await apiClient.post('/notifications/test-email', {
        recipient_email: email,
        smtp_user: smtpUser || undefined,
        smtp_password: smtpPass || undefined,
      });
      const data = res.data;
      set({
        statusMessage: {
          type: data.success ? 'success' : 'error',
          text: data.message,
        },
      });
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to trigger test email';
      set({ statusMessage: { type: 'error', text: msg } });
      return { success: false, message: msg };
    } finally {
      set({ isSending: false });
    }
  },

  sendDailyDigest: async (email, smtpUser, smtpPass) => {
    set({ isSending: true, statusMessage: null });
    try {
      const res = await apiClient.post('/notifications/send-digest', {
        recipient_email: email || undefined,
        smtp_user: smtpUser || undefined,
        smtp_password: smtpPass || undefined,
        force: true,
      });
      const data = res.data;
      set({
        statusMessage: {
          type: data.success ? 'success' : 'error',
          text: data.message,
        },
      });
      // Refresh settings to update last_sent_at
      get().fetchSettings();
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to dispatch daily digest';
      set({ statusMessage: { type: 'error', text: msg } });
      return { success: false, message: msg };
    } finally {
      set({ isSending: false });
    }
  },
}));
