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

export interface EmailLog {
  id: string;
  workspace_id?: string | null;
  recipient_email: string;
  subject: string;
  email_type: string;
  status: 'sent' | 'failed' | string;
  details?: string | null;
  error_message?: string | null;
  sent_at: string;
}

interface NotificationState {
  settings: NotificationSettings | null;
  emailLogs: EmailLog[];
  isModalOpen: boolean;
  isLoading: boolean;
  isLoadingLogs: boolean;
  isSending: boolean;
  statusMessage: { type: 'success' | 'error' | 'info'; text: string } | null;

  setModalOpen: (open: boolean) => void;
  setStatusMessage: (msg: { type: 'success' | 'error' | 'info'; text: string } | null) => void;
  fetchSettings: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  clearLogs: () => Promise<boolean>;
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
  recipient_email: '',
  is_enabled: true,
  notify_if_pending_only: false,
  has_custom_smtp: false,
  last_sent_at: null,
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  emailLogs: [],
  isModalOpen: false,
  isLoading: false,
  isLoadingLogs: false,
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

  fetchLogs: async () => {
    set({ isLoadingLogs: true });
    try {
      const res = await apiClient.get<EmailLog[]>('/notifications/logs?limit=50');
      if (res.data) {
        set({ emailLogs: res.data });
      }
    } catch {
      set({ emailLogs: [] });
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  clearLogs: async () => {
    try {
      await apiClient.delete('/notifications/logs');
      set({ emailLogs: [] });
      return true;
    } catch {
      return false;
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
      // Refresh logs right away to show in the logs section
      get().fetchLogs();
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to trigger test email';
      set({ statusMessage: { type: 'error', text: msg } });
      get().fetchLogs();
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
      // Refresh settings to update last_sent_at and refresh logs
      get().fetchSettings();
      get().fetchLogs();
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to dispatch daily digest';
      set({ statusMessage: { type: 'error', text: msg } });
      get().fetchLogs();
      return { success: false, message: msg };
    } finally {
      set({ isSending: false });
    }
  },
}));
