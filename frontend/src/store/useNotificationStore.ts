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
    const targetEmail = (email || get().settings?.recipient_email || 'akashsivalingam5@gmail.com').trim();
    try {
      const res = await apiClient.post('/notifications/test-email', {
        recipient_email: targetEmail,
        smtp_user: smtpUser || undefined,
        smtp_password: smtpPass || undefined,
      });
      const data = res.data;

      // If backend failed (e.g. Render port block), try Vercel Serverless Relay directly
      if (!data.success && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        try {
          const relayRes = await fetch('/api/email-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetEmail,
              subject: '✨ Akash Workspace - Gmail Integration Test',
              html: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1c1917; background-color: #fdfaf6; border-radius: 12px; border: 1px solid #ebd5b3;">
                <div style="background: linear-gradient(135deg, #ff7a00, #ff9500); padding: 20px; border-radius: 10px; color: white;">
                  <h2 style="margin: 0 0 8px 0;">🚀 Gmail Notification Connected!</h2>
                  <p style="margin: 0; opacity: 0.95;">Your Gmail integration for Akash Workspace is configured properly.</p>
                </div>
                <p style="margin-top: 16px; font-size: 14px; color: #44403c; line-height: 1.6;">
                  You will receive daily reminders if you forget tasks or to review your daily habits.
                </p>
                <p style="font-size: 12px; color: #78716c; margin-top: 16px;">Delivered directly to: <b>${targetEmail}</b></p>
              </div>`,
              smtpUser: smtpUser || undefined,
              smtpPass: smtpPass || undefined,
            }),
          });
          const relayData = await relayRes.json();
          if (relayData.success) {
            set({
              statusMessage: {
                type: 'success',
                text: `✨ Test email successfully delivered to ${targetEmail}! Please check your inbox or spam folder.`,
              },
            });
            get().fetchLogs();
            return { success: true, message: relayData.message };
          }
        } catch {
          // Fall through to display backend message
        }
      }

      set({
        statusMessage: {
          type: data.success ? 'success' : 'error',
          text: data.success
            ? `✨ Test email sent successfully to ${targetEmail}! Please check your inbox or spam folder.`
            : data.message,
        },
      });
      get().fetchLogs();
      return data;
    } catch (err: any) {
      // If backend network error, attempt direct Vercel relay
      if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
        try {
          const relayRes = await fetch('/api/email-relay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetEmail,
              subject: '✨ Akash Workspace - Gmail Integration Test',
              html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>🚀 Gmail Connected!</h2><p>Delivered to: <b>${targetEmail}</b></p></div>`,
              smtpUser: smtpUser || undefined,
              smtpPass: smtpPass || undefined,
            }),
          });
          const relayData = await relayRes.json();
          if (relayData.success) {
            set({
              statusMessage: {
                type: 'success',
                text: `✨ Test email successfully delivered to ${targetEmail}! Please check your inbox.`,
              },
            });
            return { success: true, message: relayData.message };
          }
        } catch {}
      }
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
    const targetEmail = (email || get().settings?.recipient_email || 'akashsivalingam5@gmail.com').trim();
    try {
      const res = await apiClient.post('/notifications/send-digest', {
        recipient_email: targetEmail,
        smtp_user: smtpUser || undefined,
        smtp_password: smtpPass || undefined,
        force: true,
      });
      const data = res.data;
      set({
        statusMessage: {
          type: data.success ? 'success' : 'error',
          text: data.success
            ? `Daily digest sent to ${targetEmail}! Check your inbox.`
            : data.message,
        },
      });
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
