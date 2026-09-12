import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  Key,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Calendar,
  ListTodo,
  Sparkles
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useHabitStore } from '../../store/useHabitStore';

export const EmailNotificationModal: React.FC = () => {
  const {
    settings,
    isModalOpen,
    isLoading,
    isSending,
    statusMessage,
    setModalOpen,
    fetchSettings,
    updateSettings,
    sendTestEmail,
    sendDailyDigest,
    setStatusMessage,
  } = useNotificationStore();

  const { tasks } = useTaskStore();
  const { habits } = useHabitStore();

  // Local Form State
  const [recipientEmail, setRecipientEmail] = useState('akashshiv2005@gmail.com');
  const [isEnabled, setIsEnabled] = useState(true);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  // Calculate live preview stats
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0=Mon, 6=Sun
  const activeTasks = tasks.filter((t) => !t.is_archived);
  const pendingTasks = activeTasks.filter((t) => t.status.toLowerCase() !== 'done');
  const activeHabits = habits.filter((h) => !h.is_archived);
  const habitsDoneToday = activeHabits.filter((h) => {
    const days = h.completedDays || (h as any).completed_days;
    return Array.isArray(days) && days[todayIdx];
  });

  useEffect(() => {
    if (isModalOpen) {
      fetchSettings();
    }
  }, [isModalOpen, fetchSettings]);

  useEffect(() => {
    if (settings) {
      setRecipientEmail(settings.recipient_email || 'akashshiv2005@gmail.com');
      setIsEnabled(settings.is_enabled);
      setPendingOnly(settings.notify_if_pending_only);
    }
  }, [settings]);

  if (!isModalOpen) return null;

  const handleSave = async () => {
    await updateSettings({
      recipient_email: recipientEmail,
      is_enabled: isEnabled,
      notify_if_pending_only: pendingOnly,
      custom_smtp_user: smtpUser || undefined,
      custom_smtp_password: smtpPassword || undefined,
    });
  };

  const handleSendTest = async () => {
    await sendTestEmail(recipientEmail, smtpUser, smtpPassword);
  };

  const handleSendDigest = async () => {
    await sendDailyDigest(recipientEmail, smtpUser, smtpPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1f1e1d] rounded-2xl shadow-2xl border border-[#e7dfd5] dark:border-[#383531] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#f0e8dc] dark:border-[#2e2b27] bg-[#fdfaf6] dark:bg-[#262422] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff7a00] to-[#ff9500] text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1c1917] dark:text-[#f2ebe1] flex items-center space-x-1.5">
                <span>Gmail Task & Habit Reminders</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#ff7a00]/10 text-[#ff7a00]">
                  Live
                </span>
              </h2>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                Never forget a task. Receive daily summaries directly to your inbox.
              </p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-1.5 rounded-lg text-[#78716c] hover:bg-[#ebd5b3] dark:hover:bg-[#383531] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Today's Productivity Snapshot */}
          <div className="bg-[#f9f6f0] dark:bg-[#282624] p-4 rounded-xl border border-[#eee6db] dark:border-[#383531]">
            <div className="text-xs font-bold text-[#57534e] dark:text-[#a8a29e] mb-2.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Today's Live Snapshot</span>
              </span>
              <span className="text-[11px] font-normal text-[#78716c]">Will be included in digest</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white dark:bg-[#1f1e1d] rounded-lg border border-[#e7dfd5] dark:border-[#33302c]">
                <div className="text-[11px] text-[#78716c] flex items-center space-x-1">
                  <ListTodo className="w-3 h-3 text-[#ff7a00]" />
                  <span>Pending Tasks</span>
                </div>
                <div className="text-lg font-black text-[#1c1917] dark:text-[#f2ebe1] mt-0.5 flex items-center space-x-1.5">
                  <span className={pendingTasks.length > 0 ? 'text-[#ff7a00]' : 'text-emerald-600'}>
                    {pendingTasks.length}
                  </span>
                  <span className="text-xs font-normal text-[#78716c]">of {activeTasks.length} total</span>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#1f1e1d] rounded-lg border border-[#e7dfd5] dark:border-[#33302c]">
                <div className="text-[11px] text-[#78716c] flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Habits Done Today</span>
                </div>
                <div className="text-lg font-black text-emerald-600 mt-0.5 flex items-center space-x-1.5">
                  <span>{habitsDoneToday.length}</span>
                  <span className="text-xs font-normal text-[#78716c]">of {activeHabits.length} habits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Recipient Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#44403c] dark:text-[#d6d3d1] flex items-center space-x-1.5">
              <span>Recipient Gmail Address</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#fdfaf6] dark:bg-[#262422] border border-[#e7dfd5] dark:border-[#383531] rounded-xl text-sm text-[#1c1917] dark:text-[#f2ebe1] placeholder-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#ff7a00] transition-all"
              />
              <Mail className="w-4 h-4 text-[#a8a29e] absolute right-3.5 top-3" />
            </div>
            <p className="text-[11px] text-[#78716c] dark:text-[#a8a29e]">
              Daily reminders and task alert digests will be delivered here.
            </p>
          </div>

          {/* Notification Options */}
          <div className="space-y-3 pt-1">
            {/* Toggle Daily Reminders */}
            <div className="flex items-center justify-between p-3.5 bg-[#fdfaf6] dark:bg-[#262422] rounded-xl border border-[#e7dfd5] dark:border-[#383531]">
              <div>
                <div className="text-xs font-bold text-[#1c1917] dark:text-[#f2ebe1]">
                  Enable Daily Email Reminders
                </div>
                <div className="text-[11px] text-[#78716c] dark:text-[#a8a29e]">
                  Dispatches daily digest automatically every evening at 8:00 PM IST
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEnabled ? 'bg-[#ff7a00]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle Pending Tasks Only */}
            <div className="flex items-center justify-between p-3.5 bg-[#fdfaf6] dark:bg-[#262422] rounded-xl border border-[#e7dfd5] dark:border-[#383531]">
              <div>
                <div className="text-xs font-bold text-[#1c1917] dark:text-[#f2ebe1]">
                  Alert Only If Incomplete
                </div>
                <div className="text-[11px] text-[#78716c] dark:text-[#a8a29e]">
                  Skip email if all tasks and habits are 100% completed today
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingOnly(!pendingOnly)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  pendingOnly ? 'bg-[#ff7a00]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    pendingOnly ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Collapsible SMTP App Password Guide & Override */}
          <div className="border border-[#e7dfd5] dark:border-[#383531] rounded-xl overflow-hidden">
            <button
              onClick={() => setShowSmtpConfig(!showSmtpConfig)}
              className="w-full p-3 bg-[#fdfaf6] dark:bg-[#262422] flex items-center justify-between text-xs font-bold text-[#44403c] dark:text-[#d6d3d1] hover:bg-[#f5ede0] transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Key className="w-3.5 h-3.5 text-[#ff7a00]" />
                <span>Gmail SMTP & App Password Guide</span>
              </span>
              {showSmtpConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSmtpConfig && (
              <div className="p-4 bg-white dark:bg-[#1f1e1d] space-y-4 text-xs">
                {/* 3 Step Instructions */}
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-[#78350f] dark:text-amber-200 space-y-1.5">
                  <div className="font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>How to configure Gmail SMTP (30 seconds):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-[#92400e] dark:text-amber-300">
                    <li>
                      Visit{' '}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline inline-flex items-center space-x-0.5 text-[#ff7a00]"
                      >
                        <span>myaccount.google.com/apppasswords</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                      </a>
                    </li>
                    <li>Create an App Password named <b>"Akash Workspace"</b>.</li>
                    <li>Copy the 16-character password and paste it below or set <code>GMAIL_APP_PASSWORD</code> on Render.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#78716c]">Sender Gmail Address</label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="e.g. akashshiv2005@gmail.com"
                      className="w-full mt-1 px-3 py-2 bg-[#fdfaf6] dark:bg-[#262422] border border-[#e7dfd5] dark:border-[#383531] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#78716c]">16-Character Google App Password</label>
                    <input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full mt-1 px-3 py-2 bg-[#fdfaf6] dark:bg-[#262422] border border-[#e7dfd5] dark:border-[#383531] rounded-lg text-xs tracking-widest font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#f0e8dc] dark:border-[#2e2b27] bg-[#fdfaf6] dark:bg-[#262422] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTest}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl border border-[#e7dfd5] dark:border-[#383531] hover:bg-[#ebd5b3] dark:hover:bg-[#33302c] text-xs font-bold text-[#44403c] dark:text-[#d6d3d1] transition-all flex items-center space-x-1.5 disabled:opacity-50"
              title="Sends a test email to verify Gmail connection"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Email</span>
            </button>

            <button
              onClick={handleSendDigest}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-bold text-[#ff7a00] transition-all flex items-center space-x-1.5 disabled:opacity-50"
              title="Immediately compiles today's tasks and sends the live digest"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff7a00]" /> : <Mail className="w-3.5 h-3.5" />}
              <span>Send Digest Now</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#78716c] hover:bg-[#ebd5b3] transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9500] hover:from-[#e66e00] hover:to-[#e68600] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
