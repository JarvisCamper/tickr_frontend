"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';

type StoredTimer = {
  elapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  lastStart: number | null; // ms
};

const STORAGE_KEY = 'tickr_timer_state';
const EMPTY_TIMER: StoredTimer = { elapsed: 0, isRunning: false, isPaused: false, lastStart: null };

const readStoredTimer = (): StoredTimer => {
  try {
    if (typeof window === 'undefined') return EMPTY_TIMER;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_TIMER;
    const parsed = JSON.parse(raw) as StoredTimer;
    return {
      elapsed: parsed.elapsed || 0,
      isRunning: !!parsed.isRunning,
      isPaused: !!parsed.isPaused,
      lastStart: parsed.lastStart || null,
    };
  } catch {
    return EMPTY_TIMER;
  }
};

const getDisplayTime = (stored: StoredTimer): number => {
  if (stored.isRunning && !stored.isPaused && stored.lastStart) {
    return stored.elapsed + Math.floor((Date.now() - stored.lastStart) / 1000);
  }
  return stored.elapsed;
};

export function useTimer() {
  const [initialStored] = useState(readStoredTimer);
  const [totalTime, setTotalTime] = useState(() => getDisplayTime(initialStored)); // Displayed time (ticks live when running)
  const [elapsed, setElapsed] = useState(initialStored.elapsed); // Accumulated on pause (for persistence)
  const [isRunning, setIsRunning] = useState(initialStored.isRunning);
  const [isPaused, setIsPaused] = useState(initialStored.isPaused);
  const [lastStart, setLastStart] = useState<number | null>(initialStored.lastStart); // ms
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const persist = useCallback((state?: Partial<StoredTimer>) => {
    const toSave: StoredTimer = {
      elapsed: state?.elapsed ?? elapsed,
      isRunning: state?.isRunning ?? isRunning,
      isPaused: state?.isPaused ?? isPaused,
      lastStart: state?.lastStart ?? lastStart,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  }, [elapsed, isRunning, isPaused, lastStart]);

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

    // Set local state (totalTime starts ticking from computed)
    setElapsed(computed);
    setTotalTime(computed);
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
    setTotalTime(newElapsed);
    setLastStart(null);
    setIsPaused(true);
    persist({ elapsed: newElapsed, isPaused: true, lastStart: null });
  };

  const resumeTimer = () => {
    if (!isRunning || !isPaused) return;
    const now = Date.now();
    // On resume, reset totalTime to current elapsed (pause accumulated it)
    setTotalTime(elapsed);
    setLastStart(now);
    setIsPaused(false);
    persist({ lastStart: now, isPaused: false });
  };

  const stopTimer = () => {
    if (!isRunning) return;
    const now = Date.now();
    const added = (!isPaused && lastStart) ? Math.floor((now - lastStart) / 1000) : 0;
    const finalElapsed = elapsed + added;

    // Freeze display at final
    setTotalTime(finalElapsed);
    setElapsed(finalElapsed);

    setIsRunning(false);
    setIsPaused(false);
    setLastStart(null);
    persist({ elapsed: finalElapsed, isRunning: false, isPaused: false, lastStart: null });

    // Clear stored state (reset) after a short delay so user sees final value briefly
    setTimeout(() => {
      setElapsed(0);
      setTotalTime(0);
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

  // Timer interval for live ticking when running and not paused.
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  // Persist changes when relevant values change
  useEffect(() => {
    persist();
  }, [persist, elapsed, isRunning, isPaused, lastStart]);

  return {
    time: totalTime,
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
