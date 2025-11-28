"use client";
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

type StoredTimer = {
  elapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  lastStart: number | null; // ms
};

const STORAGE_KEY = 'tickr_timer_state';

export function useTimer() {
  const [time, setTime] = useState(0);
  const [elapsed, setElapsed] = useState(0); // accumulated seconds when not counting
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastStart, setLastStart] = useState<number | null>(null); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const readStored = (): StoredTimer => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { elapsed: 0, isRunning: false, isPaused: false, lastStart: null };
      const parsed = JSON.parse(raw) as StoredTimer;
      return {
        elapsed: parsed.elapsed || 0,
        isRunning: !!parsed.isRunning,
        isPaused: !!parsed.isPaused,
        lastStart: parsed.lastStart || null,
      };
    } catch (err) {
      return { elapsed: 0, isRunning: false, isPaused: false, lastStart: null };
    }
  };

  const persist = (state?: Partial<StoredTimer>) => {
    const toSave: StoredTimer = {
      elapsed: state?.elapsed ?? elapsed,
      isRunning: state?.isRunning ?? isRunning,
      isPaused: state?.isPaused ?? isPaused,
      lastStart: state?.lastStart ?? lastStart,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      // ignore
    }
  };

  const computeCurrentElapsed = () => {
    if (isRunning && !isPaused && lastStart) {
      return elapsed + Math.floor((Date.now() - lastStart) / 1000);
    }
    return elapsed;
  };

  const startTimer = (serverStartedAt?: string | number) => {
    // Compute values synchronously so we can persist the exact start state (avoid setState timing races)
    const nowMs = Date.now();
    let computed = 0;
    if (serverStartedAt) {
      const startedMs = typeof serverStartedAt === 'number' ? serverStartedAt : Date.parse(String(serverStartedAt));
      if (!Number.isNaN(startedMs)) {
        computed = Math.floor((nowMs - startedMs) / 1000);
      } else {
        computed = 0;
      }
    } else {
      computed = 0;
    }

    // Set local state
    setElapsed(computed);
    setLastStart(nowMs);
    setIsRunning(true);
    setIsPaused(false);

    // Persist the exact values we just computed
    persist({ elapsed: computed, isRunning: true, isPaused: false, lastStart: nowMs });
  };

  const pauseTimer = () => {
    if (!isRunning || isPaused) return;
    const now = Date.now();
    const added = lastStart ? Math.floor((now - lastStart) / 1000) : 0;
    const newElapsed = elapsed + added;
    setElapsed(newElapsed);
    setLastStart(null);
    setIsPaused(true);
    persist({ elapsed: newElapsed, isPaused: true, lastStart: null });
  };

  const resumeTimer = () => {
    if (!isRunning || !isPaused) return;
    setLastStart(Date.now());
    setIsPaused(false);
    persist({ lastStart: Date.now(), isPaused: false });
  };

  const stopTimer = () => {
    if (!isRunning) return;
    const now = Date.now();
    const added = (!isPaused && lastStart) ? Math.floor((now - lastStart) / 1000) : 0;
    const finalElapsed = elapsed + added;

    // show final elapsed immediately
    setElapsed(finalElapsed);
    setTime(finalElapsed);

    setIsRunning(false);
    setIsPaused(false);
    setLastStart(null);
    persist({ elapsed: finalElapsed, isRunning: false, isPaused: false, lastStart: null });

    // Clear stored state (reset) after a short delay so user sees final value briefly
    setTimeout(() => {
      setElapsed(0);
      setTime(0);
      persist({ elapsed: 0, isRunning: false, isPaused: false, lastStart: null });
    }, 1200);
  };

  const getAuthHeaders = (): HeadersInit => {
    const token = Cookies.get('access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Restore from storage on mount
  useEffect(() => {
    try {
      const stored = readStored();
      setElapsed(stored.elapsed || 0);
      setIsRunning(stored.isRunning || false);
      setIsPaused(stored.isPaused || false);
      setLastStart(stored.lastStart || null);
      // compute displayed time immediately
      if (stored.isRunning && stored.lastStart) {
        const computed = stored.elapsed + Math.floor((Date.now() - stored.lastStart) / 1000);
        setTime(computed);
      } else {
        setTime(stored.elapsed || 0);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Timer interval for live ticking when running and not paused
  useEffect(() => {
    if (isRunning && !isPaused) {
      // ensure any prior interval is cleared
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = setInterval(() => {
        setTime(computeCurrentElapsed());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // ensure displayed time reflects current elapsed
      setTime(computeCurrentElapsed());
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, elapsed, lastStart]);

  // Persist changes when relevant values change
  useEffect(() => {
    persist();
  }, [elapsed, isRunning, isPaused, lastStart]);

  return {
    time,
    isRunning,
    isPaused,
    formatTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getAuthHeaders,
  };
}