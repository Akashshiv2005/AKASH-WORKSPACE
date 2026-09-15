import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Zap, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/client';

export const ServerHealthBanner: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'waking_up' | 'offline'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 30000 });
      if (res.status === 200) {
        setStatus('connected');
        setRetryCount(0);
      }
    } catch {
      setRetryCount((prev) => {
        const next = prev + 1;
        if (next >= 15) {
          setStatus('offline');
        } else {
          setStatus('waking_up');
        }
        return next;
      });
    }
  }, []);

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Periodic keep-alive ping every 5 minutes while active
    const keepAliveInterval = setInterval(() => {
      axios.get(`${API_BASE_URL}/health/ping`).catch(() => {});
    }, 5 * 60 * 1000);

    return () => clearInterval(keepAliveInterval);
  }, [checkHealth]);

  // Auto retry loop if server is waking up (up to 15 attempts)
  useEffect(() => {
    if (status === 'waking_up' && retryCount < 15) {
      const timer = setTimeout(() => {
        checkHealth();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, retryCount, checkHealth]);

  if (status === 'connected' || isDismissed) {
    return null; // Silent when connected or dismissed
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs shadow-md border-b border-orange-400 flex items-center justify-between z-50 animate-fade-in">
      <div className="flex items-center space-x-2 min-w-0">
        <Zap className="w-4 h-4 animate-bounce text-yellow-200 shrink-0" />
        <span className="font-bold truncate">
          {status === 'checking' && 'Checking backend status...'}
          {status === 'waking_up' && (
            <>
              Render backend waking up from sleep mode... Attempt {retryCount}/15 (~30s free tier delay)
            </>
          )}
          {status === 'offline' && 'Backend connection offline. Click retry to reconnect.'}
        </span>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={() => {
            setRetryCount(0);
            setStatus('checking');
            checkHealth();
          }}
          className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${status === 'waking_up' ? 'animate-spin' : ''}`} />
          <span>Retry</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/20 rounded transition-colors text-white/80 hover:text-white"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
