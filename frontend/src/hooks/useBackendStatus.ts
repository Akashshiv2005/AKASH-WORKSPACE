import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/client';

export type BackendStatus = 'live' | 'waking_up' | 'offline';

export const useBackendStatus = () => {
  const [status, setStatus] = useState<BackendStatus>('waking_up');

  const checkStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/health/ping`, { timeout: 8000 });
      if (res.status === 200) {
        setStatus('live');
      } else {
        setStatus('waking_up');
      }
    } catch {
      // Fallback try direct Render ping URL
      try {
        const pingRes = await fetch('https://akash-workspace.onrender.com/api/health/ping', {
          method: 'GET',
          cache: 'no-store',
        });
        if (pingRes.ok) {
          setStatus('live');
        } else {
          setStatus('waking_up');
        }
      } catch {
        setStatus((prev) => (prev === 'live' ? 'waking_up' : 'waking_up'));
      }
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Check status every 15 seconds to maintain real-time backend status
    const interval = setInterval(checkStatus, 15000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, recheck: checkStatus };
};
